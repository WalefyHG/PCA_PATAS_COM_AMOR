import {
    ref,
    set,
    get,
    push,
    update,
    onValue,
    serverTimestamp,
    query,
    orderByChild,
    equalTo,
    off,
} from "firebase/database"
import { database as db, auth } from "../config/firebase"
import ExpoNotificationService from "./NotificationsServices"

export interface ChatMessage {
    id?: string
    chatId: string
    senderId: string
    senderName: string
    senderAvatar?: string
    message: string
    timestamp: any
    type: "text" | "image" | "system"
    read: boolean
}

export interface Chat {
    id?: string
    petId: string
    petName: string
    petImage: string
    adopterId: string
    adopterName: string
    adopterAvatar?: string
    ownerId: string
    ownerName: string
    ownerAvatar?: string
    lastMessage?: string
    lastMessageTime?: any
    unreadCount: number
    adopterUnreadCount: number
    ownerUnreadCount: number
    status: "active" | "closed" | "pending"
    createdAt: any
}

class ChatService {
    private static instance: ChatService
    private notificationService: ExpoNotificationService

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService()
        }
        return ChatService.instance
    }

    constructor() {
        this.notificationService = ExpoNotificationService.getInstance()
    }

    async createOrGetChat(petId: string, petData: any, ownerData: any): Promise<string> {
        if (!auth.currentUser) throw new Error("Usuário não autenticado")
        const adopterId = auth.currentUser.uid

        const chatListRef = ref(db, "chats")
        const chatSnapshot = await get(chatListRef)
        console.log("Chat snapshot:", chatSnapshot.exists(), chatSnapshot.val())
        let existingChatId: string | null = null

        if (chatSnapshot.exists()) {
            chatSnapshot.forEach((child) => {
                const c = child.val()
                if (c.petId === petId && c.adopterId === adopterId && c.ownerId === ownerData.uid) {
                    existingChatId = child.key!
                }
            })
        }

        if (existingChatId) return existingChatId

        const newChatRef = push(chatListRef)
        const chatId = newChatRef.key!

        const newChat: Chat = {
            petId,
            petName: petData.name,
            petImage: petData.images[0],
            adopterId,
            adopterName: auth.currentUser.displayName || "Usuário",
            adopterAvatar: auth.currentUser.photoURL || "",
            ownerId: ownerData.uid,
            ownerName: ownerData.displayName || ownerData.first_name || "Dono",
            ownerAvatar: ownerData.photoURL || "",
            unreadCount: 0,
            adopterUnreadCount: 0,
            ownerUnreadCount: 0,
            status: "active",
            createdAt: Date.now(),
        }

        await set(newChatRef, newChat)
        await this.sendSystemMessage(chatId, `${newChat.adopterName} demonstrou interesse em adotar ${petData.name}!`)

        return chatId
    }

    async sendMessage(chatId: string, message: string, type: "text" | "image" = "text"): Promise<void> {
        if (!auth.currentUser) throw new Error("Usuário não autenticado")

        const messageRef = push(ref(db, `messages/${chatId}`))

        const newMessage: ChatMessage = {
            chatId,
            senderId: auth.currentUser.uid,
            senderName: auth.currentUser.displayName || "Usuário",
            senderAvatar: auth.currentUser.photoURL || "",
            message,
            timestamp: Date.now(),
            type,
            read: false,
        }

        await set(messageRef, newMessage)
        await update(ref(db, `chats/${chatId}`), {
            lastMessage: message,
            lastMessageTime: Date.now(),
        })
    }

    async sendSystemMessage(chatId: string, message: string): Promise<void> {
        const systemMsgRef = push(ref(db, `messages/${chatId}`))

        const systemMessage: ChatMessage = {
            chatId,
            senderId: "system",
            senderName: "Sistema",
            senderAvatar: "",
            message,
            timestamp: Date.now(),
            type: "system",
            read: true,
        }

        await set(systemMsgRef, systemMessage)
        await update(ref(db, `chats/${chatId}`), {
            lastMessage: message,
            lastMessageTime: Date.now(),
        })
    }

    subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
        const msgRef = ref(db, `messages/${chatId}`)

        return onValue(msgRef, (snapshot) => {
            const msgs: ChatMessage[] = []
            snapshot.forEach((child) => {
                msgs.push({ id: child.key!, ...child.val() })
            })

            msgs.sort((a, b) => a.timestamp - b.timestamp)
            callback(msgs)
        })
    }

    async getChatData(chatId: string): Promise<Chat | null> {
        const snapshot = await get(ref(db, `chats/${chatId}`))
        return snapshot.exists() ? { id: chatId, ...snapshot.val() } : null
    }

    async closeChat(chatId: string): Promise<void> {
        await update(ref(db, `chats/${chatId}`), {
            status: "closed",
            lastMessage: "Chat encerrado",
            lastMessageTime: Date.now(),
        })

        await this.sendSystemMessage(chatId, "Chat foi encerrado.")
    }

    async markMessagesAsRead(chatId: string): Promise<void> {
        const messagesRef = ref(db, `messages/${chatId}`)
        const snapshot = await get(messagesRef)

        const updates: Record<string, any> = {}

        snapshot.forEach((msg) => {
            const message = msg.val()
            if (message.senderId !== auth.currentUser?.uid && !message.read) {
                updates[`${msg.key}/read`] = true
            }
        })

        if (Object.keys(updates).length > 0) {
            await update(messagesRef, updates)
        }
    }

    subscribeToUserChatsRTB(callback: (chats: Chat[]) => void) {
        if (!auth.currentUser) throw new Error("Usuário não autenticado")

        const userId = auth.currentUser.uid
        const chatsRef = ref(db, "chats")

        const ownerChatsQuery = query(chatsRef, orderByChild("ownerId"), equalTo(userId))
        const adopterChatsQuery = query(chatsRef, orderByChild("adopterId"), equalTo(userId))

        let ownerChats: Chat[] = []
        let adopterChats: Chat[] = []

        // Helper para combinar e enviar resultados sem duplicatas
        const sendCombinedChats = () => {
            const combined = [...ownerChats]

            // Adiciona chats do adopter que não estejam já no ownerChats (compara pelo id)
            adopterChats.forEach((chat) => {
                if (!combined.find(c => c.id === chat.id)) {
                    combined.push(chat)
                }
            })

            callback(combined)
        }

        // Listeners
        const ownerListener = onValue(ownerChatsQuery, (snapshot) => {
            ownerChats = []
            snapshot.forEach((child) => {
                const key = child.key
                const val = child.val()
                if (key && val) {
                    ownerChats.push({ id: key, ...val })
                }
            })
            sendCombinedChats()
        })

        const adopterListener = onValue(adopterChatsQuery, (snapshot) => {
            adopterChats = []
            snapshot.forEach((child) => {
                const key = child.key
                const val = child.val()
                if (key && val) {
                    adopterChats.push({ id: key, ...val })
                }
            })
            sendCombinedChats()
        })

        // Retorna função para remover os listeners
        return () => {
            off(ownerChatsQuery, "value", ownerListener)
            off(adopterChatsQuery, "value", adopterListener)
        }
    }

    async getUnreadCount(chatId: string) {
        return get(ref(db, `chats/${chatId}/unreadCount`)).then(snapshot => {
            return snapshot.exists() ? snapshot.val() : 0
        })
    }
}

export default ChatService
