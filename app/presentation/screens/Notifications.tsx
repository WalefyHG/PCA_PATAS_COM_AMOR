"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import ExpoNotificationService, { type AppNotification } from "../../repositories/NotificationRepository"

export default function Notifications() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()

    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = () => {
        const notificationService = ExpoNotificationService.getInstance()
        const unsubscribe = notificationService.getUserNotifications((notificationsList) => {
            setNotifications(notificationsList)
            setLoading(false)
            setRefreshing(false)
        })

        return unsubscribe
    }

    const onRefresh = () => {
        setRefreshing(true)
        loadNotifications()
    }

    const handleNotificationPress = async (notification: AppNotification) => {
        try {
            const notificationService = ExpoNotificationService.getInstance()

            // Marcar como lida se não estiver lida
            if (!notification.read) {
                await notificationService.markNotificationAsRead(notification.id!)
            }

            // Navegar baseado no tipo de notificação
            if (notification.data?.action === "view_donations") {
                navigation.navigate("AdminConsole" as never)
            } else if (notification.data?.action === "view_pet" && notification.data?.petId) {
                navigation.navigate("pet-details", { id: notification.data.petId })
            }
        } catch (error) {
            console.error("Erro ao processar notificação:", error)
        }
    }

    const handleDeleteNotification = async (notificationId: string) => {
        Alert.alert("Excluir Notificação", "Tem certeza que deseja excluir esta notificação?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    try {
                        const notificationService = ExpoNotificationService.getInstance()
                        await notificationService.deleteNotification(notificationId)
                    } catch (error) {
                        console.error("Erro ao excluir notificação:", error)
                        Alert.alert("Erro", "Não foi possível excluir a notificação")
                    }
                },
            },
        ])
    }

    const handleMarkAllAsRead = async () => {
        try {
            const notificationService = ExpoNotificationService.getInstance()
            await notificationService.markAllNotificationsAsRead()
        } catch (error) {
            console.error("Erro ao marcar todas como lidas:", error)
            Alert.alert("Erro", "Não foi possível marcar todas as notificações como lidas")
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "donation":
                return "dollar-sign"
            case "pet":
                return "heart"
            case "system":
                return "settings"
            default:
                return "bell"
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "donation":
                return "#10B981" // Verde
            case "pet":
                return "#F59E0B" // Amarelo
            case "system":
                return "#6366F1" // Azul
            default:
                return colors.primary
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return ""

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60)
            return `${diffInMinutes}m atrás`
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h atrás`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays}d atrás`
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }}>
                {/* Header */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Notificações</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>

                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text
                        style={{
                            marginTop: 16,
                            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                            fontSize: 16,
                        }}
                    >
                        Carregando notificações...
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }}>
            {/* Header */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 }}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Notificações</Text>
                    {notifications.some((n) => !n.read) && (
                        <TouchableOpacity
                            onPress={handleMarkAllAsRead}
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Marcar todas</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={{ padding: 20 }}>
                    {notifications.length === 0 ? (
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                paddingVertical: 60,
                            }}
                        >
                            <Feather name="bell-off" size={64} color={isDarkTheme ? "#4B5563" : "#D1D5DB"} />
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                    marginTop: 16,
                                    textAlign: "center",
                                }}
                            >
                                Nenhuma notificação
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isDarkTheme ? "#6B7280" : "#9CA3AF",
                                    marginTop: 8,
                                    textAlign: "center",
                                }}
                            >
                                Você receberá notificações sobre doações e outras atividades aqui
                            </Text>
                        </View>
                    ) : (
                        notifications.map((notification) => (
                            <TouchableOpacity
                                key={notification.id}
                                onPress={() => handleNotificationPress(notification)}
                                style={{
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: notification.read
                                        ? isDarkTheme
                                            ? "#374151"
                                            : "#E5E7EB"
                                        : getNotificationColor(notification.type),
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                    {/* Ícone */}
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: getNotificationColor(notification.type) + "20",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                        }}
                                    >
                                        <Feather
                                            name={getNotificationIcon(notification.type) as any}
                                            size={20}
                                            color={getNotificationColor(notification.type)}
                                        />
                                    </View>

                                    {/* Conteúdo */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: notification.read ? "500" : "700",
                                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                                    flex: 1,
                                                    marginRight: 8,
                                                }}
                                            >
                                                {notification.title}
                                            </Text>

                                            {/* Botão de deletar */}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteNotification(notification.id!)}
                                                style={{
                                                    padding: 4,
                                                }}
                                            >
                                                <Feather name="x" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                            </TouchableOpacity>
                                        </View>

                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: isDarkTheme ? "#D1D5DB" : "#374151",
                                                marginTop: 4,
                                                lineHeight: 20,
                                            }}
                                        >
                                            {notification.body}
                                        </Text>

                                        <View
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: 8,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                                }}
                                            >
                                                {formatDate(notification.createdAt)}
                                            </Text>

                                            {!notification.read && (
                                                <View
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: getNotificationColor(notification.type),
                                                    }}
                                                />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
})