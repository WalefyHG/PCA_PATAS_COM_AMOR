"use client"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toastable from "../presentation/components/Toastable"
import "../../global.css"
import { NavigationContainer } from "@react-navigation/native"
import { ActivityIndicator, View, Text } from "react-native"
import { ThemeProvider, useThemeContext } from "../presentation/contexts/ThemeContext"
import { AuthProvider, useAuth } from "../presentation/contexts/AuthContext"
import { OngProvider } from "../presentation/contexts/OngContext"
import { useEffect, useState } from "react"
import { NavigationIndependentTree } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Screens
import LoginScreen from "../presentation/screens/LoginScreen"
import RegisterScreen from "../presentation/screens/RegisterScreen"
import AppLayout from "./(tabs)/_layout"
import ForgotPasswordScreen from "../presentation/screens/ForgotPassword"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../data/datasources/firebase/firebase"
import { useNavigation } from "expo-router"
import ExpoNotificationService from "../repositories/NotificationRepository"

const Stack = createNativeStackNavigator()
const PERSISTENCE_KEY = "NAVIGATION_STATE_V1"

// Componente de navegação condicional baseado no estado de autenticação
function NavigationContent() {
    const { user, isLoading } = useAuth()
    const { isDarkTheme, colors } = useThemeContext()
    const router = useNavigation<any>()

    // Verificar se o usuário está autenticado e redirecionar adequadamente
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.navigate("Tabs")
            }
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        // Inicializar notificações quando o app carrega
        const initNotifications = async () => {
            const notificationService = ExpoNotificationService.getInstance()
            const hasPermission = await notificationService.setupNotifications()

            if (hasPermission) {
                console.log("✅ Notificações Expo configuradas com sucesso")
            } else {
                console.log("❌ Permissão de notificação negada")
            }
        }

        initNotifications()
    }, [])

    // Mostrar tela de carregamento enquanto verifica autenticação
    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isDarkTheme ? "#111827" : "#ffffff",
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                    style={{
                        marginTop: 16,
                        fontSize: 16,
                        color: isDarkTheme ? "#e5e7eb" : "#1f2937",
                    }}
                >
                    Carregando...
                </Text>
            </View>
        )
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    flex: 1,
                    overflow: "hidden",
                    backgroundColor: isDarkTheme ? "#111827" : "#fff",
                },
            }}
            initialRouteName={user ? "Tabs" : "Login"}
        >
            {user ? (
                // Rotas autenticadas
                <Stack.Screen name="Tabs" component={AppLayout} options={{ title: "Tabs" }} />
            ) : (
                // Rotas não autenticadas
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="registers" component={RegisterScreen} options={{ title: "Criar Conta" }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Recuperar Senha" }} />
                </>
            )}
        </Stack.Navigator>
    )
}

// Componente principal que envolve a aplicação com os provedores necessários
export default function RouterLayout() {
    const [isNavigationReady, setIsNavigationReady] = useState(false)
    const [initialState, setInitialState] = useState<any>()

    useEffect(() => {
        const restoreState = async () => {
            try {
                const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY)
                const state = savedStateString ? JSON.parse(savedStateString) : undefined
                if (state !== undefined) {
                    setInitialState(state)
                }
            } catch (e) {
                console.error("Failed to restore navigation state", e)
            } finally {
                setIsNavigationReady(true)
            }
        }

        if (!isNavigationReady) {
            restoreState()
        }
    }, [isNavigationReady])

    if (!isNavigationReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 16, fontSize: 16, color: "#1f2937" }}>Preparando navegação...</Text>
            </View>
        )
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <OngProvider>
                    <NavigationIndependentTree>
                        <NavigationContainer
                            initialState={initialState}
                            onStateChange={(state) => AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))}
                        >
                            <SafeAreaProvider>
                                <Toastable />
                                <NavigationContent />
                            </SafeAreaProvider>
                        </NavigationContainer>
                    </NavigationIndependentTree>
                </OngProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}
