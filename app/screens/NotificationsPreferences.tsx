"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Animated,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import ExpoNotificationService, { type NotificationPreference } from "../utils/NotificationsServices"
import { getUserProfile, auth } from "../config/firebase"
import { useNavigation } from "@react-navigation/native"

// Mock theme context (adapte para seu contexto real)
const useThemeContext = () => ({
    isDarkTheme: false,
    colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        primaryDark: "#4F46E5",
        secondaryDark: "#7C3AED",
        success: "#10B981",
        error: "#EF4444",
    },
})

const PET_TYPES = [
    { type: "Cão", icon: "heart", description: "Receber notificações sobre cães disponíveis para adoção" },
    { type: "Gato", icon: "heart", description: "Receber notificações sobre gatos disponíveis para adoção" },
    { type: "Pássaro", icon: "heart", description: "Receber notificações sobre pássaros disponíveis para adoção" },
    { type: "Peixe", icon: "heart", description: "Receber notificações sobre peixes disponíveis para adoção" },
    { type: "Roedor", icon: "heart", description: "Receber notificações sobre roedores disponíveis para adoção" },
    { type: "Réptil", icon: "heart", description: "Receber notificações sobre répteis disponíveis para adoção" },
]

export default function NotificationPreferences() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const [preferences, setPreferences] = useState<NotificationPreference[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const notificationService = ExpoNotificationService.getInstance()

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        loadPreferences()

        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const loadPreferences = async () => {
        try {
            if (!auth.currentUser) return

            const userProfile = await getUserProfile(auth.currentUser.uid)
            const userPreferences = userProfile?.petPreferences || []

            const prefs = PET_TYPES.map((petType) => ({
                petType: petType.type,
                enabled: userPreferences.includes(petType.type),
            }))

            setPreferences(prefs)
        } catch (error) {
            console.error("Erro ao carregar preferências:", error)
            Alert.alert("Erro", "Não foi possível carregar suas preferências")
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadPreferences()
        setRefreshing(false)
    }

    const togglePreference = (petType: string) => {
        setPreferences((prev) =>
            prev.map((pref) => (pref.petType === petType ? { ...pref, enabled: !pref.enabled } : pref)),
        )
    }

    const savePreferences = async () => {
        try {
            setSaving(true)
            await notificationService.updateNotificationPreferences(preferences)
            Alert.alert("Sucesso", "Suas preferências foram salvas!")
        } catch (error) {
            console.error("Erro ao salvar preferências:", error)
            Alert.alert("Erro", "Não foi possível salvar suas preferências")
        } finally {
            setSaving(false)
        }
    }

    const enableAllNotifications = async () => {
        const hasPermission = await notificationService.setupNotifications()
        if (!hasPermission) {
            Alert.alert(
                "Permissão necessária",
                "Para receber notificações, você precisa permitir o acesso nas configurações do seu dispositivo.",
            )
        } else {
            Alert.alert("Sucesso", "Notificações configuradas com sucesso!")
        }
    }

    const testNotification = async () => {
        await notificationService.simulateNewPetNotification("Cão", "Rex", "test-pet-id")
        Alert.alert("Teste", "Notificação de teste enviada!")
    }

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                    className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    Carregando preferências...
                </Text>
            </View>
        )
    }

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header with gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pt-16 pb-4 px-4"
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Notificações</Text>
                    <View className="w-10" />
                </View>

                {/* Header description */}
                <View className="mt-4">
                    <View className="flex-row items-center justify-center mb-2">
                        <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                            <Feather name="bell" size={24} color="white" />
                        </View>
                    </View>
                    <Text className="text-white/90 text-center text-base">Configure suas preferências de notificação</Text>
                    <Text className="text-white/70 text-center text-sm mt-1">
                        Escolha os tipos de pets sobre os quais deseja ser notificado
                    </Text>
                </View>
            </LinearGradient>

            {/* Content Area */}
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Action Buttons */}
                    <View className="flex-row mb-6 space-x-3 gap-5">
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                            onPress={enableAllNotifications}
                            className="flex-1 w-5"
                        >
                            <Feather name="settings" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Configurar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.success }]}
                            onPress={testNotification}
                            className="flex-1 w-5"
                        >
                            <Feather name="bell" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Testar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preferences List */}
                    <View
                        className={`rounded-xl overflow-hidden mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        {PET_TYPES.map((petType, index) => {
                            const pref = preferences.find((p) => p.petType === petType.type)
                            return (
                                <PreferenceItem
                                    key={petType.type}
                                    petType={petType}
                                    preference={pref}
                                    index={index}
                                    isLast={index === PET_TYPES.length - 1}
                                    isDark={isDarkTheme}
                                    colors={colors}
                                    onToggle={() => togglePreference(petType.type)}
                                />
                            )
                        })}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            {
                                backgroundColor: saving ? colors.primary + "80" : colors.success,
                                opacity: saving ? 0.7 : 1,
                            },
                        ]}
                        onPress={savePreferences}
                        disabled={saving}
                        className="mb-6"
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Feather name="check" size={20} color="white" />
                        )}
                        <Text className="text-white font-bold text-base ml-2">
                            {saving ? "Salvando..." : "Salvar Preferências"}
                        </Text>
                    </TouchableOpacity>

                    {/* Info Box */}
                    <View
                        className={`rounded-xl p-4 ${isDarkTheme ? "bg-blue-900/20" : "bg-blue-50"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <View className="flex-row items-start">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-1"
                                style={{ backgroundColor: `${colors.primary}20` }}
                            >
                                <Feather name="info" size={16} color={colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text
                                    className={`font-semibold mb-1 ${isDarkTheme ? "text-blue-200" : "text-blue-800"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Como funciona?
                                </Text>
                                <Text
                                    className={`text-sm leading-5 ${isDarkTheme ? "text-blue-300" : "text-blue-700"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Você receberá notificações sempre que um novo pet do tipo selecionado for colocado para adoção. As
                                    notificações são enviadas em tempo real para ajudar você a encontrar seu novo companheiro.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    )
}

// Preference Item Component
interface PreferenceItemProps {
    petType: { type: string; icon: string; description: string }
    preference?: NotificationPreference
    index: number
    isLast: boolean
    isDark: boolean
    colors: any
    onToggle: () => void
}

function PreferenceItem({ petType, preference, index, isLast, isDark, colors, onToggle }: PreferenceItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <TouchableOpacity
                onPress={onToggle}
                className={`flex-row items-center justify-between p-4 ${!isLast ? `border-b ${isDark ? "border-gray-700" : "border-gray-100"}` : ""
                    }`}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center flex-1">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${colors.primary}15` }}
                    >
                        <Feather name={petType.icon as any} size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                        <Text
                            className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {petType.type}
                        </Text>
                        <Text
                            className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                            numberOfLines={2}
                        >
                            {petType.description}
                        </Text>
                    </View>
                </View>

                <Switch
                    value={preference?.enabled || false}
                    onValueChange={onToggle}
                    trackColor={{ false: isDark ? "#374151" : "#E5E7EB", true: `${colors.primary}40` }}
                    thumbColor={preference?.enabled ? colors.primary : isDark ? "#9CA3AF" : "#F3F4F6"}
                    ios_backgroundColor={isDark ? "#374151" : "#E5E7EB"}
                />
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    androidShadow: {
        elevation: 3,
    },
    webShadow: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
        }),
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            },
        }),
    },
})
