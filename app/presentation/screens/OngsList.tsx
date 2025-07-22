"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
    Image,
    ActivityIndicator,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import FloatingActionButton from "../components/FloatingButton"
import type { Ong } from "@/app/domain/entities/Ongs"

const MyOngs: React.FC = () => {
    const navigation = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()

    const [ongs, setOngs] = useState<Ong[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const loadOngs = async () => {
        if (!user?.uid) return

        try {
            const userOngs = await ongRepository.getOngsByUser(user.uid)
            setOngs(userOngs)
        } catch (error) {
            console.error("Error loading ONGs:", error)
            Alert.alert("Erro", "Erro ao carregar ONGs")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadOngs()
        }, [user?.uid]),
    )

    const handleRefresh = () => {
        setRefreshing(true)
        loadOngs()
    }

    const handleAddOng = () => {
        navigation.navigate("RegisterOng" as never)
    }

    const handleEditOng = (ong: Ong) => {
        navigation.navigate("RegisterOng" as never, { ong } as never)
    }

    const handleDeleteOng = (ong: Ong) => {
        Alert.alert(
            "Confirmar Exclusão",
            `Tem certeza que deseja excluir a ONG "${ong.name}"? Esta ação não pode ser desfeita.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (ong.id) {
                                await ongRepository.deleteOng(ong.id)
                                setOngs(ongs.filter((o) => o.id !== ong.id))
                                Alert.alert("Sucesso", "ONG excluída com sucesso")
                            }
                        } catch (error) {
                            console.error("Error deleting ONG:", error)
                            Alert.alert("Erro", "Erro ao excluir ONG")
                        }
                    },
                },
            ],
        )
    }

    const handleViewDetails = (ong: Ong) => {
        navigation.navigate("OngDetails" as never, { ong } as never)
    }

    const renderOngItem = ({ item }: { item: Ong }) => (
        <TouchableOpacity style={styles.ongCard} onPress={() => handleViewDetails(item)}>
            <View style={styles.ongHeader}>
                <View style={styles.ongInfo}>
                    {item.logoUrl ? (
                        <Image source={{ uri: item.logoUrl }} style={styles.ongLogo} />
                    ) : (
                        <View style={[styles.ongLogoPlaceholder, { backgroundColor: colors.primary }]}>
                            <Feather name="heart" size={24} color="#FFFFFF" />
                        </View>
                    )}
                    <View style={styles.ongTextInfo}>
                        <Text style={[styles.ongName, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>{item.name}</Text>
                        <Text style={[styles.ongEmail, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>{item.email}</Text>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? "#10B981" : "#EF4444" }]}>
                                <Text style={styles.statusText}>{item.isActive ? "Ativa" : "Inativa"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.ongActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleEditOng(item)}
                    >
                        <Feather name="edit-2" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
                        onPress={() => handleDeleteOng(item)}
                    >
                        <Feather name="trash-2" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={[styles.ongDescription, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]} numberOfLines={2}>
                {item.description}
            </Text>
            <View style={styles.ongFooter}>
                <Text style={[styles.ongDate, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                    Criada em {item.createdAt.toLocaleDateString("pt-BR")}
                </Text>
                <Feather name="chevron-right" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
            </View>
        </TouchableOpacity>
    )

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB",
        },
        header: {
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 20,
            alignItems: "center",
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: 8,
        },
        headerSubtitle: {
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
        },
        emptyIcon: {
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: "600",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginBottom: 8,
            textAlign: "center",
        },
        emptySubtitle: {
            fontSize: 16,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            lineHeight: 24,
        },
        ongCard: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        ongHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
        },
        ongInfo: {
            flexDirection: "row",
            flex: 1,
        },
        ongLogo: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
        },
        ongLogoPlaceholder: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
            justifyContent: "center",
            alignItems: "center",
        },
        ongTextInfo: {
            flex: 1,
        },
        ongName: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 4,
        },
        ongEmail: {
            fontSize: 14,
            marginBottom: 8,
        },
        statusContainer: {
            flexDirection: "row",
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            fontSize: 12,
            color: "#FFFFFF",
            fontWeight: "500",
        },
        ongActions: {
            flexDirection: "row",
            gap: 8,
        },
        actionButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
        },
        ongDescription: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 12,
        },
        ongFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        ongDate: {
            fontSize: 12,
        },
        backButton: {
            position: "absolute",
            top: 60,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
        },
    })

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>Minhas ONGs</Text>
                    <Text style={styles.headerSubtitle}>Gerencie suas organizações</Text>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.emptySubtitle, { marginTop: 16 }]}>Carregando ONGs...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Minhas ONGs</Text>
                <Text style={styles.headerSubtitle}>Gerencie suas organizações</Text>
            </LinearGradient>

            <View style={styles.content}>
                {ongs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Feather name="heart" size={64} color={isDarkTheme ? "#374151" : "#D1D5DB"} style={styles.emptyIcon} />
                        <Text style={styles.emptyTitle}>Nenhuma ONG cadastrada</Text>
                        <Text style={styles.emptySubtitle}>
                            Você ainda não possui ONGs cadastradas. Clique no botão "+" para adicionar sua primeira organização.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={ongs}
                        renderItem={renderOngItem}
                        keyExtractor={(item) => item.id || ""}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                    />
                )}
            </View>

            <FloatingActionButton onPress={handleAddOng} icon="plus" label="Adicionar ONG" />
        </View>
    )
}

export default MyOngs
