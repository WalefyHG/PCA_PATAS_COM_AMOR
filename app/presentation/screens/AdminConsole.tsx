"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    RefreshControl,
    Platform,
    Animated,
    ActivityIndicator,
    Modal,
} from "react-native"
import { useThemeContext } from "../contexts/ThemeContext"
import { Feather, FontAwesome } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useTranslation } from "react-i18next"
import { isUserAdmin } from "../../data/datasources/firebase/firebase"

import { getBlogPosts, deleteBlogPost, type BlogPost } from "../../repositories/FirebaseBlogRepository"

import { getPets, deletePet, type Pet } from "../../repositories/FirebasePetRepository"

import { getUsers, deleteUserProfile } from "../../repositories/FirebaseUserRepository"

import type { UserProfile } from "../../domain/entities/User"
import type { Donation } from "../../domain/entities/Ongs"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import { asaasService } from "../../repositories/AsaasRepository"

import { auth } from "../../data/datasources/firebase/firebase"
import HeaderLayout from "../../utils/HeaderLayout"
import { ConfirmModal } from "../../utils/ConfirmModal"
import { ErrorModal } from "../components/ErrorModal"
import PaymentDetailsModal from "../components/PaymentDetailsModal" // Importar o novo componente
import type { User } from "firebase/auth"
import { Badge } from "@/components/ui/badge"

// Tipos para os dados
interface AdminTab {
    id: string
    title: string
    icon: keyof typeof Feather.glyphMap
}

interface PaymentDetails {
    id: string
    status: string
    value: number
    paymentDate?: string
    clientPaymentDate?: string
    description?: string
    invoiceUrl?: string
    bankSlipUrl?: string
    transactionReceiptUrl?: string
}

