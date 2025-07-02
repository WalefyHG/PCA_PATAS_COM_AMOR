"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import ChatService, { type Chat } from "../../utils/ChatServices"
import ChatModal from "./ChatModal"
import { auth } from "../../config/firebase"
import { useThemeContext } from "@/app/utils/ThemeContext"

export default function ChatList() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()
    const [chats, setChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [showChatModal, setShowChatModal] = useState(false)

    const chatService = ChatService.getInstance()

    useEffect(() => {
        const unsubscribe = chatService.subscribeToUserChatsRTB((userChats) => {
            const ordered = Object.values(userChats || {})
                .filter((chat: any) => chat.lastMessageTime)
                .sort((a: any, b: any) => b.lastMessageTime - a.lastMessageTime)

            setChats(ordered)
            setLoading(false)
        })

        return () => unsubscribe?.()
    }, [])

    const onRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1000)
    }

    const handleChatPress = (chatId: string) => {
        setSelectedChatId(chatId)
        setShowChatModal(true)
    }

    const formatTime = (timestamp: number | null) => {
        if (!timestamp) return ""
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))

        if (hours < 1) return "Agora"
        else if (hours < 24) return `${hours}h`
        else return `${Math.floor(hours / 24)}d`
    }

    const renderChatItem = ({ item }: { item: Chat }) => {
        const unreadCount = item.unreadCount || 0
        const isOwner = auth.currentUser?.uid === item.ownerId
        const otherPersonName = isOwner ? item.adopterName : item.ownerName
        const otherPersonAvatar = isOwner ? item.adopterAvatar : item.ownerAvatar

        return (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item.id!)}>
                <View style={[styles.chatContent, { backgroundColor: isDarkTheme ? "#374151" : "#FFFFFF" }]}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.petImage }} style={styles.petImage} />
                        {otherPersonAvatar ? (
                            <Image source={{ uri: otherPersonAvatar }} style={styles.personAvatar} />
                        ) : (
                            <View style={[styles.personAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <Text style={styles.personAvatarText}>{otherPersonName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                            <Text style={[styles.petName, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]} numberOfLines={1}>
                                {item.petName}
                            </Text>
                            {item.lastMessageTime && (
                                <Text style={[styles.timeText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    {formatTime(item.lastMessageTime)}
                                </Text>
                            )}
                        </View>

                        <View style={styles.chatDetails}>
                            <Text style={[styles.participantName, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]} numberOfLines={1}>
                                Chat com {otherPersonName}
                            </Text>
                            {unreadCount > 0 && (
                                <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.unreadText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                                </View>
                            )}
                        </View>

                        {item.lastMessage && (
                            <Text style={[styles.lastMessage, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]} numberOfLines={2}>
                                {item.lastMessage}
                            </Text>
                        )}
                    </View>

                    <View style={styles.chatActions}>
                        <View
                            style={[
                                styles.statusIndicator,
                                {
                                    backgroundColor:
                                        item.status === "active" ? colors.primary : item.status === "pending" ? "#F59E0B" : "#EF4444",
                                },
                            ]}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>Carregando chats...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meus Chats</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id!}
                renderItem={renderChatItem}
                style={styles.chatList}
                contentContainerStyle={chats.length === 0 ? styles.emptyContainer : styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Feather name="message-circle" size={64} color={isDarkTheme ? "#4B5563" : "#D1D5DB"} />
                        <Text style={[styles.emptyTitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>Nenhum chat ainda</Text>
                        <Text style={[styles.emptyDescription, { color: isDarkTheme ? "#6B7280" : "#9CA3AF" }]}>
                            Quando você demonstrar interesse em adotar um pet, os chats aparecerão aqui.
                        </Text>
                    </View>
                }
            />

            <ChatModal visible={showChatModal} chatId={selectedChatId} onClose={() => setShowChatModal(false)} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    chatList: {
        flex: 1,
    },
    listContainer: {
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    chatItem: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            },
        }),
    },
    chatContent: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    avatarContainer: {
        position: "relative",
        marginRight: 16,
    },
    petImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    personAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        position: "absolute",
        bottom: -4,
        right: -4,
        borderWidth: 2,
        borderColor: "white",
    },
    personAvatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        position: "absolute",
        bottom: -4,
        right: -4,
        borderWidth: 2,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    personAvatarText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    petName: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    timeText: {
        fontSize: 12,
    },
    chatDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    participantName: {
        fontSize: 14,
        flex: 1,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    unreadText: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    lastMessage: {
        fontSize: 14,
        lineHeight: 18,
    },
    chatActions: {
        alignItems: "center",
        marginLeft: 12,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
})
