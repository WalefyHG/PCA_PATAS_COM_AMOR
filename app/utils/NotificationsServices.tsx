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
} from "firebase/firestore"
import { db, auth, updateUserProfile } from "../config/firebase"
import { router } from "expo-router"

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
            if (data.action === "view_pet" && data.petId) {
                router.push(`/pet-details/${data.petId}`)
            } else if (data.action === "view_favorites") {
                router.push("/favorites")
            } else if (data.screen) {
                router.push(`/${data.screen}`)
            }
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

    // Buscar histórico de notificações
    getNotificationHistory(callback: (notifications: any[]) => void) {
        if (!auth.currentUser) return () => { }

        const q = query(
            collection(db, "notifications"),
            where("sentAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Últimos 7 dias
        )

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            callback(notifications)
        })
    }

    // Obter token atual
    getExpoPushToken(): string | null {
        return this.expoPushToken
    }
}

export default ExpoNotificationService