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
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather, FontAwesome } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useTranslation } from "react-i18next"
import {
    getBlogPosts,
    getPets,
    deleteBlogPost,
    deletePet,
    isUserAdmin,
    type BlogPost,
    type Pet,
    getUsers,
    UserProfile,
    deleteUserProfile,
} from "../config/firebase"
import { auth } from "../config/firebase"
import HeaderLayout from "../utils/HeaderLayout"
import { ConfirmModal } from "../utils/ConfirmModal"
import { User } from "firebase/auth"
import { Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Svg, { Path } from "react-native-svg"

// Tipos para os dados
interface AdminTab {
    id: string
    title: string
    icon: keyof typeof Feather.glyphMap
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

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (auth.currentUser) {
                const adminStatus = await isUserAdmin(auth.currentUser.uid)
                setIsAdmin(adminStatus)

                if (!adminStatus) {
                    Alert.alert("Acesso Restrito", "Apenas administradores podem acessar esta página.", [
                        { text: "OK", onPress: () => navigation.goBack() },
                    ])
                } else {
                    // Carregar dados iniciais
                    fetchData()
                }
            } else {
                Alert.alert("Não Autenticado", "Você precisa estar logado para acessar esta página.", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ])
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
                navigation.goBack(); // ou o nome correto da sua tela inicial
            }, 3000); // 3 segundos

            return () => clearTimeout(timer); // limpa o timer se o componente desmontar antes
        }
    }, [isAdmin, navigation]);

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
            }
            else if (activeTab === "users") {
                const allUser = await getUsers(20);
                setUsers(allUser);
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab} data:`, error)
            Alert.alert("Erro", `Ocorreu um erro ao carregar os dados de ${activeTab}.`)
        } finally {
            setIsLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
    }

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        fetchData()
    }

    const handleEdit = (id: string, type: string) => {
        if (type === "blog") {
            navigation.navigate("AddBlogPost", { postId: id })
        } else if (type === "pet") {
            // Navegar para a tela de edição de pet
            navigation.navigate("AddPet", { petId: id })
        }
        else if (type === "users") {
            navigation.navigate("AddUsers", { userId: id })
        }
    }
    const openDeleteModal = (id: string, type: string) => {
        setItemToDelete({ id, type });
        setModalVisible(true);
    };

    // Função que executa a exclusão
    const handleDelete = async (id: string, type: string) => {
        try {
            if (type === "blog") {
                await deleteBlogPost(id);
                setBlogPosts((prev) => prev.filter((post) => post.id !== id));
            } else if (type === "pet") {
                await deletePet(id);
                setPets((prev) => prev.filter((pet) => pet.id !== id));
            }
            else if (type === "users") {
                await deleteUserProfile(id)
                setUsers((prev) => prev.filter((user) => user.uid !== id));
            }

            if (Platform.OS === "web") {
                window.alert(`${type === "blog" ? "Post" : type === "pet" ? "Pet" : "Usuário"
                    } excluído com sucesso!`);
            } else {
                Alert.alert("Sucesso", `${type === "blog" ? "Post" : "Pet"} excluído com sucesso!`);
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            if (Platform.OS === "web") {
                window.alert(`Ocorreu um erro ao excluir o ${type === "blog" ? "post" : "pet"}.`);
            } else {
                Alert.alert("Erro", `Ocorreu um erro ao excluir o ${type === "blog" ? "post" : "pet"}.`);
            }
        } finally {
            setModalVisible(false);
            setItemToDelete(null);
        }
    };

    const handleAdd = () => {
        if (activeTab === "blog") {
            navigation.navigate("AddBlogPost")
        } else if (activeTab === "pets") {
            // Navegar para a tela de adição de pet
            navigation.navigate("AddPet")
        }
    }

    // Abas do Admin Console
    const tabs: AdminTab[] = [
        { id: "blog", title: "Blog", icon: "book-open" },
        { id: "pets", title: "Pets", icon: "heart" },
        { id: "users", title: "Usuários", icon: "users" },
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
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">{t("Admin Console")}</Text>
                    <View className="w-10" />
                </View>
                <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
                    <HeaderLayout title="Profile" />
                </View>
            </LinearGradient>

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

                        {activeTab === "settings" && <SettingsPanel isDark={isDarkTheme} colors={colors} />}
                        <ConfirmModal
                            visible={modalVisible}
                            message={`Tem certeza que deseja excluir este ${itemToDelete?.type === "blog"
                                ? "post"
                                : itemToDelete?.type === "pet"
                                    ? "pet"
                                    : "usuário"
                                }?`}
                            onConfirm={() => handleDelete(itemToDelete?.id || "", itemToDelete?.type || "")}
                            onCancel={() => setModalVisible(false)}
                        />
                    </>
                )}
            </Animated.View>

            {/* Floating Action Button */}
            {activeTab !== "settings" && (
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
    user: UserProfile | User;
    index: number;
    isDark: boolean;
    colors: any;
    onEdit: () => void;
    onDelete: () => void;
}

function UserItem({ user, index, isDark, colors, onEdit, onDelete }: UserItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const getLoginIcon = () => {
        if ('logginFormat' in user && user.logginFormat === 'google') {
            return (
                <View className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                    <FontAwesome name="google" size={14} color="#EA4335" />
                </View>
            );
        } else {
            return (
                <View className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <Feather name="mail" size={14} color="#1D4ED8" />
                </View>
            );
        }
    };

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
                style={Platform.OS === "ios" ? styles.iosShadow : Platform.OS === "android" ? styles.androidShadow : styles.webShadow}
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
                            <Text className="text-s text-muted-foreground">
                                {"logginFormat" in user && user.logginFormat === 'google' ? 'Login com Google' : 'Login com Email'}
                            </Text>
                            {"role" in user && user.role === "admin" && (
                                <Badge style={{ backgroundColor: colors.primary, borderRadius: 50, marginLeft: 8 }}>
                                    <Text className="text-s text-white font-semibold">
                                        Admin
                                    </Text>
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
