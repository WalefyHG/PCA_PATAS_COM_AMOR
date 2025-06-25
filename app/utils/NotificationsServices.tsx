import messaging from "@react-native-firebase/messaging"
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
import { Alert } from "react-native"

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

class NotificationService {
    private static instance: NotificationService

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    // Configurar FCM e solicitar permissões
    async setupNotifications(): Promise<boolean> {
        try {
            const authStatus = await messaging().requestPermission()
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL

            if (enabled) {
                const token = await messaging().getToken()

                // Salvar token no perfil do usuário
                if (auth.currentUser) {
                    await updateUserProfile(auth.currentUser.uid, { fcmToken: token })
                }

                // Configurar listeners
                this.setupMessageHandlers()

                return true
            }

            return false
        } catch (error) {
            console.error("Erro ao configurar notificações:", error)
            return false
        }
    }

    // Configurar handlers de mensagens
    private setupMessageHandlers() {
        // Mensagens em primeiro plano
        messaging().onMessage(async (remoteMessage) => {
            Alert.alert(
                remoteMessage.notification?.title || "Nova notificação",
                remoteMessage.notification?.body || "Você tem uma nova mensagem",
                [
                    { text: "Fechar", style: "cancel" },
                    {
                        text: "Ver",
                        onPress: () => this.handleNotificationPress(remoteMessage.data),
                    },
                ],
            )
        })

        // App aberto via notificação
        messaging().onNotificationOpenedApp((remoteMessage) => {
            this.handleNotificationPress(remoteMessage.data)
        })

        // App iniciado via notificação
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    this.handleNotificationPress(remoteMessage.data)
                }
            })
    }

    // Lidar com clique na notificação
    private handleNotificationPress(data: any) {
        if (data?.action === "view_pet" && data?.petId) {
            // Navegar para detalhes do pet
            // navigation.navigate('PetDetails', { petId: data.petId });
        } else if (data?.action === "view_favorites") {
            // Navegar para favoritos
            // navigation.navigate('Favorites');
        }
    }

    // Adicionar pet aos favoritos
    async addToFavorites(petId: string, petType: string, petName: string): Promise<void> {
        try {
            if (!auth.currentUser) throw new Error("Usuário não autenticado")

            const favorite: Favorite = {
                userId: auth.currentUser.uid,
                petId,
                petType,
                petName,
                createdAt: serverTimestamp(),
            }

            await addDoc(collection(db, "favorites"), favorite)

            // Automaticamente se inscrever no tópico do tipo de pet
            await this.subscribeToTopic(petType)

            Alert.alert(
                "Adicionado aos favoritos! ❤️",
                `Você receberá notificações sobre ${petType.toLowerCase()}s similares.`,
            )
        } catch (error) {
            console.error("Erro ao adicionar favorito:", error)
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
        } catch (error) {
            console.error("Erro ao remover favorito:", error)
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
            console.error("Erro ao verificar favorito:", error)
            return false
        }
    }

    // Buscar favoritos do usuário
    async getUserFavorites(): Promise<Favorite[]> {
        try {
            if (!auth.currentUser) return []

            const q = query(collection(db, "favorites"), where("userId", "==", auth.currentUser.uid))

            const querySnapshot = await getDocs(q)

            return querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Favorite[]
        } catch (error) {
            console.error("Erro ao buscar favoritos:", error)
            return []
        }
    }

    // Se inscrever em tópico
    async subscribeToTopic(petType: string): Promise<void> {
        try {
            const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, "")
            await messaging().subscribeToTopic(topic)
            console.log(`Inscrito no tópico: ${topic}`)
        } catch (error) {
            console.error("Erro ao se inscrever no tópico:", error)
        }
    }

    // Cancelar inscrição em tópico
    async unsubscribeFromTopic(petType: string): Promise<void> {
        try {
            const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, "")
            await messaging().unsubscribeFromTopic(topic)
            console.log(`Desinscrito do tópico: ${topic}`)
        } catch (error) {
            console.error("Erro ao cancelar inscrição no tópico:", error)
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

            // Gerenciar inscrições nos tópicos
            for (const pref of preferences) {
                if (pref.enabled) {
                    await this.subscribeToTopic(pref.petType)
                } else {
                    await this.unsubscribeFromTopic(pref.petType)
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar preferências:", error)
            throw error
        }
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
}

export default NotificationService
