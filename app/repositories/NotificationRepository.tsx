import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    serverTimestamp,
    onSnapshot,
    updateDoc,
    limit,
} from "firebase/firestore"
import { db, auth } from "../data/datasources/firebase/firebase"
import { updateUserProfile } from "../repositories/FirebaseUserRepository"

export interface Favorite {
    id?: string
    userId: string
    petId: string
    petType: string
    petName: string
    createdAt?: any
}

export interface NotificationPreference {
    petType: string
    enabled: boolean
}

export interface AppNotification {
    id?: string
    userId: string
    title: string
    body: string
    type: "donation" | "pet" | "general" | "system"
    data?: any
    read: boolean
    createdAt?: any
    expiresAt?: any
}

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
})

class ExpoNotificationService {
    private static instance: ExpoNotificationService
    private expoPushToken: string | null = null

    public static getInstance(): ExpoNotificationService {
        if (!ExpoNotificationService.instance) {
            ExpoNotificationService.instance = new ExpoNotificationService()
        }
        return ExpoNotificationService.instance
    }

    // Registrar para notificações push
    async registerForPushNotificationsAsync(): Promise<string | null> {
        let token = null

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            })
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== "granted") {
                console.log("Permissão para notificações negada!")
                return null
            }

            try {
                const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "your-eas-project-id"
                token = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })
                ).data
                console.log("Expo Push Token:", token)
            } catch (error) {
                console.error("Erro ao obter Expo Push Token:", error)
            }
        } else {
            console.log("Deve usar um dispositivo físico para notificações push")
        }

        return token
    }

    // Configurar notificações
    async setupNotifications(): Promise<boolean> {
        try {
            console.log("🔔 Configurando notificações Expo...")

            // Obter token
            const token = await this.registerForPushNotificationsAsync()

            if (!token) {
                console.log("❌ Não foi possível obter token de notificação")
                return false
            }

            this.expoPushToken = token

            // Salvar token no perfil do usuário
            if (auth.currentUser) {
                await updateUserProfile(auth.currentUser.uid, {
                    expoPushToken: token,
                })
                console.log("✅ Token salvo no perfil do usuário")
            }

            // Configurar listeners
            this.setupNotificationListeners()

            return true
        } catch (error) {
            console.error("❌ Erro ao configurar notificações:", error)
            return false
        }
    }

    // Configurar listeners de notificações
    private setupNotificationListeners() {
        console.log("🎧 Configurando listeners de notificação...")

        // Notificação recebida enquanto app está em primeiro plano
        Notifications.addNotificationReceivedListener((notification) => {
            console.log("📱 Notificação recebida:", notification)
        })

        // Notificação tocada pelo usuário
        Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("👆 Notificação tocada:", response)
            this.handleNotificationPress(response.notification.request.content.data)
        })
    }

    // Lidar com clique na notificação
    private handleNotificationPress(data: any) {
        console.log("🔄 Processando clique na notificação:", data)

        if (!data) return

        try {
            // Aqui você pode implementar navegação baseada nos dados da notificação
            console.log("Dados da notificação:", data)
        } catch (error) {
            console.error("❌ Erro ao navegar:", error)
        }
    }

    // Enviar notificação local
    async sendLocalNotification(title: string, body: string, data?: any) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                    sound: "default",
                },
                trigger: null, // Enviar imediatamente
            })
            console.log("✅ Notificação local enviada")
        } catch (error) {
            console.error("❌ Erro ao enviar notificação local:", error)
        }
    }

    // Enviar notificação push via API do Expo
    async sendPushNotification(expoPushToken: string, title: string, body: string, data?: any) {
        const message = {
            to: expoPushToken,
            sound: "default",
            title,
            body,
            data: data || {},
        }

        try {
            const response = await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            })

            const result = await response.json()
            console.log("✅ Push notification enviada:", result)
            return result
        } catch (error) {
            console.error("❌ Erro ao enviar push notification:", error)
            throw error
        }
    }

    // ===== FUNCIONALIDADES DE NOTIFICAÇÕES DE DOAÇÃO =====

    /**
     * Criar notificação de doação no Firebase e enviar notificação local
     */
    async createDonationNotification(
        donationId: string,
        donorName: string,
        amount: number,
        ongName: string,
    ): Promise<void> {
        try {
            if (!auth.currentUser) {
                console.log("❌ Usuário não autenticado para criar notificação")
                return
            }

            const notification: Omit<AppNotification, "id"> = {
                userId: auth.currentUser.uid,
                title: "💰 Nova Doação Recebida!",
                body: `${donorName} doou R$ ${amount.toFixed(2)} para ${ongName}`,
                type: "donation",
                data: {
                    donationId,
                    donorName,
                    amount,
                    ongName,
                    action: "view_donations",
                },
                read: false,
                createdAt: serverTimestamp(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            }

            // Salvar no Firebase
            await addDoc(collection(db, "notifications"), notification)

            // Enviar notificação local
            await this.sendLocalNotification(notification.title, notification.body, notification.data)

            console.log("✅ Notificação de doação criada com sucesso")
        } catch (error) {
            console.error("❌ Erro ao criar notificação de doação:", error)
        }
    }

    /**
     * Buscar todas as notificações do usuário (sem orderBy para evitar erro de índice)
     */
    async getUserNotifications(callback: (notifications: AppNotification[]) => void) {
        if (!auth.currentUser) return () => { }

        // Consulta simples sem orderBy para evitar erro de índice
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", auth.currentUser.uid),
            limit(50), // Limitar a 50 notificações mais recentes
        )

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as AppNotification[]

            // Ordenar no cliente por data de criação (mais recentes primeiro)
            notifications.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0)
                const dateB = b.createdAt?.toDate?.() || new Date(0)
                return dateB.getTime() - dateA.getTime()
            })

            callback(notifications)
        })
    }

    /**
     * Marcar notificação como lida
     */
    async markNotificationAsRead(notificationId: string): Promise<void> {
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true,
            })
            console.log("✅ Notificação marcada como lida")
        } catch (error) {
            console.error("❌ Erro ao marcar notificação como lida:", error)
        }
    }

    /**
     * Marcar todas as notificações como lidas
     */
    async markAllNotificationsAsRead(): Promise<void> {
        try {
            if (!auth.currentUser) return

            const q = query(
                collection(db, "notifications"),
                where("userId", "==", auth.currentUser.uid),
                where("read", "==", false),
            )

            const querySnapshot = await getDocs(q)
            const batch = []

            for (const docSnapshot of querySnapshot.docs) {
                batch.push(
                    updateDoc(doc(db, "notifications", docSnapshot.id), {
                        read: true,
                    }),
                )
            }

            await Promise.all(batch)
            console.log("✅ Todas as notificações marcadas como lidas")
        } catch (error) {
            console.error("❌ Erro ao marcar todas as notificações como lidas:", error)
        }
    }

    /**
     * Deletar notificação
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "notifications", notificationId))
            console.log("✅ Notificação deletada")
        } catch (error) {
            console.error("❌ Erro ao deletar notificação:", error)
        }
    }

    /**
     * Limpar notificações expiradas
     */
    async cleanExpiredNotifications(): Promise<void> {
        try {
            if (!auth.currentUser) return

            const q = query(
                collection(db, "notifications"),
                where("userId", "==", auth.currentUser.uid),
                where("expiresAt", "<=", new Date()),
            )

            const querySnapshot = await getDocs(q)

            for (const docSnapshot of querySnapshot.docs) {
                await deleteDoc(doc(db, "notifications", docSnapshot.id))
            }

            console.log(`✅ ${querySnapshot.size} notificações expiradas removidas`)
        } catch (error) {
            console.error("❌ Erro ao limpar notificações expiradas:", error)
        }
    }

    /**
     * Contar notificações não lidas
     */
    async getUnreadNotificationsCount(): Promise<number> {
        try {
            if (!auth.currentUser) return 0

            const q = query(
                collection(db, "notifications"),
                where("userId", "==", auth.currentUser.uid),
                where("read", "==", false),
            )

            const querySnapshot = await getDocs(q)
            return querySnapshot.size
        } catch (error) {
            console.error("❌ Erro ao contar notificações não lidas:", error)
            return 0
        }
    }

    // ===== FUNCIONALIDADES EXISTENTES =====

    // Adicionar pet aos favoritos
    async addToFavorites(petId: string, petType: string, petName: string): Promise<void> {
        try {
            if (!auth.currentUser) throw new Error("Usuário não autenticado")

            console.log("❤️ Adicionando aos favoritos:", { petId, petType, petName })

            const favorite: Favorite = {
                userId: auth.currentUser.uid,
                petId,
                petType,
                petName,
                createdAt: serverTimestamp(),
            }

            // Adicionar ao Firestore
            await addDoc(collection(db, "favorites"), favorite)

            // Enviar notificação local de confirmação
            await this.sendLocalNotification(
                "Adicionado aos favoritos! ❤️",
                `${petName} foi adicionado aos seus favoritos. Você receberá notificações sobre ${petType.toLowerCase()}s similares.`,
                {
                    action: "view_favorites",
                    petId,
                    petType,
                },
            )

            console.log("✅ Pet adicionado aos favoritos com sucesso")
        } catch (error) {
            console.error("❌ Erro ao adicionar favorito:", error)
            throw error
        }
    }

    // Remover pet dos favoritos
    async removeFromFavorites(petId: string): Promise<void> {
        try {
            if (!auth.currentUser) throw new Error("Usuário não autenticado")

            const q = query(
                collection(db, "favorites"),
                where("userId", "==", auth.currentUser.uid),
                where("petId", "==", petId),
            )

            const querySnapshot = await getDocs(q)

            for (const docSnapshot of querySnapshot.docs) {
                await deleteDoc(doc(db, "favorites", docSnapshot.id))
            }

            console.log("💔 Pet removido dos favoritos")
        } catch (error) {
            console.error("❌ Erro ao remover favorito:", error)
            throw error
        }
    }

    // Verificar se pet está nos favoritos
    async isPetFavorited(petId: string): Promise<boolean> {
        try {
            if (!auth.currentUser) return false

            const q = query(
                collection(db, "favorites"),
                where("userId", "==", auth.currentUser.uid),
                where("petId", "==", petId),
            )

            const querySnapshot = await getDocs(q)
            return !querySnapshot.empty
        } catch (error) {
            console.error("❌ Erro ao verificar favorito:", error)
            return false
        }
    }

    // Gerenciar preferências de notificação
    async updateNotificationPreferences(preferences: NotificationPreference[]): Promise<void> {
        try {
            if (!auth.currentUser) throw new Error("Usuário não autenticado")

            const enabledTypes = preferences.filter((pref) => pref.enabled).map((pref) => pref.petType)

            // Atualizar no perfil do usuário
            await updateUserProfile(auth.currentUser.uid, {
                petPreferences: enabledTypes,
            })

            console.log("✅ Preferências atualizadas:", enabledTypes)
        } catch (error) {
            console.error("❌ Erro ao atualizar preferências:", error)
            throw error
        }
    }

    // Simular notificação de novo pet (para desenvolvimento)
    async simulateNewPetNotification(petType: string, petName: string, petId: string) {
        await this.sendLocalNotification(
            `Novo ${petType} para adoção! 🐾`,
            `${petName} está procurando um lar. Toque para ver mais detalhes.`,
            {
                action: "view_pet",
                petId,
                petType,
                petName,
            },
        )
    }

    // Obter token atual
    getExpoPushToken(): string | null {
        return this.expoPushToken
    }
}

export default ExpoNotificationService
