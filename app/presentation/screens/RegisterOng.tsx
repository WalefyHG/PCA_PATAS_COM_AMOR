"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import EnchanedImageUpload from "../components/EnchanedImageUpload"
import type { Ong } from "@/app/domain/entities/Ongs"

type RegisterOngRouteParams = {
    RegisterOng: {
        ong?: Ong
    }
}

interface OngFormData {
    name: string
    email: string
    phone: string
    cnpj: string
    pixKey: string
    description: string
    logoUrl: string
}

const RegisterOng: React.FC = () => {
    const navigation = useNavigation()
    const route = useRoute<RouteProp<RegisterOngRouteParams, "RegisterOng">>()
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()

    const editingOng = route.params?.ong
    const isEditing = !!editingOng

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<OngFormData>({
        name: "",
        email: "",
        phone: "",
        cnpj: "",
        pixKey: "",
        description: "",
        logoUrl: "",
    })

    useEffect(() => {
        if (editingOng) {
            setFormData({
                name: editingOng.name,
                email: editingOng.email,
                phone: editingOng.phone,
                cnpj: editingOng.cnpj,
                pixKey: editingOng.pixKey,
                description: editingOng.description,
                logoUrl: editingOng.logoUrl || "",
            })
        }
    }, [editingOng])

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert("Erro", "Nome da ONG é obrigatório")
            return false
        }

        if (!formData.email.trim()) {
            Alert.alert("Erro", "Email é obrigatório")
            return false
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            Alert.alert("Erro", "Email inválido")
            return false
        }

        if (!formData.phone.trim()) {
            Alert.alert("Erro", "Telefone é obrigatório")
            return false
        }

        if (!formData.cnpj.trim()) {
            Alert.alert("Erro", "CNPJ é obrigatório")
            return false
        }

        if (formData.cnpj.replace(/\D/g, "").length !== 14) {
            Alert.alert("Erro", "CNPJ deve ter 14 dígitos")
            return false
        }

        if (!formData.pixKey.trim()) {
            Alert.alert("Erro", "Chave PIX é obrigatória")
            return false
        }

        if (!formData.description.trim()) {
            Alert.alert("Erro", "Descrição é obrigatória")
            return false
        }

        if (formData.description.length < 50) {
            Alert.alert("Erro", "Descrição deve ter pelo menos 50 caracteres")
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm() || !user?.uid) return

        setLoading(true)
        try {
            const ongData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                cnpj: formData.cnpj.replace(/\D/g, ""),
                pixKey: formData.pixKey.trim(),
                description: formData.description.trim(),
                logoUrl: formData.logoUrl,
                userId: user.uid,
                isActive: true,
            }

            if (isEditing && editingOng?.id) {
                await ongRepository.updateOng(editingOng.id, ongData)
                Alert.alert("Sucesso", "ONG atualizada com sucesso!", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ])
            } else {
                await ongRepository.createOng(ongData)
                Alert.alert("Sucesso", "ONG cadastrada com sucesso!", [
                    {
                        text: "OK",
                        onPress: () => {
                            setFormData({
                                name: "",
                                email: "",
                                phone: "",
                                cnpj: "",
                                pixKey: "",
                                description: "",
                                logoUrl: "",
                            })
                            navigation.goBack()
                        },
                    },
                ])
            }
        } catch (error) {
            console.error("Error saving ONG:", error)
            Alert.alert("Erro", `Erro ao ${isEditing ? "atualizar" : "cadastrar"} ONG. Tente novamente.`)
        } finally {
            setLoading(false)
        }
    }

    const formatCNPJ = (text: string) => {
        const digits = text.replace(/\D/g, "")
        if (digits.length <= 2) return digits
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
        if (digits.length <= 12)
            return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
    }

    const formatPhone = (text: string) => {
        const digits = text.replace(/\D/g, "")
        if (digits.length <= 2) return `(${digits}`
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB",
        },
        header: {
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 20,
            alignItems: "center",
        },
        backButton: {
            position: "absolute",
            top: 60,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: 8,
        },
        headerSubtitle: {
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 20,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginBottom: 16,
        },
        input: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDarkTheme ? "#374151" : "#D1D5DB",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginBottom: 16,
        },
        textArea: {
            minHeight: 100,
            textAlignVertical: "top",
        },
        charCount: {
            fontSize: 12,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            textAlign: "right",
            marginTop: -12,
            marginBottom: 16,
        },
        submitButton: {
            marginTop: 20,
            marginBottom: 40,
        },
        buttonGradient: {
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
        },
        buttonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
        },
        disabledButton: {
            opacity: 0.6,
        },
        logoSection: {
            alignItems: "center",
            marginBottom: 24,
        },
        logoLabel: {
            fontSize: 16,
            fontWeight: "600",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginBottom: 12,
        },
        logoOptional: {
            fontSize: 12,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            marginTop: 8,
        },
    })

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{isEditing ? "Editar ONG" : "Cadastrar ONG"}</Text>
                <Text style={styles.headerSubtitle}>
                    {isEditing ? "Atualize as informações da organização" : "Registre sua organização para receber doações"}
                </Text>
            </LinearGradient>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informações Básicas</Text>

                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Nome da ONG *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                        />

                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Email da ONG *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => {
                                const formatted = formatPhone(text)
                                setFormData({ ...formData, phone: formatted })
                            }}
                            placeholder="Telefone (11) 99999-9999 *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />

                        <TextInput
                            style={styles.input}
                            value={formData.cnpj}
                            onChangeText={(text) => {
                                const formatted = formatCNPJ(text)
                                setFormData({ ...formData, cnpj: formatted })
                            }}
                            placeholder="CNPJ XX.XXX.XXX/XXXX-XX *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            keyboardType="numeric"
                            maxLength={18}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informações de Pagamento</Text>

                        <TextInput
                            style={styles.input}
                            value={formData.pixKey}
                            onChangeText={(text) => setFormData({ ...formData, pixKey: text })}
                            placeholder="Chave PIX (email, telefone, CPF/CNPJ ou aleatória) *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sobre a ONG</Text>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Descreva a missão, objetivos e atividades da ONG (mínimo 50 caracteres) *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            multiline
                            numberOfLines={4}
                        />
                        <Text style={styles.charCount}>{formData.description.length}/50 caracteres mínimos</Text>
                    </View>

                    <View style={styles.logoSection}>
                        <Text style={styles.logoLabel}>Logo da ONG</Text>
                        <EnchanedImageUpload
                            onImageSelected={(url) => setFormData({ ...formData, logoUrl: url })}
                            currentImage={formData.logoUrl}
                        />
                        <Text style={styles.logoOptional}>Opcional - Adicione o logo da sua ONG</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Feather name={loading ? "loader" : isEditing ? "save" : "plus-circle"} size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>
                                {loading
                                    ? isEditing
                                        ? "Atualizando..."
                                        : "Cadastrando..."
                                    : isEditing
                                        ? "Atualizar ONG"
                                        : "Cadastrar ONG"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default RegisterOng
