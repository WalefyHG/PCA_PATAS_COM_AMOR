"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Platform,
    Animated,
    KeyboardAvoidingView,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import ChatService, { type ChatMessage, type Chat } from "../../utils/ChatServices"
import { auth } from "../../config/firebase"
import { useThemeContext } from "@/app/utils/ThemeContext"

interface ChatScreenProps {
    chatId: string
    onClose?: () => void
}

export default function ChatScreen({ chatId, onClose }: ChatScreenProps) {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [chatData, setChatData] = useState<Chat | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const flatListRef = useRef<FlatList>(null)
    const chatService = ChatService.getInstance()

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    useEffect(() => {
        loadChatData()
        setupMessageListener()

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()

        return () => {
            // Marcar mensagens como lidas ao sair
            chatService.markMessagesAsRead(chatId)
        }
    }, [chatId])

    const loadChatData = async () => {
        try {
            const data = await chatService.getChatData(chatId)
            setChatData(data)
        } catch (error) {
            console.error("Erro ao carregar dados do chat:", error)
            Alert.alert("Erro", "Não foi possível carregar o chat")
        }
    }

    const setupMessageListener = () => {
        const unsubscribe = chatService.subscribeToMessages(chatId, (newMessages) => {
            setMessages(newMessages)
            setLoading(false)

            // Scroll para a última mensagem
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true })
            }, 100)
        })

        return unsubscribe
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return

        const messageText = newMessage.trim()
        setNewMessage("")
        setSending(true)

        try {
            await chatService.sendMessage(chatId, messageText)
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
            Alert.alert("Erro", "Não foi possível enviar a mensagem")
            setNewMessage(messageText) // Restaurar mensagem em caso de erro
        } finally {
            setSending(false)
        }
    }

    const handleCloseChat = () => {
        Alert.alert("Encerrar Chat", "Tem certeza que deseja encerrar este chat? Esta ação não pode ser desfeita.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Encerrar",
                style: "destructive",
                onPress: async () => {
                    try {
                        await chatService.closeChat(chatId)
                        onClose?.()
                    } catch (error) {
                        Alert.alert("Erro", "Não foi possível encerrar o chat")
                    }
                },
            },
        ])
    }

    const formatTime = (timestamp: any) => {
        if (!timestamp) return ""

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))

        if (hours < 24) {
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } else {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            })
        }
    }

    const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
        const isMyMessage = item.senderId === auth.currentUser?.uid
        const isSystemMessage = item.type === "system"
        const showAvatar = !isMyMessage && !isSystemMessage
        const prevMessage = index > 0 ? messages[index - 1] : null
        const showTime = !prevMessage || prevMessage.senderId !== item.senderId

        if (isSystemMessage) {
            return (
                <View style={styles.systemMessageContainer}>
                    <View style={[styles.systemMessage, { backgroundColor: `${colors.primary}20` }]}>
                        <Feather name="info" size={12} color={colors.primary} />
                        <Text style={[styles.systemMessageText, { color: colors.primary }]}>{item.message}</Text>
                    </View>
                </View>
            )
        }

        return (
            <Animated.View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {showAvatar && (
                    <View style={styles.avatarContainer}>
                        {item.senderAvatar ? (
                            <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>{item.senderName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={[styles.messageContent, !showAvatar && styles.messageContentWithoutAvatar]}>
                    {showTime && !isMyMessage && (
                        <Text style={[styles.senderName, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>{item.senderName}</Text>
                    )}

                    <View
                        style={[
                            styles.messageBubble,
                            isMyMessage
                                ? [styles.myMessageBubble, { backgroundColor: colors.primary }]
                                : [styles.otherMessageBubble, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }],
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                {
                                    color: isMyMessage ? "white" : isDarkTheme ? "#F9FAFB" : "#111827",
                                },
                            ]}
                        >
                            {item.message}
                        </Text>
                    </View>

                    {showTime && (
                        <Text style={[styles.messageTime, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            {formatTime(item.timestamp)}
                        </Text>
                    )}
                </View>
            </Animated.View>
        )
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>Carregando chat...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Image source={{ uri: chatData?.petImage }} style={styles.petImage} />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>{chatData?.petName}</Text>
                            <Text style={styles.headerSubtitle}>
                                Chat com {chatData?.adopterId === auth.currentUser?.uid ? chatData?.ownerName : chatData?.adopterName}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleCloseChat} style={styles.menuButton}>
                        <Feather name="more-vertical" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id || ""}
                renderItem={renderMessage}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                <View style={[styles.inputWrapper, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }]}>
                    <TextInput
                        style={[styles.textInput, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}
                        placeholder="Digite sua mensagem..."
                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={500}
                    />

                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: newMessage.trim() ? colors.primary : isDarkTheme ? "#4B5563" : "#D1D5DB",
                            },
                        ]}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Feather name="send" size={18} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
    },
    petImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 12,
        marginTop: 2,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    myMessageContainer: {
        justifyContent: "flex-end",
    },
    otherMessageContainer: {
        justifyContent: "flex-start",
    },
    avatarContainer: {
        marginRight: 8,
        marginBottom: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    messageContent: {
        maxWidth: "75%",
    },
    messageContentWithoutAvatar: {
        marginLeft: 40,
    },
    senderName: {
        fontSize: 12,
        marginBottom: 4,
        marginLeft: 12,
    },
    messageBubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    myMessageBubble: {
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        marginHorizontal: 12,
    },
    systemMessageContainer: {
        alignItems: "center",
        marginVertical: 8,
    },
    systemMessage: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    systemMessageText: {
        fontSize: 12,
        marginLeft: 6,
        fontStyle: "italic",
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0, 0, 0, 0.1)",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 48,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
        textAlignVertical: "center",
        ...Platform.select({
            web: {
                outlineStyle: "none",
            },
        }),
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
})
