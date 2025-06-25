import * as Notifications from "expo-notifications"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import * as Contacts from "expo-contacts"
import { Camera } from "expo-camera"
import { Alert, Platform, Linking } from "react-native"

export interface PermissionStatus {
    granted: boolean
    canAskAgain: boolean
    status: string
}

export interface PermissionInfo {
    key: string
    name: string
    description: string
    icon: string
    required: boolean
    status: PermissionStatus
}

class PermissionService {
    private static instance: PermissionService

    public static getInstance(): PermissionService {
        if (!PermissionService.instance) {
            PermissionService.instance = new PermissionService()
        }
        return PermissionService.instance
    }

    // Verificar status de uma permissão específica
    async checkPermissionStatus(permissionType: string): Promise<PermissionStatus> {
        try {
            let result: any

            switch (permissionType) {
                case "notifications":
                    result = await Notifications.getPermissionsAsync()
                    break
                case "camera":
                    result = await Camera.getCameraPermissionsAsync()
                    break
                case "mediaLibrary":
                    result = await ImagePicker.getMediaLibraryPermissionsAsync()
                    break
                case "location":
                    result = await Location.getForegroundPermissionsAsync()
                    break
                case "contacts":
                    result = await Contacts.getPermissionsAsync()
                    break
                default:
                    return { granted: false, canAskAgain: false, status: "undetermined" }
            }

            return {
                granted: result.status === "granted",
                canAskAgain: result.canAskAgain !== false,
                status: result.status,
            }
        } catch (error) {
            console.error(`Erro ao verificar permissão ${permissionType}:`, error)
            return { granted: false, canAskAgain: false, status: "error" }
        }
    }

