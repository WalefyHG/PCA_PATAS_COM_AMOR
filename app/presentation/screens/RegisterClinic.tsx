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
    Switch,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useAccount } from "../contexts/AccountContext"
import { clinicRepository } from "../../repositories/FirebaseClinicRepository"
import EnchanedImageUpload from "../components/EnchanedImageUpload"
import type { Clinic } from "../../domain/entities/Clinic"

type RegisterClinicRouteParams = {
    RegisterClinic: {
        clinic?: Clinic
    }
}

interface ClinicFormData {
    name: string
    email: string
    phone: string
    cnpj: string
    crmv: string
    address: string
    description: string
    services: string[]
    logoUrl: string
    workingHours: {
        monday: { open: string; close: string; isOpen: boolean }
        tuesday: { open: string; close: string; isOpen: boolean }
        wednesday: { open: string; close: string; isOpen: boolean }
        thursday: { open: string; close: string; isOpen: boolean }
        friday: { open: string; close: string; isOpen: boolean }
        saturday: { open: string; close: string; isOpen: boolean }
        sunday: { open: string; close: string; isOpen: boolean }
    }
}

const RegisterClinic: React.FC = () => {
    const navigation = useNavigation()
    const route = useRoute<RouteProp<RegisterClinicRouteParams, "RegisterClinic">>()
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()
    const { refreshAccounts } = useAccount()

    const editingClinic = route.params?.clinic
    const isEditing = !!editingClinic

    const [loading, setLoading] = useState(false)
    const [currentService, setCurrentService] = useState("")
    const [formData, setFormData] = useState<ClinicFormData>({
        name: "",
        email: "",
        phone: "",
        cnpj: "",
        crmv: "",
        address: "",
        description: "",
        services: [],
        logoUrl: "",
        workingHours: {
            monday: { open: "08:00", close: "18:00", isOpen: true },
            tuesday: { open: "08:00", close: "18:00", isOpen: true },
            wednesday: { open: "08:00", close: "18:00", isOpen: true },
            thursday: { open: "08:00", close: "18:00", isOpen: true },
            friday: { open: "08:00", close: "18:00", isOpen: true },
            saturday: { open: "08:00", close: "12:00", isOpen: true },
            sunday: { open: "08:00", close: "12:00", isOpen: false },
        },
    })

    useEffect(() => {
        if (editingClinic) {
            setFormData({
                name: editingClinic.name,
                email: editingClinic.email,
                phone: editingClinic.phone,
                cnpj: editingClinic.cnpj,
                crmv: editingClinic.crmv,
                address: editingClinic.address,
                description: editingClinic.description,
                services: editingClinic.services,
                logoUrl: editingClinic.logoUrl || "",
                workingHours: editingClinic.workingHours,
            })
        }
    }, [editingClinic])

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert("Erro", "Nome da clínica é obrigatório")
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

        if (!formData.crmv.trim()) {
            Alert.alert("Erro", "CRMV é obrigatório")
            return false
        }

        if (!formData.address.trim()) {
            Alert.alert("Erro", "Endereço é obrigatório")
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

        if (formData.services.length === 0) {
            Alert.alert("Erro", "Adicione pelo menos um serviço")
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm() || !user?.uid) return

        setLoading(true)
        try {
            const clinicData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                cnpj: formData.cnpj.replace(/\D/g, ""),
                crmv: formData.crmv.trim(),
                address: formData.address.trim(),
                description: formData.description.trim(),
                services: formData.services,
                logoUrl: formData.logoUrl,
                workingHours: formData.workingHours,
                userId: user.uid,
                isActive: true,
            }

            if (isEditing && editingClinic?.id) {
                await clinicRepository.updateClinic(editingClinic.id, clinicData)
                Alert.alert("Sucesso", "Clínica atualizada com sucesso!", [
                    {
                        text: "OK",
                        onPress: () => {
                            refreshAccounts()
                            navigation.goBack()
                        },
                    },
                ])
            } else {
                await clinicRepository.createClinic(clinicData)
                Alert.alert("Sucesso", "Clínica cadastrada com sucesso!", [
                    {
                        text: "OK",
                        onPress: () => {
                            setFormData({
                                name: "",
                                email: "",
                                phone: "",
                                cnpj: "",
                                crmv: "",
                                address: "",
                                description: "",
                                services: [],
                                logoUrl: "",
                                workingHours: {
                                    monday: { open: "08:00", close: "18:00", isOpen: true },
                                    tuesday: { open: "08:00", close: "18:00", isOpen: true },
                                    wednesday: { open: "08:00", close: "18:00", isOpen: true },
                                    thursday: { open: "08:00", close: "18:00", isOpen: true },
                                    friday: { open: "08:00", close: "18:00", isOpen: true },
                                    saturday: { open: "08:00", close: "12:00", isOpen: true },
                                    sunday: { open: "08:00", close: "12:00", isOpen: false },
                                },
                            })
                            refreshAccounts()
                            navigation.goBack()
                        },
                    },
                ])
            }
        } catch (error) {
            console.error("Error saving clinic:", error)
            Alert.alert("Erro", `Erro ao ${isEditing ? "atualizar" : "cadastrar"} clínica. Tente novamente.`)
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

    const handleAddService = () => {
        if (currentService.trim()) {
            setFormData((prev) => ({
                ...prev,
                services: [...prev.services, currentService.trim()],
            }))
            setCurrentService("")
        }
    }

    const handleRemoveService = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }))
    }

    const updateWorkingHours = (day: keyof typeof formData.workingHours, field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value,
                },
            },
        }))
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
        serviceInputContainer: {
            flexDirection: "row",
            marginBottom: 16,
            gap: 8,
        },
        serviceInput: {
            flex: 1,
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDarkTheme ? "#374151" : "#D1D5DB",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
        },
        addServiceButton: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
        },
        servicesList: {
            marginTop: 8,
        },
        serviceItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
            padding: 12,
            borderRadius: 10,
            marginBottom: 8,
        },
        serviceText: {
            flex: 1,
            fontSize: 14,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginRight: 8,
        },
        workingHoursContainer: {
            marginBottom: 16,
        },
        dayContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        dayName: {
            fontSize: 16,
            fontWeight: "500",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            width: 80,
        },
        timeContainer: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            marginHorizontal: 16,
        },
        timeInput: {
            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
            borderWidth: 1,
            borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            width: 70,
            textAlign: "center",
        },
        timeSeparator: {
            marginHorizontal: 8,
            fontSize: 16,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
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

    const dayNames = {
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
        sunday: "Domingo",
    }

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

                <Text style={styles.headerTitle}>{isEditing ? "Editar Clínica" : "Cadastrar Clínica"}</Text>
                <Text style={styles.headerSubtitle}>
                    {isEditing ? "Atualize as informações da clínica" : "Registre sua clínica veterinária"}
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
                            placeholder="Nome da Clínica *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                        />

                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Email da Clínica *"
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

                        <TextInput
                            style={styles.input}
                            value={formData.crmv}
                            onChangeText={(text) => setFormData({ ...formData, crmv: text })}
                            placeholder="CRMV (Registro no Conselho) *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                        />

                        <TextInput
                            style={styles.input}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="Endereço completo *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sobre a Clínica</Text>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Descreva a clínica, especialidades e diferenciais (mínimo 50 caracteres) *"
                            placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            multiline
                            numberOfLines={4}
                        />
                        <Text style={styles.charCount}>{formData.description.length}/50 caracteres mínimos</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>

                        <View style={styles.serviceInputContainer}>
                            <TextInput
                                style={styles.serviceInput}
                                value={currentService}
                                onChangeText={setCurrentService}
                                placeholder="Adicionar serviço (ex: Consulta, Cirurgia, Vacinação)"
                                placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                            />
                            <TouchableOpacity
                                style={[styles.addServiceButton, { backgroundColor: colors.primary }]}
                                onPress={handleAddService}
                            >
                                <Feather name="plus" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {formData.services.length > 0 ? (
                            <View style={styles.servicesList}>
                                {formData.services.map((service, index) => (
                                    <View key={index} style={styles.serviceItem}>
                                        <Text style={styles.serviceText}>{service}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveService(index)}>
                                            <Feather name="trash-2" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.charCount}>Nenhum serviço adicionado ainda.</Text>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>

                        <View style={styles.workingHoursContainer}>
                            {Object.entries(dayNames).map(([dayKey, dayName]) => (
                                <View key={dayKey} style={styles.dayContainer}>
                                    <Text style={styles.dayName}>{dayName}</Text>

                                    {formData.workingHours[dayKey as keyof typeof formData.workingHours].isOpen ? (
                                        <View style={styles.timeContainer}>
                                            <TextInput
                                                style={styles.timeInput}
                                                value={formData.workingHours[dayKey as keyof typeof formData.workingHours].open}
                                                onChangeText={(text) =>
                                                    updateWorkingHours(dayKey as keyof typeof formData.workingHours, "open", text)
                                                }
                                                placeholder="08:00"
                                                placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                                            />
                                            <Text style={styles.timeSeparator}>às</Text>
                                            <TextInput
                                                style={styles.timeInput}
                                                value={formData.workingHours[dayKey as keyof typeof formData.workingHours].close}
                                                onChangeText={(text) =>
                                                    updateWorkingHours(dayKey as keyof typeof formData.workingHours, "close", text)
                                                }
                                                placeholder="18:00"
                                                placeholderTextColor={isDarkTheme ? "#6B7280" : "#9CA3AF"}
                                            />
                                        </View>
                                    ) : (
                                        <View style={styles.timeContainer}>
                                            <Text style={[styles.serviceText, { textAlign: "center" }]}>Fechado</Text>
                                        </View>
                                    )}

                                    <Switch
                                        value={formData.workingHours[dayKey as keyof typeof formData.workingHours].isOpen}
                                        onValueChange={(value) =>
                                            updateWorkingHours(dayKey as keyof typeof formData.workingHours, "isOpen", value)
                                        }
                                        trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                        thumbColor={
                                            formData.workingHours[dayKey as keyof typeof formData.workingHours].isOpen ? "white" : "#F3F4F6"
                                        }
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.logoSection}>
                        <Text style={styles.logoLabel}>Logo da Clínica</Text>
                        <EnchanedImageUpload
                            onImageSelected={(url) => setFormData({ ...formData, logoUrl: url })}
                            currentImage={formData.logoUrl}
                        />
                        <Text style={styles.logoOptional}>Opcional - Adicione o logo da sua clínica</Text>
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
                                        ? "Atualizar Clínica"
                                        : "Cadastrar Clínica"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default RegisterClinic