export default function AdminConsole() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const [activeTab, setActiveTab] = useState<string>("blog")
    const [refreshing, setRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null)

    const { t } = useTranslation()

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    // Dados
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [pets, setPets] = useState<Pet[]>([])
    const [users, setUsers] = useState<UserProfile[]>([])
    const [donations, setDonations] = useState<Donation[]>([])

    // Estados do ErrorModal
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: "",
        message: "",
        type: "error" as "error" | "success" | "warning" | "info",
    })

    // Estados para transferências
    const [transferLoading, setTransferLoading] = useState<string | null>(null)
    const [asaasBalance, setAsaasBalance] = useState<number | null>(null)

    // Estados para detalhes do pagamento
    const [paymentDetailsModalVisible, setPaymentDetailsModalVisible] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<PaymentDetails | null>(null)
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null)

    const showError = (message: string, title?: string, type: "error" | "success" | "warning" | "info" = "error") => {
        setErrorModal({
            visible: true,
            title: title || "",
            message,
            type,
        })
    }

    const closeErrorModal = () => {
        setErrorModal({ ...errorModal, visible: false })
    }

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (auth.currentUser) {
                const adminStatus = await isUserAdmin(auth.currentUser.uid)
                setIsAdmin(adminStatus)

                if (!adminStatus) {
                    showError("Apenas administradores podem acessar esta página.", "Acesso Restrito", "warning")
                    setTimeout(() => navigation.goBack(), 3000)
                } else {
                    // Carregar dados iniciais
                    fetchData()
                    // Carregar saldo ASAAS
                    loadAsaasBalance()
                }
            } else {
                showError("Você precisa estar logado para acessar esta página.", "Não Autenticado", "warning")
                setTimeout(() => navigation.goBack(), 3000)
            }
        }

        checkAdminStatus()

        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [navigation])

    useEffect(() => {
        if (isAdmin) {
            fetchData()
        }
    }, [activeTab, isAdmin])

    useEffect(() => {
        if (!isAdmin) {
            const timer = setTimeout(() => {
                navigation.goBack() // ou o nome correto da sua tela inicial
            }, 3000) // 3 segundos

            return () => clearTimeout(timer) // limpa o timer se o componente desmontar antes
        }
    }, [isAdmin, navigation])

    const loadAsaasBalance = async () => {
        try {
            const balance = await asaasService.getBalance()
            setAsaasBalance(balance.balance)
        } catch (error) {
            console.error("Error loading ASAAS balance:", error)
            // Não mostrar erro para não poluir a interface
        }
    }

    const fetchData = async () => {
        setIsLoading(true)

        try {
            if (activeTab === "blog") {
                // Buscar todos os posts (publicados e rascunhos)
                const posts = await getBlogPosts("", 20, false)
                setBlogPosts(posts)
            } else if (activeTab === "pets") {
                // Buscar todos os pets (disponíveis, pendentes e adotados)
                const allPets = await getPets("", "", 20)
                setPets(allPets)
            } else if (activeTab === "users") {
                const allUser = await getUsers(20)
                setUsers(allUser)
            } else if (activeTab === "donations") {
                const allDonations = await ongRepository.getAllDonations()
                setDonations(allDonations)
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab} data:`, error)
            showError(`Ocorreu um erro ao carregar os dados de ${activeTab}.`, "Erro")
        } finally {
            setIsLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchData()
        if (activeTab === "donations") {
            await loadAsaasBalance()
        }
        setRefreshing(false)
    }

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        if (tabId === "donations") {
            loadAsaasBalance()
        }
        fetchData()
    }

    const handleEdit = (id: string, type: string) => {
        if (type === "blog") {
            navigation.navigate("AddBlogPost", { postId: id })
        } else if (type === "pet") {
            navigation.navigate("AddPet", { petId: id })
        } else if (type === "users") {
            navigation.navigate("AddUsers", { userId: id })
        }
    }
    const openDeleteModal = (id: string, type: string) => {
        setItemToDelete({ id, type })
        setModalVisible(true)
    }

    // Função que executa a exclusão
    const handleDelete = async (id: string, type: string) => {
        try {
            if (type === "blog") {
                await deleteBlogPost(id)
                setBlogPosts((prev) => prev.filter((post) => post.id !== id))
            } else if (type === "pet") {
                await deletePet(id)
                setPets((prev) => prev.filter((pet) => pet.id !== id))
            } else if (type === "users") {
                await deleteUserProfile(id)
                setUsers((prev) => prev.filter((user) => user.uid !== id))
            }

            showError(
                `${type === "blog" ? "Post" : type === "pet" ? "Pet" : "Usuário"} excluído com sucesso!`,
                "Sucesso",
                "success",
            )
        } catch (error) {
            console.error("Erro ao excluir:", error)
            showError(`Ocorreu um erro ao excluir o ${type === "blog" ? "post" : "pet"}.`, "Erro")
        } finally {
            setModalVisible(false)
            setItemToDelete(null)
        }
    }

    const handleAdd = () => {
        if (activeTab === "blog") {
            navigation.navigate("AddBlogPost")
        } else if (activeTab === "pets") {
            navigation.navigate("AddPet")
        } else if (activeTab === "users") {
            navigation.navigate("AddUsers")
        }
    }

    const handleTransferDonation = async (donation: Donation, isAsaasAccount: boolean) => {
        if (!donation.id) return

        setTransferLoading(donation.id)

        try {
            if (isAsaasAccount) {
                // Transferência automática via ASAAS
                showError("Iniciando transferência automática...", "Processando", "info")

                const result = await asaasService.processAutomaticTransfer(
                    donation.id,
                    donation.pixKey,
                    donation.amount,
                    `Doação para ${donation.ongName} - ${donation.donorName}`,
                )

                if (result.success) {
                    // Atualizar a doação na lista local
                    setDonations((prev) => prev.map((d) => (d.id === donation.id ? { ...d, status: "paid" as const } : d)))

                    // Recarregar saldo
                    await loadAsaasBalance()

                    showError(result.message, "Transferência Realizada", "success")
                } else {
                    showError(result.message, "Erro na Transferência", "error")
                }
            } else {
                // Marcar como transferido manualmente
                await ongRepository.updateDonationStatus(donation.id, "paid")
                setDonations((prev) => prev.map((d) => (d.id === donation.id ? { ...d, status: "paid" as const } : d)))
                showError("Doação marcada como transferida manualmente.", "Sucesso", "success")
            }
        } catch (error) {
            console.error("Erro ao processar transferência:", error)
            showError("Erro ao processar transferência.", "Erro")
        } finally {
            setTransferLoading(null)
        }
    }

    // Função para sincronizar status com ASAAS
    const handleSyncStatus = async (donation: Donation) => {
        if (!donation.id || !donation.asaasPaymentId) return

        setPaymentLoading(donation.id)

        try {
            const result = await asaasService.syncDonationStatus(donation.id, donation.asaasPaymentId)

            if (result.success) {
                // Recarregar as doações para pegar o status atualizado
                await fetchData()
                showError(result.message, "Status Sincronizado", "success")
            } else {
                showError(result.message, "Erro na Sincronização", "error")
            }
        } catch (error) {
            console.error("Erro ao sincronizar status:", error)
            showError("Erro ao sincronizar status.", "Erro")
        } finally {
            setPaymentLoading(null)
        }
    }

    // Função para ver detalhes do pagamento ASAAS
    const handleViewPaymentDetails = async (donation: Donation) => {
        if (!donation.asaasPaymentId) {
            showError("Esta doação não possui ID de pagamento ASAAS.", "Sem Dados ASAAS", "warning")
            return
        }

        setPaymentLoading(donation.id || "")

        try {
            const result = await asaasService.getPaymentDetails(donation.asaasPaymentId)

            if (result.success && result.payment) {
                setSelectedPayment({
                    id: result.payment.id,
                    status: result.payment.status,
                    value: result.payment.value,
                    paymentDate: result.payment.paymentDate,
                    clientPaymentDate: result.payment.clientPaymentDate,
                    description: result.payment.description,
                    invoiceUrl: result.payment.invoiceUrl,
                    bankSlipUrl: result.payment.bankSlipUrl,
                    transactionReceiptUrl: result.payment.transactionReceiptUrl,
                })
                setPaymentDetailsModalVisible(true) // Abre o novo modal
            } else {
                showError(result.message, "Erro ao Buscar Detalhes", "error")
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes:", error)
            showError("Erro ao buscar detalhes do pagamento.", "Erro")
        } finally {
            setPaymentLoading(null)
        }
    }

    // Função para alterar status manualmente
    const handleChangeStatus = async (donation: Donation, newStatus: "pending" | "paid" | "cancelled") => {
        if (!donation.id) return

        try {
            await ongRepository.updateDonationStatus(donation.id, newStatus)
            setDonations((prev) => prev.map((d) => (d.id === donation.id ? { ...d, status: newStatus } : d)))

            const statusText = newStatus === "paid" ? "Pago" : newStatus === "cancelled" ? "Cancelado" : "Pendente"
            showError(`Status alterado para: ${statusText}`, "Status Atualizado", "success")
        } catch (error) {
            console.error("Erro ao alterar status:", error)
            showError("Erro ao alterar status da doação.", "Erro")
        }
    }

    // Abas do Admin Console
    const tabs: AdminTab[] = [
        { id: "blog", title: "Blog", icon: "book-open" },
        { id: "pets", title: "Pets", icon: "heart" },
        { id: "users", title: "Usuários", icon: "users" },
        { id: "donations", title: "Doações", icon: "dollar-sign" },
        { id: "settings", title: "Configurações", icon: "settings" },
    ]

    if (!isAdmin) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                    className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    Verificando permissões...
                </Text>
            </View>
        )
    }

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header with gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pt-16 pb-4 px-4"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="w-10" />
                </View>
                <View
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 50,
                        flexDirection: "row",
                        alignSelf: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <HeaderLayout title="Profile" />
                </View>
            </LinearGradient>

            {/* ASAAS Balance Header - Apenas na aba de doações */}
            {activeTab === "donations" && asaasBalance !== null && (
                <View
                    className={`${isDarkTheme ? "bg-gray-800" : "bg-white"} px-4 py-3 border-b ${isDarkTheme ? "border-gray-700" : "border-gray-200"}`}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                                <Feather name="dollar-sign" size={16} color="#10B981" />
                            </View>
                            <View>
                                <Text className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                                    Saldo ASAAS Disponível
                                </Text>
                                <Text className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                                    R$  {asaasBalance != null
                                        ? `R$ ${asaasBalance.toFixed(2).replace(".", ",")}`
                                        : "Valor não disponível"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={loadAsaasBalance}>
                            <Feather name="refresh-cw" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Tabs Navigation */}
            <View
                className={`${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => handleTabChange(tab.id)}
                            className={`flex-row items-center mx-2 px-4 py-2 rounded-full ${activeTab === tab.id ? (isDarkTheme ? "bg-gray-700" : "bg-gray-100") : "bg-transparent"
                                }`}
                        >
                            <Feather
                                name={tab.icon}
                                size={18}
                                color={
                                    activeTab === tab.id ? colors.primary : isDarkTheme ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"
                                }
                            />
                            <Text
                                className={`ml-2 font-medium ${activeTab === tab.id
                                    ? isDarkTheme
                                        ? "text-white"
                                        : "text-gray-800"
                                    : isDarkTheme
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {tab.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content Area */}
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text
                            className={`mt-4 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Carregando dados...
                        </Text>
                    </View>
                ) : (
                    <>
                        {activeTab === "blog" && (
                            <FlatList
                                data={blogPosts}
                                keyExtractor={(item) => item.id || ""}
                                contentContainerStyle={{ display: "flex", flexDirection: "column", gap: "1rem", padding: 16 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[colors.primary]}
                                        tintColor={colors.primary}
                                    />
                                }
                                renderItem={({ item, index }) => (
                                    <BlogPostItem
                                        post={item}
                                        index={index}
                                        isDark={isDarkTheme}
                                        colors={colors}
                                        onEdit={() => handleEdit(item.id || "", "blog")}
                                        onDelete={() => openDeleteModal(item.id || "", "blog")}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View className="flex-1 items-center justify-center py-20">
                                        <Feather name="inbox" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                        <Text
                                            className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            Nenhum post encontrado
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        {activeTab === "pets" && (
                            <FlatList
                                data={pets}
                                keyExtractor={(item) => item.id || ""}
                                contentContainerStyle={{ display: "flex", flexDirection: "column", gap: "1rem", padding: 16 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[colors.primary]}
                                        tintColor={colors.primary}
                                    />
                                }
                                renderItem={({ item, index }) => (
                                    <PetItem
                                        pet={item}
                                        index={index}
                                        isDark={isDarkTheme}
                                        colors={colors}
                                        onEdit={() => handleEdit(item.id || "", "pet")}
                                        onDelete={() => openDeleteModal(item.id || "", "pet")}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View className="flex-1 items-center justify-center py-20">
                                        <Feather name="inbox" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                        <Text
                                            className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            Nenhum pet encontrado
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                        {activeTab === "users" && (
                            <FlatList
                                data={users}
                                keyExtractor={(item) => item.uid || ""}
                                contentContainerStyle={{ display: "flex", flexDirection: "column", gap: "1rem", padding: 16 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[colors.primary]}
                                        tintColor={colors.primary}
                                    />
                                }
                                renderItem={({ item, index }) => (
                                    <UserItem
                                        user={item}
                                        index={index}
                                        isDark={isDarkTheme}
                                        colors={colors}
                                        onEdit={() => handleEdit(item.uid || "", "users")}
                                        onDelete={() => openDeleteModal(item.uid || "", "users")}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View className="flex-1 items-center justify-center py-20">
                                        <Feather name="user" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                        <Text
                                            className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            Nenhum usuário encontrado
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        {activeTab === "donations" && (
                            <FlatList
                                data={donations}
                                keyExtractor={(item) => item.id || ""}
                                contentContainerStyle={{ display: "flex", flexDirection: "column", gap: "1rem", padding: 16 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[colors.primary]}
                                        tintColor={colors.primary}
                                    />
                                }
                                renderItem={({ item, index }) => (
                                    <DonationItem
                                        donation={item}
                                        index={index}
                                        isDark={isDarkTheme}
                                        colors={colors}
                                        onTransfer={(isAsaasAccount) => handleTransferDonation(item, isAsaasAccount)}
                                        onSyncStatus={() => handleSyncStatus(item)}
                                        onViewDetails={() => handleViewPaymentDetails(item)}
                                        onChangeStatus={(status) => handleChangeStatus(item, status)}
                                        isLoading={transferLoading === item.id}
                                        isPaymentLoading={paymentLoading === item.id}
                                    />
                                )}
                                ListEmptyComponent={
                                    <View className="flex-1 items-center justify-center py-20">
                                        <Feather name="dollar-sign" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                        <Text
                                            className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            Nenhuma doação encontrada
                                        </Text>
                                    </View>
                                }
                            />
                        )}

                        {activeTab === "settings" && <SettingsPanel isDark={isDarkTheme} colors={colors} />}
                        <ConfirmModal
                            visible={modalVisible}
                            message={`Tem certeza que deseja excluir este ${itemToDelete?.type === "blog" ? "post" : itemToDelete?.type === "pet" ? "pet" : "usuário"
                                }?`}
                            onConfirm={() => handleDelete(itemToDelete?.id || "", itemToDelete?.type || "")}
                            onCancel={() => setModalVisible(false)}
                        />
                    </>
                )}
            </Animated.View>

            {/* Payment Details Modal (using the new component) */}
            <PaymentDetailsModal
                visible={paymentDetailsModalVisible}
                onClose={() => setPaymentDetailsModalVisible(false)}
                payment={selectedPayment}
            />

            {/* Floating Action Button */}
            {activeTab !== "settings" && activeTab !== "donations" && (
                <TouchableOpacity
                    onPress={handleAdd}
                    className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
                    style={{
                        backgroundColor: colors.secondary,
                        ...styles.fabShadow,
                    }}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            )}

            {/* Error Modal */}
            <ErrorModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                type={errorModal.type}
                onClose={closeErrorModal}
            />
        </View>
    )
}

// Blog Post Item Component
interface BlogPostItemProps {
    post: BlogPost
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function BlogPostItem({ post, index, isDark, colors, onEdit, onDelete }: BlogPostItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="flex-row">
                    <Image source={{ uri: post.image }} className="w-24 h-24 object-cover" />
                    <View className="flex-1 p-3 justify-center">
                        <View className="flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={1}
                            >
                                {post.title}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {post.author} •{" "}
                            {post.date instanceof Date
                                ? post.date.toLocaleDateString()
                                : post.date?.toDate?.()?.toLocaleDateString() || "Data não disponível"}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: post.status === "published" ? `${colors.primary}20` : `${colors.error}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: post.status === "published" ? colors.primary : colors.error,
                                    }}
                                >
                                    {post.status === "published" ? "Publicado" : "Rascunho"}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-3 justify-center">
                        <TouchableOpacity onPress={onEdit} className="mb-3">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

// Pet Item Component
interface PetItemProps {
    pet: Pet
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function PetItem({ pet, index, isDark, colors, onEdit, onDelete }: PetItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    const getStatusColor = () => {
        switch (pet.status) {
            case "available":
                return colors.primary
            case "pending":
                return colors.secondary
            case "adopted":
                return colors.success || "#10B981"
            default:
                return colors.primary
        }
    }

    const getStatusText = () => {
        switch (pet.status) {
            case "available":
                return "Disponível"
            case "pending":
                return "Em processo"
            case "adopted":
                return "Adotado"
            default:
                return pet.status
        }
    }

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="flex-row">
                    <Image source={{ uri: pet.images[0] }} className="w-24 h-24 object-cover" />
                    <View className="flex-1 p-3 justify-center">
                        <View className="flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={1}
                            >
                                {pet.name}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {pet.type} • {pet.breed} • {pet.age}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: `${getStatusColor()}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: getStatusColor(),
                                    }}
                                >
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-3 justify-center">
                        <TouchableOpacity onPress={onEdit} className="mb-3">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

interface UserItemProps {
    user: UserProfile | User
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function UserItem({ user, index, isDark, colors, onEdit, onDelete }: UserItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const getLoginIcon = () => {
        if ("logginFormat" in user && user.logginFormat === "google") {
            return (
                <View className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                    <FontAwesome name="google" size={14} color="#EA4335" />
                </View>
            )
        } else {
            return (
                <View className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <Feather name="mail" size={14} color="#1D4ED8" />
                </View>
            )
        }
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={
                    Platform.OS === "ios" ? styles.iosShadow : Platform.OS === "android" ? styles.androidShadow : styles.webShadow
                }
            >
                <View className="flex-row items-center p-4">
                    <Feather name="user" size={36} color={colors.primary} />
                    <View className="flex-1 ml-4">
                        <Text
                            className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                            numberOfLines={1}
                        >
                            {user.displayName || user.email?.split("@")[0] || "Usuário sem nome"}
                        </Text>
                        <Text
                            className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {user.email}
                        </Text>
                        <View className="flex-row items-center mt-2 space-x-2">
                            {getLoginIcon()}
                            <Text className="text-s ml-2 text-muted-foreground">
                                {"logginFormat" in user && user.logginFormat === "google" ? "Login com Google" : "Login com Email"}
                            </Text>
                            {"role" in user && user.role === "admin" && (
                                <Badge style={{ backgroundColor: colors.primary, borderRadius: 50, marginLeft: 8 }}>
                                    <Text className="text-s text-white font-semibold">Admin</Text>
                                </Badge>
                            )}
                        </View>
                    </View>
                    <View className="flex-row space-x-2">
                        <TouchableOpacity onPress={onEdit}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

// Donation Item Component
interface DonationItemProps {
    donation: Donation
    index: number
    isDark: boolean
    colors: any
    onTransfer: (isAsaasAccount: boolean) => void
    onSyncStatus: () => void
    onViewDetails: () => void
    onChangeStatus: (status: "pending" | "paid" | "cancelled") => void
    isLoading?: boolean
    isPaymentLoading?: boolean
}

function DonationItem({
    donation,
    index,
    isDark,
    colors,
    onTransfer,
    onSyncStatus,
    onViewDetails,
    onChangeStatus,
    isLoading = false,
    isPaymentLoading = false,
}: DonationItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    const getStatusColor = () => {
        switch (donation.status) {
            case "paid":
                return "#10B981" // Verde
            case "pending":
                return "#F59E0B" // Amarelo
            case "cancelled":
                return "#EF4444" // Vermelho
            default:
                return colors.primary
        }
    }

    const getStatusText = () => {
        switch (donation.status) {
            case "paid":
                return "Pago"
            case "pending":
                return "Pendente"
            case "cancelled":
                return "Cancelado"
            default:
                return donation.status
        }
    }

    // Verificar se é conta ASAAS (exemplo: se a chave PIX contém "asaas" ou tem formato específico)
    const isAsaasAccount =
        donation.pixKey.toLowerCase().includes("asaas") ||
        donation.pixKey.includes("@asaas.com") ||
        donation.asaasPaymentId !== ""

    const handleStatusChange = (status: "pending" | "paid" | "cancelled") => {
        setShowStatusMenu(false)
        onChangeStatus(status)
    }

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="p-4">
                    {/* Header com valor e status */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Text
                            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            R$ {donation.amount.toFixed(2).replace(".", ",")}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowStatusMenu(true)}
                            className="px-3 py-1 rounded-full"
                            style={{
                                backgroundColor: `${getStatusColor()}20`,
                            }}
                        >
                            <Text
                                className="text-sm font-medium"
                                style={{
                                    color: getStatusColor(),
                                }}
                            >
                                {getStatusText()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Informações da ONG */}
                    <View className="mb-3">
                        <Text
                            className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {donation.ongName}
                        </Text>
                        <Text
                            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            PIX: {donation.pixKey}
                        </Text>
                    </View>

                    {/* Informações do doador */}
                    <View className="mb-3">
                        <Text
                            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            <Text className="font-medium">Doador:</Text> {donation.donorName}
                        </Text>
                        <Text
                            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {donation.donorEmail}
                        </Text>
                    </View>

                    {/* Data */}
                    <View className="mb-4">
                        <Text
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {donation.createdAt.toLocaleDateString("pt-BR")} às {donation.createdAt.toLocaleTimeString("pt-BR")}
                        </Text>
                    </View>

                    {/* Indicador de tipo de conta */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                    backgroundColor: isAsaasAccount ? "#10B981" : "#6B7280",
                                }}
                            />
                            <Text
                                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {isAsaasAccount ? "Conta ASAAS" : "Conta Manual"}
                            </Text>
                        </View>
                    </View>

                    {/* Botões de ação para ASAAS */}
                    {donation.asaasPaymentId && (
                        <View className="flex-row space-x-2 mb-4 gap-4">
                            <TouchableOpacity onPress={onSyncStatus} className="flex-1" disabled={isPaymentLoading}>
                                <View
                                    style={{
                                        backgroundColor: isPaymentLoading ? "#9CA3AF" : "#3B82F6",
                                        borderRadius: 8,
                                        paddingVertical: 10,
                                        alignItems: "center",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        opacity: isPaymentLoading ? 0.7 : 1,
                                    }}
                                >
                                    {isPaymentLoading ? (
                                        <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
                                    ) : (
                                        <Feather name="refresh-cw" size={14} color="white" style={{ marginRight: 6 }} />
                                    )}
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 12,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {isPaymentLoading ? "Sincronizando..." : "Sincronizar"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onViewDetails} className="flex-1" disabled={isPaymentLoading}>
                                <View
                                    style={{
                                        backgroundColor: isPaymentLoading ? "#9CA3AF" : "#8B5CF6",
                                        borderRadius: 8,
                                        paddingVertical: 10,
                                        alignItems: "center",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        opacity: isPaymentLoading ? 0.7 : 1,
                                    }}
                                >
                                    {isPaymentLoading ? (
                                        <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
                                    ) : (
                                        <Feather name="eye" size={14} color="white" style={{ marginRight: 6 }} />
                                    )}
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 12,
                                            fontWeight: "600",
                                        }}
                                    >
                                        {isPaymentLoading ? "Carregando..." : "Ver Detalhes"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Botões de ação principais */}
                    {donation.status === "pending" && (
                        <View className="flex-row space-x-3">
                            {isAsaasAccount ? (
                                <TouchableOpacity onPress={() => onTransfer(true)} className="flex-1" disabled={isLoading}>
                                    <LinearGradient
                                        colors={isLoading ? ["#9CA3AF", "#6B7280"] : ["#10B981", "#059669"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            borderRadius: 8,
                                            paddingVertical: 12,
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            opacity: isLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
                                        ) : (
                                            <Feather name="zap" size={16} color="white" style={{ marginRight: 6 }} />
                                        )}
                                        <Text
                                            style={{
                                                color: "white",
                                                fontSize: 14,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {isLoading ? "Processando..." : "Transferir Auto"}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => onTransfer(false)} className="flex-1" disabled={isLoading}>
                                    <View
                                        style={{
                                            backgroundColor: isLoading ? "#9CA3AF" : isDark ? "#374151" : "#F3F4F6",
                                            borderRadius: 8,
                                            paddingVertical: 12,
                                            alignItems: "center",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            opacity: isLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={isDark ? "#FFFFFF" : "#1F2937"}
                                                style={{ marginRight: 6 }}
                                            />
                                        ) : (
                                            <Feather
                                                name="check"
                                                size={16}
                                                color={isDark ? "#FFFFFF" : "#1F2937"}
                                                style={{ marginRight: 6 }}
                                            />
                                        )}
                                        <Text
                                            style={{
                                                color: isDark ? "#FFFFFF" : "#1F2937",
                                                fontSize: 14,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {isLoading ? "Processando..." : "Marcar como Pago"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {donation.status === "paid" && (
                        <View
                            style={{
                                backgroundColor: "#10B98120",
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="check-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
                            <Text
                                style={{
                                    color: "#10B981",
                                    fontSize: 14,
                                    fontWeight: "600",
                                }}
                            >
                                Transferência Concluída
                            </Text>
                        </View>
                    )}

                    {donation.status === "cancelled" && (
                        <View
                            style={{
                                backgroundColor: "#EF444420",
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="x-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                            <Text
                                style={{
                                    color: "#EF4444",
                                    fontSize: 14,
                                    fontWeight: "600",
                                }}
                            >
                                Doação Cancelada
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Status Change Modal */}
            <Modal
                visible={showStatusMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStatusMenu(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setShowStatusMenu(false)}
                >
                    <View
                        className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 mx-8 min-w-64`}
                        style={{ maxWidth: 300 }}
                    >
                        <Text
                            className={`text-lg font-bold mb-4 text-center ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Alterar Status
                        </Text>

                        <TouchableOpacity
                            onPress={() => handleStatusChange("pending")}
                            className="flex-row items-center p-3 rounded-lg mb-2"
                            style={{ backgroundColor: "#F59E0B20" }}
                        >
                            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: "#F59E0B" }} />
                            <Text className={`flex-1 ${isDark ? "text-white" : "text-gray-800"}`}>Pendente</Text>
                            {donation.status === "pending" && <Feather name="check" size={16} color="#F59E0B" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleStatusChange("paid")}
                            className="flex-row items-center p-3 rounded-lg mb-2"
                            style={{ backgroundColor: "#10B98120" }}
                        >
                            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: "#10B981" }} />
                            <Text className={`flex-1 ${isDark ? "text-white" : "text-gray-800"}`}>Pago</Text>
                            {donation.status === "paid" && <Feather name="check" size={16} color="#10B981" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleStatusChange("cancelled")}
                            className="flex-row items-center p-3 rounded-lg mb-4"
                            style={{ backgroundColor: "#EF444420" }}
                        >
                            <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: "#EF4444" }} />
                            <Text className={`flex-1 ${isDark ? "text-white" : "text-gray-800"}`}>Cancelado</Text>
                            {donation.status === "cancelled" && <Feather name="check" size={16} color="#EF4444" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowStatusMenu(false)}
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: isDark ? "#374151" : "#F3F4F6" }}
                        >
                            <Text className={`text-center font-medium ${isDark ? "text-white" : "text-gray-800"}`}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </Animated.View>
    )
}

// Settings Panel Component
interface SettingsPanelProps {
    isDark: boolean
    colors: any
}

function SettingsPanel({ isDark, colors }: SettingsPanelProps) {
    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const settingsSections = [
        {
            id: "notifications",
            title: "Notificações",
            icon: "bell",
            items: [
                {
                    id: "push",
                    title: "Configurar notificações push",
                    icon: "bell",
                    action: () => Alert.alert("Configurações de Notificações", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "email",
                    title: "Configurar emails automáticos",
                    icon: "mail",
                    action: () => Alert.alert("Configurações de Email", "Funcionalidade em desenvolvimento"),
                },
            ],
        },
        {
            id: "appearance",
            title: "Aparência",
            icon: "layout",
            items: [
                {
                    id: "theme",
                    title: "Personalizar tema do aplicativo",
                    icon: "layout",
                    action: () => Alert.alert("Configurações de Tema", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "logo",
                    title: "Alterar logo e imagens",
                    icon: "image",
                    action: () => Alert.alert("Configurações de Logo", "Funcionalidade em desenvolvimento"),
                },
            ],
        },
        {
            id: "system",
            title: "Sistema",
            icon: "settings",
            items: [
                {
                    id: "backup",
                    title: "Backup e restauração",
                    icon: "database",
                    action: () => Alert.alert("Backup", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "logs",
                    title: "Logs do sistema",
                    icon: "file-text",
                    action: () => Alert.alert("Logs", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "info",
                    title: "Informações do aplicativo",
                    icon: "info",
                    action: () => Alert.alert("Versão", "Versão atual: 1.0.0"),
                },
            ],
        },
    ]

    return (
        <ScrollView className="flex-1 p-4">
            {settingsSections.map((section) => (
                <View key={section.id} className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Feather name={section.icon as any} size={16} color={colors.primary} />
                        </View>
                        <Text
                            className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {section.title}
                        </Text>
                    </View>

                    <View
                        className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        {section.items.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.action}
                                className={`flex-row items-center justify-between p-4 ${index < section.items.length - 1 ? "border-b border-gray-200" : ""
                                    }`}
                            >
                                <View className="flex-row items-center">
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: `${colors.primary}10` }}
                                    >
                                        <Feather name={item.icon as any} size={18} color={colors.primary} />
                                    </View>
                                    <Text
                                        className={`${isDark ? "text-white" : "text-gray-800"}`}
                                        style={Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        })}
                                    >
                                        {item.title}
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    androidShadow: {
        elevation: 3,
    },
    webShadow: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    fabShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
})