    // Solicitar uma permissão específica
    async requestPermission(permissionType: string): Promise<PermissionStatus> {
        try {
            let result: any

            switch (permissionType) {
                case "notifications":
                    // Configurar canal de notificação no Android
                    if (Platform.OS === "android") {
                        await Notifications.setNotificationChannelAsync("default", {
                            name: "Notificações Gerais",
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 250, 250, 250],
                            lightColor: "#6366F1",
                            sound: "default",
                            description: "Notificações sobre novos pets e atualizações importantes",
                        })

                        await Notifications.setNotificationChannelAsync("pets", {
                            name: "Novos Pets",
                            importance: Notifications.AndroidImportance.HIGH,
                            vibrationPattern: [0, 500, 250, 500],
                            lightColor: "#10B981",
                            sound: "default",
                            description: "Notificações quando novos pets estão disponíveis para adoção",
                        })

                        await Notifications.setNotificationChannelAsync("favorites", {
                            name: "Favoritos",
                            importance: Notifications.AndroidImportance.DEFAULT,
                            vibrationPattern: [0, 250],
                            lightColor: "#F59E0B",
                            sound: "default",
                            description: "Notificações sobre seus pets favoritos",
                        })
                    }

                    result = await Notifications.requestPermissionsAsync({
                        ios: {
                            allowAlert: true,
                            allowBadge: true,
                            allowSound: true,
                            allowCriticalAlerts: false,
                            provideAppNotificationSettings: true,
                            allowProvisional: false,
                        },
                        android: {
                            allowAlert: true,
                            allowBadge: true,
                            allowSound: true,
                        },
                    })
                    break

                case "camera":
                    result = await Camera.requestCameraPermissionsAsync()
                    break

                case "mediaLibrary":
                    result = await ImagePicker.requestMediaLibraryPermissionsAsync(false)
                    break

                case "location":
                    result = await Location.requestForegroundPermissionsAsync()
                    break

                case "contacts":
                    result = await Contacts.requestPermissionsAsync()
                    break

                default:
                    return { granted: false, canAskAgain: false, status: "unsupported" }
            }

            return {
                granted: result.status === "granted",
                canAskAgain: result.canAskAgain !== false,
                status: result.status,
            }
        } catch (error) {
            console.error(`Erro ao solicitar permissão ${permissionType}:`, error)
            return { granted: false, canAskAgain: false, status: "error" }
        }
    }

    // Verificar todas as permissões
    async checkAllPermissions(): Promise<PermissionInfo[]> {
        const permissions = [
            {
                key: "notifications",
                name: "Notificações",
                description: "Receber alertas sobre novos pets e atualizações importantes",
                icon: "bell",
                required: true,
            },
            {
                key: "camera",
                name: "Câmera",
                description: "Tirar fotos para o perfil do pet e documentação",
                icon: "camera",
                required: false,
            },
            {
                key: "mediaLibrary",
                name: "Galeria de Fotos",
                description: "Selecionar fotos da galeria para perfis e posts",
                icon: "image",
                required: false,
            },
            {
                key: "location",
                name: "Localização",
                description: "Encontrar pets próximos à sua localização",
                icon: "map-pin",
                required: false,
            },
            {
                key: "contacts",
                name: "Contatos",
                description: "Facilitar o compartilhamento de pets com amigos",
                icon: "users",
                required: false,
            },
        ]

        const permissionsWithStatus = await Promise.all(
            permissions.map(async (permission) => {
                const status = await this.checkPermissionStatus(permission.key)
                return {
                    ...permission,
                    status,
                }
            }),
        )

        return permissionsWithStatus
    }

    // Abrir configurações do sistema
    async openSystemSettings(): Promise<void> {
        try {
            if (Platform.OS === "ios") {
                await Linking.openURL("app-settings:")
            } else {
                await Linking.openSettings()
            }
        } catch (error) {
            console.error("Erro ao abrir configurações:", error)
            Alert.alert("Erro", "Não foi possível abrir as configurações do sistema")
        }
    }

    // Mostrar dialog explicativo antes de solicitar permissão
    showPermissionRationale(
        permissionName: string,
        description: string,
        onAccept: () => void,
        onDecline?: () => void,
    ): void {
        Alert.alert(
            `Permissão: ${permissionName}`,
            `Para uma melhor experiência, precisamos acessar ${description.toLowerCase()}.\n\nIsso nos permite oferecer funcionalidades mais completas e personalizadas.`,
            [
                {
                    text: "Não Permitir",
                    style: "cancel",
                    onPress: onDecline,
                },
                {
                    text: "Permitir",
                    style: "default",
                    onPress: onAccept,
                },
            ],
            { cancelable: false },
        )
    }

    // Mostrar dialog quando permissão foi negada permanentemente
    showPermissionDeniedDialog(permissionName: string): void {
        Alert.alert(
            "Permissão Necessária",
            `A permissão para ${permissionName.toLowerCase()} foi negada. Para usar esta funcionalidade, você precisa habilitá-la nas configurações do dispositivo.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Abrir Configurações",
                    style: "default",
                    onPress: () => this.openSystemSettings(),
                },
            ],
        )
    }

    // Solicitar permissão com tratamento completo
    async requestPermissionWithRationale(permissionType: string, permissionName: string): Promise<boolean> {
        try {
            // Primeiro, verificar o status atual
            const currentStatus = await this.checkPermissionStatus(permissionType)

            if (currentStatus.granted) {
                return true
            }

            // Se não pode mais pedir, mostrar dialog para ir às configurações
            if (!currentStatus.canAskAgain) {
                this.showPermissionDeniedDialog(permissionName)
                return false
            }

            // Mostrar rationale e solicitar permissão
            return new Promise((resolve) => {
                const permissionInfo = this.getPermissionInfo(permissionType)

                this.showPermissionRationale(
                    permissionName,
                    permissionInfo.description,
                    async () => {
                        const result = await this.requestPermission(permissionType)
                        if (!result.granted && !result.canAskAgain) {
                            this.showPermissionDeniedDialog(permissionName)
                        }
                        resolve(result.granted)
                    },
                    () => resolve(false),
                )
            })
        } catch (error) {
            console.error("Erro ao solicitar permissão:", error)
            return false
        }
    }

    // Obter informações de uma permissão
    private getPermissionInfo(permissionType: string) {
        const permissionMap: Record<string, { description: string }> = {
            notifications: {
                description: "suas notificações para receber alertas sobre novos pets",
            },
            camera: {
                description: "sua câmera para tirar fotos dos pets",
            },
            mediaLibrary: {
                description: "sua galeria de fotos para selecionar imagens",
            },
            location: {
                description: "sua localização para encontrar pets próximos",
            },
            contacts: {
                description: "seus contatos para compartilhar pets com amigos",
            },
        }

        return permissionMap[permissionType] || { description: "esta funcionalidade" }
    }

    // Verificar se todas as permissões essenciais estão concedidas
    async checkEssentialPermissions(): Promise<{ allGranted: boolean; missing: string[] }> {
        const essentialPermissions = ["notifications"]
        const missing: string[] = []

        for (const permission of essentialPermissions) {
            const status = await this.checkPermissionStatus(permission)
            if (!status.granted) {
                missing.push(permission)
            }
        }

        return {
            allGranted: missing.length === 0,
            missing,
        }
    }

    // Solicitar todas as permissões essenciais
    async requestEssentialPermissions(): Promise<boolean> {
        const { allGranted, missing } = await this.checkEssentialPermissions()

        if (allGranted) {
            return true
        }

        for (const permission of missing) {
            const permissionName = this.getPermissionDisplayName(permission)
            const granted = await this.requestPermissionWithRationale(permission, permissionName)

            if (!granted && permission === "notifications") {
                // Notificações são essenciais
                return false
            }
        }

        return true
    }

    private getPermissionDisplayName(permissionType: string): string {
        const nameMap: Record<string, string> = {
            notifications: "Notificações",
            camera: "Câmera",
            mediaLibrary: "Galeria de Fotos",
            location: "Localização",
            contacts: "Contatos",
        }

        return nameMap[permissionType] || permissionType
    }
}

export default PermissionService
