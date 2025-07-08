import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { updateUserProfile } from "../repositories/FirebaseUserRepository"
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db, auth } from "../data/datasources/firebase/firebase"

interface DeviceInfo {
    deviceId: string
    deviceName: string
    platform: string
    osVersion: string
    appVersion: string
    expoPushToken: string
    userId: string
    isActive: boolean
    lastSeen: string
    registeredAt: string
}

class DeviceRegistrationService {
    private static instance: DeviceRegistrationService
    private currentDeviceId: string | null = null
    private registrationInProgress = false

    public static getInstance(): DeviceRegistrationService {
        if (!DeviceRegistrationService.instance) {
            DeviceRegistrationService.instance = new DeviceRegistrationService()
        }
        return DeviceRegistrationService.instance
    }

    // Gerar ID único do dispositivo
    private async generateDeviceId(): Promise<string> {
        try {
            // Tentar obter ID salvo localmente primeiro
            let deviceId = await AsyncStorage.getItem("@device_id")

            if (!deviceId) {
                // Gerar novo ID baseado em informações do dispositivo
                const deviceInfo = {
                    brand: Device.brand,
                    manufacturer: Device.manufacturer,
                    modelName: Device.modelName,
                    osName: Device.osName,
                    osVersion: Device.osVersion,
                    timestamp: Date.now(),
                    random: Math.random().toString(36).substring(7),
                }

                // Criar hash simples do dispositivo
                deviceId = `${deviceInfo.brand}_${deviceInfo.modelName}_${deviceInfo.timestamp}_${deviceInfo.random}`
                    .replace(/[^a-zA-Z0-9_]/g, "_")
                    .toLowerCase()

                // Salvar localmente
                await AsyncStorage.setItem("@device_id", deviceId)
                console.log("📱 Novo Device ID gerado:", deviceId)
            } else {
                console.log("📱 Device ID existente:", deviceId)
            }

            this.currentDeviceId = deviceId
            return deviceId
        } catch (error) {
            console.error("❌ Erro ao gerar Device ID:", error)
            // Fallback para timestamp + random
            const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`
            this.currentDeviceId = fallbackId
            return fallbackId
        }
    }

    // Obter informações completas do dispositivo
    private async getDeviceInfo(): Promise<Partial<DeviceInfo>> {
        const deviceId = await this.generateDeviceId()

        return {
            deviceId,
            deviceName: Device.deviceName || `${Device.brand} ${Device.modelName}`,
            platform: Platform.OS,
            osVersion: Device.osVersion || "Unknown",
            appVersion: "1.0.0", // Você pode pegar isso do app.json
            lastSeen: new Date().toISOString(),
        }
    }

    // Registrar dispositivo automaticamente
    async registerDevice(): Promise<boolean> {
        if (this.registrationInProgress) {
            console.log("⏳ Registro já em andamento...")
            return false
        }

        if (!auth.currentUser) {
            console.log("❌ Usuário não autenticado para registro")
            return false
        }

        this.registrationInProgress = true

        try {
            console.log("🔄 Iniciando registro automático do dispositivo...")

            // 1. Obter informações do dispositivo
            const deviceInfo = await this.getDeviceInfo()
            console.log("📱 Info do dispositivo:", deviceInfo)

            // 2. Verificar permissões de notificação
            const { status: existingStatus } = await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            if (existingStatus !== "granted") {
                console.log("🔔 Solicitando permissões de notificação...")
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== "granted") {
                console.log("❌ Permissões de notificação negadas")
                // Ainda registra o dispositivo, mas sem token
                await this.saveDeviceToFirestore({ ...deviceInfo, expoPushToken: "", isActive: false })
                return false
            }

            // 3. Configurar canal Android
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF231F7C",
                })
            }

            // 4. Obter token Expo
            const expoPushToken = await this.getExpoPushToken()
            if (!expoPushToken) {
                console.log("❌ Não foi possível obter token Expo")
                await this.saveDeviceToFirestore({ ...deviceInfo, expoPushToken: "", isActive: false })
                return false
            }

            // 5. Salvar no Firestore
            const completeDeviceInfo: DeviceInfo = {
                ...deviceInfo,
                expoPushToken,
                userId: auth.currentUser.uid,
                isActive: true,
                registeredAt: new Date().toISOString(),
            } as DeviceInfo

            await this.saveDeviceToFirestore(completeDeviceInfo)

            // 6. Atualizar perfil do usuário com o token atual
            await updateUserProfile(auth.currentUser.uid, {
                expoPushToken,
            })

            // 7. Limpar dispositivos antigos/inativos
            await this.cleanupOldDevices()

            console.log("✅ Dispositivo registrado com sucesso!")
            return true
        } catch (error) {
            console.error("❌ Erro no registro do dispositivo:", error)
            return false
        } finally {
            this.registrationInProgress = false
        }
    }

    // Obter token Expo com retry
    private async getExpoPushToken(): Promise<string | null> {
        const maxAttempts = 3
        let attempts = 0

        while (attempts < maxAttempts) {
            try {
                const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || "your-eas-project-id"

                const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
                const token = tokenData.data

                if (token && token.startsWith("ExponentPushToken[") && token.endsWith("]")) {
                    console.log("✅ Token Expo válido obtido")
                    return token
                } else {
                    throw new Error("Token inválido recebido")
                }
            } catch (error) {
                attempts++
                console.error(`❌ Tentativa ${attempts} falhou:`, error)

                if (attempts < maxAttempts) {
                    await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
                }
            }
        }

        return null
    }

    // Salvar dispositivo no Firestore
    private async saveDeviceToFirestore(deviceInfo: Partial<DeviceInfo>): Promise<void> {
        try {
            // Verificar se dispositivo já existe
            const existingDevice = await this.findExistingDevice(deviceInfo.deviceId!)

            if (existingDevice) {
                // Atualizar dispositivo existente
                await updateDoc(doc(db, "devices", existingDevice.id), {
                    ...deviceInfo,
                    lastSeen: new Date().toISOString(),
                })
                console.log("🔄 Dispositivo atualizado no Firestore")
            } else {
                // Criar novo registro
                await addDoc(collection(db, "devices"), {
                    ...deviceInfo,
                    registeredAt: new Date().toISOString(),
                })
                console.log("➕ Novo dispositivo salvo no Firestore")
            }
        } catch (error) {
            console.error("❌ Erro ao salvar no Firestore:", error)
        }
    }

    // Encontrar dispositivo existente
    private async findExistingDevice(deviceId: string): Promise<any> {
        try {
            const q = query(
                collection(db, "devices"),
                where("deviceId", "==", deviceId),
                where("userId", "==", auth.currentUser?.uid),
            )

            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0]
                return { id: doc.id, ...doc.data() }
            }

            return null
        } catch (error) {
            console.error("❌ Erro ao buscar dispositivo:", error)
            return null
        }
    }

    // Limpar dispositivos antigos (mais de 30 dias sem atividade)
    private async cleanupOldDevices(): Promise<void> {
        try {
            if (!auth.currentUser) return

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

            const q = query(collection(db, "devices"), where("userId", "==", auth.currentUser.uid))

            const querySnapshot = await getDocs(q)
            const devicesToDelete: string[] = []

            querySnapshot.forEach((doc) => {
                const device = doc.data()
                const lastSeen = new Date(device.lastSeen)

                // Marcar para exclusão se não é o dispositivo atual e está inativo há mais de 30 dias
                if (device.deviceId !== this.currentDeviceId && lastSeen < thirtyDaysAgo) {
                    devicesToDelete.push(doc.id)
                }
            })

            // Deletar dispositivos antigos
            for (const deviceId of devicesToDelete) {
                await deleteDoc(doc(db, "devices", deviceId))
            }

            if (devicesToDelete.length > 0) {
                console.log(`🧹 ${devicesToDelete.length} dispositivos antigos removidos`)
            }
        } catch (error) {
            console.error("❌ Erro na limpeza de dispositivos:", error)
        }
    }

    // Atualizar status do dispositivo (chamado periodicamente)
    async updateDeviceStatus(): Promise<void> {
        try {
            if (!auth.currentUser || !this.currentDeviceId) return

            const existingDevice = await this.findExistingDevice(this.currentDeviceId)

            if (existingDevice) {
                await updateDoc(doc(db, "devices", existingDevice.id), {
                    lastSeen: new Date().toISOString(),
                    isActive: true,
                })
            }
        } catch (error) {
            console.error("❌ Erro ao atualizar status:", error)
        }
    }

    // Desregistrar dispositivo (logout)
    async unregisterDevice(): Promise<void> {
        try {
            if (!this.currentDeviceId) return

            const existingDevice = await this.findExistingDevice(this.currentDeviceId)

            if (existingDevice) {
                await updateDoc(doc(db, "devices", existingDevice.id), {
                    isActive: false,
                    expoPushToken: "",
                    lastSeen: new Date().toISOString(),
                })
                console.log("📱 Dispositivo desregistrado")
            }
        } catch (error) {
            console.error("❌ Erro ao desregistrar dispositivo:", error)
        }
    }

    // Obter todos os dispositivos do usuário
    async getUserDevices(): Promise<DeviceInfo[]> {
        try {
            if (!auth.currentUser) return []

            const q = query(
                collection(db, "devices"),
                where("userId", "==", auth.currentUser.uid),
                where("isActive", "==", true),
            )

            const querySnapshot = await getDocs(q)
            const devices: DeviceInfo[] = []

            querySnapshot.forEach((doc) => {
                devices.push({ id: doc.id, ...doc.data() } as unknown as DeviceInfo)
            })

            return devices
        } catch (error) {
            console.error("❌ Erro ao buscar dispositivos:", error)
            return []
        }
    }

    // Obter token do dispositivo atual
    getCurrentDeviceToken(): string | null {
        return this.currentDeviceId
    }
}

export default DeviceRegistrationService
