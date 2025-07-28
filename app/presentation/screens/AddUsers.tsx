"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    Animated,
    Switch,
    StyleSheet,
    Dimensions,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { createUser, getUserProfile, updateUserProfile } from "../../repositories/FirebaseUserRepository"
import { useRoute } from "@react-navigation/native"
import { useThemeContext } from "../contexts/ThemeContext"
import { useNavigation } from "expo-router"
import { UserProfile } from "@/app/domain/entities/User"

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isWebPlatform = Platform.OS === "web"

export default function AddEditUserScreen() {
    const navigate = useNavigation<any>()
    const route = useRoute<any>()
    const { userId } = route.params || {}
    const isEditing = !!userId
    const { isDarkTheme, colors } = useThemeContext()

    const [user, setUser] = useState<UserProfile>({
        uid: "",
        email: "",
        displayName: "",
        role: "user",
        status: "active",
        phone: "",
        logginFormat: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(20)).current

    useEffect(() => {
        const loadUserData = async () => {
            if (isEditing && userId) {
                try {
                    const dataUser = await getUserProfile(userId)
                    if (dataUser) {
                        setUser(dataUser)
                    } else {
                        Alert.alert("Erro", "Não foi possível carregar os dados do pet.")
                    }
                } catch (error) {
                    console.error("Erro ao buscar pet:", error)
                    Alert.alert("Erro", "Erro ao carregar os dados do pet.")
                }
            }
        }

        loadUserData()
    }, [isEditing, userId])

    useEffect(() => {
        // Animar a entrada do conteúdo
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start()
    }, [])

    function handleInputChange(field: keyof UserProfile, value: any) {
        setUser((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        console.log("Salvando usuário:", user)
        if (!user.email || !user.displayName || !user.role || !user.status) {
            Alert.alert("Erro de Validação", "Preencha todos os campos obrigatórios.")
            return
        }

        try {
            setIsSubmitting(true)

            if (isEditing && userId) {
                await updateUserProfile(userId, user)
                Alert.alert("Sucesso", "Usuário atualizado com sucesso!")
            } else {
                await createUser(user)
                Alert.alert("Sucesso", "Usuário criado com sucesso!")
            }
            if (user.role === "admin") {
                navigate.navigate("AdminConsole")
            } else {
                navigate.navigate("Home")
            }
        } catch (error) {
            console.error(error)
            Alert.alert("Erro", "Erro ao salvar usuário, tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    function renderStatusBadge() {
        const isActive = user.status === "active"
        return (
            <View
                style={[
                    styles.statusBadge,
                    {
                        backgroundColor: isActive ? "#D1FAE5" : "#FEE2E2",
                        borderColor: isActive ? "#10B981" : "#EF4444",
                    },
                ]}
            >
                <Text style={{ color: isActive ? "#047857" : "#B91C1C", fontWeight: "600" }}>
                    {isActive ? "Ativo" : "Inativo"}
                </Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigate.goBack()} style={styles.backButton}>
                            <Feather name="arrow-left" size={isSmallScreen ? 18 : 20} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEditing ? "Editar Usuário" : "Adicionar Usuário"}</Text>
                        <View style={{ width: isSmallScreen ? 36 : 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={isWebPlatform && styles.webScrollContent}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Name */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Nome *</Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    { backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB", color: isDarkTheme ? "white" : "#374151" },
                                ]}
                                placeholder="Nome completo"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={user.displayName}
                                onChangeText={(value) => handleInputChange("displayName", value)}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Email *</Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    { backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB", color: isDarkTheme ? "white" : "#374151" },
                                ]}
                                placeholder="Email"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={user.email}
                                onChangeText={(value) => handleInputChange("email", value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Role */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Função *</Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    { backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB", color: isDarkTheme ? "white" : "#374151" },
                                ]}
                                placeholder="Ex: administrador, usuário"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={user.role}
                                onChangeText={(value) => handleInputChange("role", value)}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Phone */}
                        {user.logginFormat === "email" && (
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Telefone</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        { backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB", color: isDarkTheme ? "white" : "#374151" },
                                    ]}
                                    placeholder="Telefone (opcional)"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={user.phone || ""}
                                    onChangeText={(value) => handleInputChange("phone", value)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        )}

                        {/* Role */}
                        {user.role === "admin" && (
                            <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                                <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Função</Text>
                                <View style={styles.switchContainer}>
                                    <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Administrador</Text>
                                    <Switch
                                        value={user.role === "admin"}
                                        onValueChange={(value) => handleInputChange("role", value ? "admin" : "user")}
                                        trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                        thumbColor={user.role === "admin" ? "white" : "#F3F4F6"}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Status */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white", marginTop: 16 }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Status</Text>
                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Ativo</Text>
                                <Switch
                                    value={user.status === "active"}
                                    onValueChange={(value) => handleInputChange("status", value ? "active" : "inactive")}
                                    trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                    thumbColor={user.status === "active" ? "white" : "#F3F4F6"}
                                />
                            </View>
                            {renderStatusBadge()}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: isSubmitting ? (isDarkTheme ? "#4B5563" : "#D1D5DB") : colors.primary,
                                    opacity: isSubmitting ? 0.7 : 1,
                                },
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View style={styles.submitButtonContent}>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text style={styles.submitButtonText}>{isEditing ? "Atualizando..." : "Salvando..."}</Text>
                                </View>
                            ) : (
                                <View style={styles.submitButtonContent}>
                                    <Feather name="save" size={isSmallScreen ? 18 : 20} color="white" />
                                    <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Usuário" : "Salvar Usuário"}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 64 : Platform.OS === "android" ? 48 : 24,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: isSmallScreen ? 48 : 52,
        height: isSmallScreen ? 48 : 52,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    webScrollContent: {
        maxWidth: 600,
        alignSelf: "center",
        width: "100%",
    },
    inputContainer: {
        marginBottom: isSmallScreen ? 16 : 20,
    },
    inputLabel: {
        fontWeight: "600",
        marginBottom: 6,
        fontSize: isSmallScreen ? 13 : 14,
    },
    textInput: {
        borderRadius: 8,
        paddingVertical: Platform.OS === "web" ? 12 : 10,
        paddingHorizontal: 14,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
            height: 46,
        }),
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    switchLabel: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "600",
    },
    section: {
        borderRadius: 12,
        padding: isSmallScreen ? 10 : 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    sectionTitle: {
        fontWeight: "700",
        fontSize: isSmallScreen ? 15 : 16,
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: "flex-start",
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    submitButton: {
        marginTop: 30,
        borderRadius: 12,
        paddingVertical: isSmallScreen ? 12 : 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        ...(Platform.OS === "web" && {
            cursor: "pointer",
            transition: "0.2s opacity",
            ":hover": {
                opacity: 0.9,
            },
        }),
    },
    submitButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    submitButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: isSmallScreen ? 15 : 16,
    },
})
