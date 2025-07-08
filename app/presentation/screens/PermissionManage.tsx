"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Animated,
    ActivityIndicator,
    RefreshControl,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import PermissionService, { type PermissionInfo } from "../../utils/PermissionsServices"
import { useNavigation } from "@react-navigation/native"

// Mock theme context
const useThemeContext = () => ({
    isDarkTheme: false,
    colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        primaryDark: "#4F46E5",
        secondaryDark: "#7C3AED",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
    },
})

export default function PermissionManager() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const [permissions, setPermissions] = useState<PermissionInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [requesting, setRequesting] = useState<string | null>(null)

    const permissionService = PermissionService.getInstance()

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    useEffect(() => {
        loadPermissions()

        // Start animations
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

    const loadPermissions = async () => {
        try {
            const permissionList = await permissionService.checkAllPermissions()
            setPermissions(permissionList)
        } catch (error) {
            console.error("Erro ao carregar permissões:", error)
            Alert.alert("Erro", "Não foi possível carregar as permissões")
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadPermissions()
        setRefreshing(false)
    }

    const handleRequestPermission = async (permission: PermissionInfo) => {
        if (requesting) return

        setRequesting(permission.key)

        try {
            const granted = await permissionService.requestPermissionWithRationale(permission.key, permission.name)

            if (granted) {
                Alert.alert("Sucesso", `Permissão para ${permission.name} concedida!`)
            }

            // Recarregar permissões para atualizar status
            await loadPermissions()
        } catch (error) {
            console.error("Erro ao solicitar permissão:", error)
            Alert.alert("Erro", "Não foi possível solicitar a permissão")
        } finally {
            setRequesting(null)
        }
    }

    const handleRequestAllEssential = async () => {
        setRequesting("all")

        try {
            const success = await permissionService.requestEssentialPermissions()

            if (success) {
                Alert.alert("Sucesso", "Todas as permissões essenciais foram concedidas!")
            } else {
                Alert.alert(
                    "Atenção",
                    "Algumas permissões essenciais não foram concedidas. Isso pode afetar a funcionalidade do app.",
                )
            }

            await loadPermissions()
        } catch (error) {
            console.error("Erro ao solicitar permissões:", error)
            Alert.alert("Erro", "Não foi possível solicitar as permissões")
        } finally {
            setRequesting(null)
        }
    }

    const openSystemSettings = () => {
        Alert.alert(
            "Configurações do Sistema",
            "Você será redirecionado para as configurações do sistema onde pode gerenciar todas as permissões do app.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Abrir Configurações",
                    onPress: () => permissionService.openSystemSettings(),
                },
            ],
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "granted":
                return colors.success
            case "denied":
                return colors.error
            case "undetermined":
                return colors.warning
            default:
                return colors.primary
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "granted":
                return "Concedida"
            case "denied":
                return "Negada"
            case "undetermined":
                return "Não solicitada"
            default:
                return "Desconhecido"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "granted":
                return "check-circle"
            case "denied":
                return "x-circle"
            case "undetermined":
                return "help-circle"
            default:
                return "alert-circle"
        }
    }

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                    Verificando permissões...
                </Text>
            </View>
        )
    }

    const grantedCount = permissions.filter((p) => p.status.granted).length
    const totalCount = permissions.length
    const essentialCount = permissions.filter((p) => p.required && p.status.granted).length
    const totalEssential = permissions.filter((p) => p.required).length

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
                    <Text className="text-white text-xl font-bold">Permissões</Text>
                    <TouchableOpacity
                        onPress={openSystemSettings}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Feather name="settings" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Header Stats */}
                <View className="mt-4">
                    <View className="flex-row items-center justify-center mb-2">
                        <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                            <Feather name="shield" size={24} color="white" />
                        </View>
                    </View>
                    <Text className="text-white/90 text-center text-base">Gerencie as permissões do app</Text>
                    <Text className="text-white/70 text-center text-sm mt-1">
                        {grantedCount} de {totalCount} permissões concedidas
                    </Text>

                    {/* Progress Bar */}
                    <View className="mt-3 mx-8">
                        <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white/80 rounded-full"
                                style={{ width: `${(grantedCount / totalCount) * 100}%` }}
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
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
                    {/* Quick Actions */}
                    <View className="flex-row mb-6 space-x-3 gap-6">
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: requesting === "all" ? colors.primary + "80" : colors.primary,
                                    opacity: requesting === "all" ? 0.7 : 1,
                                },
                            ]}
                            onPress={handleRequestAllEssential}
                            disabled={requesting !== null}
                            className="flex-1"
                        >
                            {requesting === "all" ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Feather name="check-circle" size={20} color="white" />
                            )}
                            <Text className="text-white font-semibold ml-2">
                                {requesting === "all" ? "Solicitando..." : "Permitir Essenciais"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.warning }]}
                            onPress={openSystemSettings}
                            className="flex-1"
                        >
                            <Feather name="external-link" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Configurações</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Status Summary */}
                    <View
                        className={`rounded-xl p-4 mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow}
                    >
                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Status das Permissões
                        </Text>

                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                                    {essentialCount}/{totalEssential}
                                </Text>
                                <Text className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>Essenciais</Text>
                            </View>

                            <View className="items-center">
                                <Text className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                                    {grantedCount}/{totalCount}
                                </Text>
                                <Text className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>Total</Text>
                            </View>

                            <View className="items-center">
                                <Text
                                    className="text-2xl font-bold"
                                    style={{ color: grantedCount === totalCount ? colors.success : colors.warning }}
                                >
                                    {Math.round((grantedCount / totalCount) * 100)}%
                                </Text>
                                <Text className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>Completo</Text>
                            </View>
                        </View>
                    </View>

                    {/* Permissions List */}
                    <View
                        className={`rounded-xl overflow-hidden mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow}
                    >
                        {permissions.map((permission, index) => (
                            <PermissionItem
                                key={permission.key}
                                permission={permission}
                                index={index}
                                isLast={index === permissions.length - 1}
                                isDark={isDarkTheme}
                                colors={colors}
                                requesting={requesting === permission.key}
                                onRequest={() => handleRequestPermission(permission)}
                                getStatusColor={getStatusColor}
                                getStatusText={getStatusText}
                                getStatusIcon={getStatusIcon}
                            />
                        ))}
                    </View>

                    {/* Info Box */}
                    <View
                        className={`rounded-xl p-4 ${isDarkTheme ? "bg-blue-900/20" : "bg-blue-50"}`}
                        style={Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow}
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
                                    Sobre as Permissões
                                </Text>
                                <Text
                                    className={`text-sm leading-5 ${isDarkTheme ? "text-blue-300" : "text-blue-700"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    As permissões são necessárias para que o app funcione corretamente. Você pode gerenciá-las
                                    individualmente ou através das configurações do sistema. Permissões marcadas como "essenciais" são
                                    necessárias para o funcionamento básico do app.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </View>
    )
}

// Permission Item Component
interface PermissionItemProps {
    permission: PermissionInfo
    index: number
    isLast: boolean
    isDark: boolean
    colors: any
    requesting: boolean
    onRequest: () => void
    getStatusColor: (status: string) => string
    getStatusText: (status: string) => string
    getStatusIcon: (status: string) => string
}

function PermissionItem({
    permission,
    index,
    isLast,
    isDark,
    colors,
    requesting,
    onRequest,
    getStatusColor,
    getStatusText,
    getStatusIcon,
}: PermissionItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    useEffect(() => {
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

    const statusColor = getStatusColor(permission.status.status)
    const statusText = getStatusText(permission.status.status)
    const statusIcon = getStatusIcon(permission.status.status)

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <View className={`p-4 ${!isLast ? `border-b ${isDark ? "border-gray-700" : "border-gray-100"}` : ""}`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Feather name={permission.icon as any} size={20} color={colors.primary} />
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text
                                    className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {permission.name}
                                </Text>
                                {permission.required && (
                                    <View className="ml-2 px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.error}20` }}>
                                        <Text className="text-xs font-medium" style={{ color: colors.error }}>
                                            Essencial
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text
                                className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={2}
                            >
                                {permission.description}
                            </Text>

                            <View className="flex-row items-center mt-2">
                                <Feather name={statusIcon as any} size={14} color={statusColor} />
                                <Text className="text-sm font-medium ml-1" style={{ color: statusColor }}>
                                    {statusText}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {!permission.status.granted && (
                        <TouchableOpacity
                            style={[
                                styles.requestButton,
                                {
                                    backgroundColor: requesting ? colors.primary + "80" : colors.primary,
                                    opacity: requesting ? 0.7 : 1,
                                },
                            ]}
                            onPress={onRequest}
                            disabled={requesting}
                        >
                            {requesting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Feather name="unlock" size={16} color="white" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
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
        }),
    },
    requestButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
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
        }),
    },
})
