"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../config/firebase"
import { Button, Input } from "@ui-kitten/components"
import { useThemeContext } from "../utils/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()

    // Função para lidar com erros
    const handleError = (error: any) => {
        setIsLoading(false)
        console.error("Erro ao redefinir senha:", error)

        let errorMessage = "Ocorreu um erro ao enviar o email de redefinição. Tente novamente."

        if (error.code) {
            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "Email inválido."
                    break
                case "auth/user-not-found":
                    errorMessage = "Não existe uma conta com este email."
                    break
                case "auth/too-many-requests":
                    errorMessage = "Muitas tentativas. Tente novamente mais tarde."
                    break
                case "auth/network-request-failed":
                    errorMessage = "Erro de conexão. Verifique sua internet."
                    break
            }
        }

        setError(errorMessage)
    }

    // Função para enviar email de redefinição de senha
    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError("Por favor, digite seu email.")
            return
        }

        setError("")
        setSuccess(false)
        setIsLoading(true)

        try {
            await sendPasswordResetEmail(auth, email)
            setSuccess(true)
            setIsLoading(false)
        } catch (e: any) {
            handleError(e)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#fff" }]}>
            {/* Header Gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topShape}
            />

            <View style={styles.content}>
                <TouchableOpacity
                    onPress={() => router.goBack()}
                    style={[styles.backButton, { backgroundColor: isDarkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }]}
                >
                    <Feather name="arrow-left" size={20} color={isDarkTheme ? "#fff" : "#000"} />
                </TouchableOpacity>

                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    defaultSource={require("../../assets/logo.png")}
                />

                <Text style={[styles.headerText, { color: isDarkTheme ? colors.secondary : colors.primary, marginBottom: 30 }]}>
                    Recuperar Senha
                </Text>

                {success ? (
                    <View style={styles.successContainer}>
                        <Feather name="check-circle" size={50} color={colors.primary} />
                        <Text style={[styles.successText, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>
                            Email enviado com sucesso!
                        </Text>
                        <Text style={[styles.successSubText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                        </Text>

                        <Button
                            style={[styles.loginButton, { backgroundColor: colors.primary, marginTop: 30 }]}
                            onPress={() => router.navigate("Login")}
                        >
                            <Text style={styles.loginButtonText}>Voltar para Login</Text>
                        </Button>
                    </View>
                ) : (
                    <>
                        <View style={styles.formContainer}>
                            <Text style={[styles.instructionText, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>
                                Digite seu email para receber um link de redefinição de senha.
                            </Text>

                            <Input
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                        borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                    },
                                ]}
                                placeholder="Digite seu Email"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text)
                                    setError("")
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                disabled={isLoading}
                            />

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Feather name="alert-circle" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button
                                style={[styles.resetButton, { backgroundColor: colors.primary }]}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.resetButtonText}>Enviar Email</Text>
                                )}
                            </Button>
                        </View>

                        <TouchableOpacity style={styles.loginLink} onPress={() => router.navigate("Login")}>
                            <Text style={{ color: isDarkTheme ? "#E5E7EB" : "#1F2937" }}>
                                Lembrou sua senha?{" "}
                                <Text style={{ color: isDarkTheme ? colors.secondary : colors.primary, fontWeight: "bold" }}>
                                    Faça login
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Footer Gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.secondaryDark, colors.primaryDark] : [colors.secondary, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bottomShape}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
    topShape: {
        borderBottomRightRadius: 100,
        alignSelf: "flex-start",
        ...Platform.select({
            web: { width: 500, height: 80 },
            android: { width: 200, height: 50 },
            ios: { width: 200, height: 50 },
            default: { width: 200, height: 50 },
        }),
    },
    bottomShape: {
        borderTopLeftRadius: 100,
        alignSelf: "flex-end",
        ...Platform.select({
            web: { width: 500, height: 80 },
            android: { width: 200, height: 50 },
            ios: { width: 200, height: 50 },
            default: { width: 200, height: 50 },
        }),
    },
    content: {
        width: "100%",
        maxWidth: 400,
        padding: 20,
        alignItems: "center",
        ...Platform.select({
            web: { maxWidth: 600 },
        }),
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    instructionText: {
        textAlign: "center",
        marginBottom: 20,
        fontSize: 16,
    },
    buttonContainer: {
        width: "100%",
        marginTop: 20,
        alignItems: "center",
    },
    input: {
        width: "100%",
        height: 50,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    resetButton: {
        borderWidth: 0,
        width: "100%",
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    loginButton: {
        borderWidth: 0,
        width: "100%",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    formContainer: {
        width: "100%",
        marginBottom: 20,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        padding: 10,
        borderRadius: 8,
    },
    errorText: {
        color: "#EF4444",
        marginLeft: 8,
        fontSize: 14,
    },
    loginLink: {
        marginTop: 20,
    },
    successContainer: {
        width: "100%",
        alignItems: "center",
        padding: 20,
    },
    successText: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
    },
    successSubText: {
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
        lineHeight: 24,
    },
})
