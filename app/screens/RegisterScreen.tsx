"use client"

import { SetStateAction, useState } from "react"
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button, Input } from "@ui-kitten/components"
import { useThemeContext } from "../utils/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

// Componente de senha com visibilidade
const InputPassword = ({ value, onChangeText, placeholder, style, label }: any) => {
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const { isDarkTheme, colors } = useThemeContext()

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry)
    }

    return (
        <View style={[style, { position: "relative" }]}>
            <Input
                style={{ paddingRight: 40 }}
                placeholder={placeholder}
                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                value={value}
                label={label}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
            />
            <TouchableOpacity
                style={{ position: "absolute", right: 10, top: "50%", transform: [{ translateY: -10 }] }}
                onPress={toggleSecureEntry}
            >
                <Feather name={secureTextEntry ? "eye-off" : "eye"} size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
        </View>
    )
}

export default function RegisterScreen() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()

    // Função para lidar com erros de autenticação
    const handleAuthError = (error: any) => {
        setIsLoading(false)
        console.error("Erro de registro:", error)

        let errorMessage = "Ocorreu um erro durante o registro. Tente novamente."

        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    errorMessage = "Este email já está em uso."
                    break
                case "auth/invalid-email":
                    errorMessage = "Email inválido."
                    break
                case "auth/weak-password":
                    errorMessage = "A senha é muito fraca."
                    break
                case "auth/network-request-failed":
                    errorMessage = "Erro de conexão. Verifique sua internet."
                    break
            }
        }

        setError(errorMessage)
    }

    // Handle Registration
    const handleRegister = async () => {
        // Validação
        if (!name || !email || !password || !confirmPassword) {
            setError("Por favor, preencha todos os campos.")
            return
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.")
            return
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.")
            return
        }

        setError("")
        setIsLoading(true)

        try {
            // Criar usuário com email e senha
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Atualizar perfil com nome
            await updateProfile(user, {
                displayName: name,
            })

            // Criar documento do usuário no Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                first_name: name.split(" ")[0],
                last_name: name.split(" ").slice(1).join(" "),
                role: "user", // Papel padrão
                status: "active",
                createdAt: new Date(),
                logginFormat: "email",
            })

            setIsLoading(false)
            router.navigate("Tabs")
        } catch (e: any) {
            handleAuthError(e)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            style={[styles.scrollContainer, { backgroundColor: isDarkTheme ? "#111827" : "#fff" }]}
        >
            <View style={styles.container}>
                {/* Header Gradient */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.topShape}
                />

                <View style={styles.content}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                        defaultSource={require("../../assets/logo.png")}
                    />

                    <Text
                        style={[styles.headerText, { color: isDarkTheme ? colors.secondary : colors.primary, marginBottom: 30 }]}
                    >
                        Criar Nova Conta
                    </Text>

                    <View style={styles.formContainer}>
                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                            ]}
                            placeholder="Digite seu Nome Completo"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Nome"
                            value={name}
                            onChangeText={(text) => {
                                setName(text)
                                setError("")
                            }}
                            disabled={isLoading}
                        />

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

                        <InputPassword
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                            ]}
                            placeholder="Digite sua Senha"
                            value={password}
                            label="Senha"
                            onChangeText={(text: SetStateAction<string>) => {
                                setPassword(text)
                                setError("")
                            }}
                            disabled={isLoading}
                        />

                        <InputPassword
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                            ]}
                            placeholder="Confirme sua Senha"
                            value={confirmPassword}
                            label="Confirmar Senha"
                            onChangeText={(text: SetStateAction<string>) => {
                                setConfirmPassword(text)
                                setError("")
                            }}
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
                            style={[styles.registerButton, { backgroundColor: colors.primary }]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.registerButtonText}>Criar Conta</Text>
                            )}
                        </Button>
                    </View>

                    <TouchableOpacity style={styles.loginLink} onPress={() => router.navigate("Login")}>
                        <Text style={{ color: isDarkTheme ? "#E5E7EB" : "#1F2937" }}>
                            Já tem uma conta?{" "}
                            <Text style={{ color: isDarkTheme ? colors.secondary : colors.primary, fontWeight: "bold" }}>
                                Faça login
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Gradient */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.secondaryDark, colors.primaryDark] : [colors.secondary, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bottomShape}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        ...Platform.select({
            web: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "100%",
            },
        }),
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
    logo: { width: 150, height: 150, resizeMode: "contain", marginBottom: 20 },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
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
    registerButton: {
        borderWidth: 0,
        width: "100%",
    },
    registerButtonText: {
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
})
