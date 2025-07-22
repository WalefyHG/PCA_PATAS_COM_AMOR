"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Share,
    Clipboard,
    StyleSheet,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { CustomPicker } from "../components/CustomPicker"
import { ErrorModal } from "../components/ErrorModal"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import { asaasService } from "@/app/repositories/AsaasRepository"
import type { Ong } from "../../domain/entities/Ongs"

interface DonationScreenProps {
    navigation?: any
}

export const DonationScreen: React.FC<DonationScreenProps> = ({ navigation }) => {
    const { isDarkTheme, colors } = useThemeContext()

    // Form states
    const [selectedOng, setSelectedOng] = useState<Ong | null>(null)
    const [customAmount, setCustomAmount] = useState("")
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
    const [donorName, setDonorName] = useState("")
    const [donorEmail, setDonorEmail] = useState("")
    const [donorPhone, setDonorPhone] = useState("")
    const [donorCpf, setDonorCpf] = useState("")

    // UI states
    const [ongs, setOngs] = useState<Ong[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingOngs, setLoadingOngs] = useState(true)
    const [showPayment, setShowPayment] = useState(false)
    const [paymentData, setPaymentData] = useState<any>(null)

    // Error Modal states
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: "",
        message: "",
        type: "error" as "error" | "success" | "warning" | "info",
    })

    const predefinedAmounts = [10, 25, 50, 100, 200, 500]

    // Limites de caracteres
    const MAX_NAME_LENGTH = 100
    const MAX_EMAIL_LENGTH = 100
    const MAX_PHONE_LENGTH = 15
    const MAX_CPF_LENGTH = 14
    const MAX_AMOUNT_DIGITS = 8 // R$ 999.999,99

    useEffect(() => {
        loadOngs()
    }, [])

    const showError = (message: string, title?: string, type: "error" | "success" | "warning" | "info" = "error") => {
        setErrorModal({
            visible: true,
            title: title || "",
            message,
            type,
        })
    }

    const hideError = () => {
        setErrorModal({
            visible: false,
            title: "",
            message: "",
            type: "error",
        })
    }

    const loadOngs = async () => {
        try {
            setLoadingOngs(true)
            const activeOngs = await ongRepository.getAllActiveOngs()
            setOngs(activeOngs)
        } catch (error) {
            console.error("Error loading ONGs:", error)
            showError("Não foi possível carregar as ONGs. Tente novamente.")
        } finally {
            setLoadingOngs(false)
        }
    }

    // Mask functions
    const formatCurrency = (value: string) => {
        // Remove tudo que não é dígito
        const digits = value.replace(/\D/g, "")

        if (!digits) return ""

        // Limita a quantidade de dígitos
        const limitedDigits = digits.slice(0, MAX_AMOUNT_DIGITS)

        // Converte para número e divide por 100 para ter os centavos
        const number = Number.parseInt(limitedDigits) / 100

        // Formata como moeda brasileira
        return number.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
    }

    const formatCpf = (text: string) => {
        // Remove tudo que não é dígito
        const digits = text.replace(/\D/g, "").slice(0, 11) // Limita a 11 dígitos

        // Aplica a máscara do CPF
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
        if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
    }

    const formatPhone = (text: string) => {
        // Remove tudo que não é dígito
        const digits = text.replace(/\D/g, "").slice(0, 11) // Limita a 11 dígitos

        // Aplica a máscara do telefone
        if (digits.length <= 2) return `(${digits}`
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
        if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }

    // Convert functions for ASAAS
    const convertCurrencyToNumber = (currencyString: string): number => {
        // Remove símbolos de moeda e converte para número
        const cleanString = currencyString.replace(/[R$\s.]/g, "").replace(",", ".")
        return Number.parseFloat(cleanString) || 0
    }

    const convertCpfToNumber = (cpfString: string): string => {
        // Remove pontos e traços, mantém apenas números
        return cpfString.replace(/\D/g, "")
    }

    const convertPhoneToNumber = (phoneString: string): string => {
        // Remove parênteses, espaços e traços, mantém apenas números
        return phoneString.replace(/\D/g, "")
    }

    const validateForm = () => {
        if (!selectedOng) {
            showError("Selecione uma ONG para continuar com a doação.")
            return false
        }

        const amount = selectedAmount || convertCurrencyToNumber(customAmount)
        if (!amount || amount <= 0) {
            showError("Selecione ou digite um valor para doação.")
            return false
        }

        if (amount < 1) {
            showError("O valor mínimo para doação é R$ 1,00.")
            return false
        }

        if (amount > 999999.99) {
            showError("O valor máximo para doação é R$ 999.999,99.")
            return false
        }

        if (!donorName.trim() || donorName.trim().length < 2) {
            showError("Digite seu nome completo (mínimo 2 caracteres).")
            return false
        }

        if (!donorEmail.trim() || !donorEmail.includes("@") || !donorEmail.includes(".")) {
            showError("Digite um email válido (exemplo: seu@email.com).")
            return false
        }

        if (!donorPhone.trim()) {
            showError("Digite seu telefone para contato.")
            return false
        }

        const cleanCpf = convertCpfToNumber(donorCpf)
        if (!cleanCpf || cleanCpf.length !== 11) {
            showError("Digite um CPF válido com 11 dígitos.")
            return false
        }

        const cleanPhone = convertPhoneToNumber(donorPhone)
        if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
            showError("Digite um telefone válido (10 ou 11 dígitos).")
            return false
        }

        return true
    }

    const handleDonation = async () => {
        if (!validateForm()) return

        try {
            setLoading(true)

            const donationAmount = selectedAmount || convertCurrencyToNumber(customAmount)
            const cleanCpf = convertCpfToNumber(donorCpf)
            const cleanPhone = convertPhoneToNumber(donorPhone)

            // Create customer in ASAAS
            const customer = await asaasService.createCustomer({
                name: donorName.trim(),
                email: donorEmail.trim().toLowerCase(),
                phone: cleanPhone,
                mobilePhone: cleanPhone,
                cpfCnpj: cleanCpf,
            })

            // Create PIX payment
            const payment = await asaasService.createPixPayment({
                customer: customer.id!,
                billingType: "PIX",
                value: donationAmount,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                description: `Doação para ${selectedOng!.name}`,
                externalReference: `donation_${selectedOng!.id}_${Date.now()}`,
                status: "PENDING"
            })

            // Get PIX QR Code
            const qrCodeData = await asaasService.getPixQrCode(payment.id)

            // Save donation to Firebase
            await asaasService.createDonation({
                ongId: selectedOng!.id ?? "",
                ongName: selectedOng!.name,
                donorName: donorName.trim(),
                donorEmail: donorEmail.trim().toLowerCase(),
                donorPhone: cleanPhone,
                donorCpf: cleanCpf,
                amount: donationAmount,
                pixKey: selectedOng!.pixKey,
                asaasPaymentId: payment.id,
                qrCode: qrCodeData.encodedImage,
                pixCopyPaste: qrCodeData.payload,
            })

            setPaymentData({
                ...payment,
                qrCode: qrCodeData.encodedImage,
                pixCopyPaste: qrCodeData.payload,
                amount: donationAmount,
                ongName: selectedOng!.name,
            })

            setShowPayment(true)
        } catch (error: any) {
            console.error("Error creating donation:", error)
            let errorMessage = "Não foi possível processar a doação. Tente novamente."

            if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const firstError = error?.response?.data?.errors?.[0]?.description
                console.log("Asaas Error:", firstError)
                if (firstError) {
                    // Mapeia para uma mensagem mais amigável
                    if (firstError.includes("CPF")) {
                        errorMessage = "O CPF informado é inválido. Verifique e tente novamente."
                    } else if (firstError.includes("email")) {
                        errorMessage = "O email informado é inválido. Verifique e tente novamente."
                    } else if (firstError.includes("phone")) {
                        errorMessage = "O telefone informado é inválido. Verifique e tente novamente."
                    } else {
                        errorMessage = firstError
                    }
                }
            }

            showError(errorMessage, "Erro no Processamento")
        } finally {
            setLoading(false)
        }
    }

    const copyPixCode = async () => {
        if (paymentData?.pixCopyPaste) {
            Clipboard.setString(paymentData.pixCopyPaste)
            showError("Código PIX copiado para a área de transferência!", "Sucesso", "success")
        }
    }

    const sharePixCode = async () => {
        if (paymentData?.pixCopyPaste) {
            try {
                await Share.share({
                    message: `Código PIX para doação: ${paymentData.pixCopyPaste}`,
                    title: "Código PIX - Doação",
                })
            } catch (error) {
                console.error("Error sharing PIX code:", error)
                showError("Não foi possível compartilhar o código PIX.")
            }
        }
    }

    const resetForm = () => {
        setSelectedOng(null)
        setCustomAmount("")
        setSelectedAmount(null)
        setDonorName("")
        setDonorEmail("")
        setDonorPhone("")
        setDonorCpf("")
        setShowPayment(false)
        setPaymentData(null)
    }

    const handleCustomAmountChange = (text: string) => {
        const formatted = formatCurrency(text)
        setCustomAmount(formatted)
        setSelectedAmount(null)
    }

    const handlePhoneChange = (text: string) => {
        const formatted = formatPhone(text)
        setDonorPhone(formatted)
    }

    const handleCpfChange = (text: string) => {
        const formatted = formatCpf(text)
        setDonorCpf(formatted)
    }

    const handleNameChange = (text: string) => {
        // Remove números e caracteres especiais, mantém apenas letras e espaços
        const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, "").slice(0, MAX_NAME_LENGTH)
        setDonorName(cleanText)
    }

    const handleEmailChange = (text: string) => {
        // Remove espaços e limita caracteres
        const cleanText = text.replace(/\s/g, "").slice(0, MAX_EMAIL_LENGTH)
        setDonorEmail(cleanText)
    }

    if (showPayment && paymentData) {
        return (
            <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }}>
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingTop: 60,
                        paddingBottom: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <TouchableOpacity onPress={resetForm} style={{ marginRight: 15 }}>
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Pagamento PIX</Text>
                    </View>
                </LinearGradient>

                <ScrollView style={{ flex: 1, padding: 20 }}>
                    <View
                        style={{
                            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                            borderRadius: 15,
                            padding: 20,
                            marginBottom: 20,
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                marginBottom: 10,
                            }}
                        >
                            Doação para {paymentData.ongName}
                        </Text>
                        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.primary, marginBottom: 20 }}>
                            {paymentData.amount.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </Text>

                        {paymentData.qrCode && (
                            <View
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    padding: 15,
                                    borderRadius: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <Image
                                    source={{ uri: `data:image/png;base64,${paymentData.qrCode}` }}
                                    style={{ width: 200, height: 200 }}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        <Text
                            style={{
                                fontSize: 16,
                                color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                textAlign: "center",
                                marginBottom: 20,
                                lineHeight: 22,
                            }}
                        >
                            Escaneie o QR Code acima ou use os botões abaixo para copiar/compartilhar o código PIX
                        </Text>

                        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                            <TouchableOpacity
                                onPress={copyPixCode}
                                style={{
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: 20,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    shadowColor: colors.primary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Feather name="copy" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Copiar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={sharePixCode}
                                style={{
                                    backgroundColor: colors.secondary,
                                    paddingHorizontal: 20,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    shadowColor: colors.secondary,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Feather name="share-2" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Compartilhar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View
                        style={{
                            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                            borderRadius: 15,
                            padding: 20,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                            marginBottom: 50,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                            <Feather name="info" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                }}
                            >
                                Instruções
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 14,
                                color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                lineHeight: 20,
                            }}
                        >
                            • Após realizar o pagamento, você receberá uma confirmação por email{"\n"}• O pagamento pode levar alguns
                            minutos para ser processado{"\n"}• Em caso de dúvidas, entre em contato com a ONG
                        </Text>
                    </View>
                </ScrollView>

                <ErrorModal
                    visible={errorModal.visible}
                    title={errorModal.title}
                    message={errorModal.message}
                    type={errorModal.type}
                    onClose={hideError}
                />
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }}>
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingTop: 60,
                    paddingBottom: 20,
                    paddingHorizontal: 20,
                }}
            >
                <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center" }}>Fazer Doação</Text>
                <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", textAlign: "center", marginTop: 8 }}>
                    Ajude uma causa que você acredita
                </Text>
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* ONG Selection */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Feather name="heart" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                            }}
                        >
                            Selecionar ONG *
                        </Text>
                    </View>

                    {loadingOngs ? (
                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                padding: 24,
                                alignItems: "center",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={{ color: isDarkTheme ? "#9CA3AF" : "#6B7280", marginTop: 12, fontSize: 16 }}>
                                Carregando ONGs...
                            </Text>
                        </View>
                    ) : (
                        <CustomPicker
                            items={ongs.map((ong) => ({
                                label: ong.name,
                                value: ong.id ?? "",
                                ...ong,
                            }))}
                            selectedValue={selectedOng?.id ?? ""}
                            onValueChange={(value: string) => {
                                const foundOng = ongs.find((ong) => ong.id === value)
                                setSelectedOng(foundOng ?? null)
                            }}
                            placeholder="Selecione uma ONG"
                        />
                    )}

                    {selectedOng && (
                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                padding: 16,
                                marginTop: 12,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.primary,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                    marginBottom: 4,
                                }}
                            >
                                {selectedOng.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                    lineHeight: 20,
                                }}
                                numberOfLines={3}
                            >
                                {selectedOng.description}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Amount Selection */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Feather name="dollar-sign" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                            }}
                        >
                            Valor da Doação *
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                        {predefinedAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                onPress={() => {
                                    setSelectedAmount(amount)
                                    setCustomAmount("")
                                }}
                                style={{
                                    backgroundColor: selectedAmount === amount ? colors.primary : isDarkTheme ? "#1F2937" : "#FFFFFF",
                                    paddingHorizontal: 20,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: selectedAmount === amount ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                                    minWidth: 100,
                                    alignItems: "center",
                                    shadowColor: selectedAmount === amount ? colors.primary : "#000",
                                    shadowOffset: { width: 0, height: selectedAmount === amount ? 4 : 2 },
                                    shadowOpacity: selectedAmount === amount ? 0.3 : 0.1,
                                    shadowRadius: selectedAmount === amount ? 8 : 4,
                                    elevation: selectedAmount === amount ? 5 : 2,
                                }}
                            >
                                <Text
                                    style={{
                                        color: selectedAmount === amount ? "white" : isDarkTheme ? "#FFFFFF" : "#1F2937",
                                        fontWeight: "bold",
                                        fontSize: 16,
                                    }}
                                >
                                    {amount.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View
                        style={{
                            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: customAmount ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <TextInput
                            style={{
                                padding: 16,
                                fontSize: 18,
                                color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                fontWeight: "600",
                            }}
                            placeholder="R$ 0,00 (valor personalizado)"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            value={customAmount}
                            onChangeText={handleCustomAmountChange}
                            keyboardType="numeric"
                        />
                    </View>

                    <Text
                        style={{
                            fontSize: 12,
                            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                            marginTop: 8,
                            textAlign: "center",
                        }}
                    >
                        Valor mínimo: R$ 1,00 • Valor máximo: R$ 999.999,99
                    </Text>
                </View>

                {/* Donor Information */}
                <View style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Feather name="user" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                            }}
                        >
                            Seus Dados
                        </Text>
                    </View>

                    <View style={{ gap: 12 }}>
                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: donorName ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <TextInput
                                style={{
                                    padding: 16,
                                    fontSize: 16,
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                }}
                                placeholder="Nome completo *"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={donorName}
                                onChangeText={handleNameChange}
                                maxLength={MAX_NAME_LENGTH}
                            />
                        </View>

                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: donorEmail ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <TextInput
                                style={{
                                    padding: 16,
                                    fontSize: 16,
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                }}
                                placeholder="Email *"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={donorEmail}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                maxLength={MAX_EMAIL_LENGTH}
                            />
                        </View>

                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: donorPhone ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <TextInput
                                style={{
                                    padding: 16,
                                    fontSize: 16,
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                }}
                                placeholder="(11) 99999-9999 *"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={donorPhone}
                                onChangeText={handlePhoneChange}
                                keyboardType="phone-pad"
                                maxLength={MAX_PHONE_LENGTH}
                            />
                        </View>

                        <View
                            style={{
                                backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: donorCpf ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <TextInput
                                style={{
                                    padding: 16,
                                    fontSize: 16,
                                    color: isDarkTheme ? "#FFFFFF" : "#1F2937",
                                }}
                                placeholder="000.000.000-00 *"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={donorCpf}
                                onChangeText={handleCpfChange}
                                keyboardType="numeric"
                                maxLength={MAX_CPF_LENGTH}
                            />
                        </View>
                    </View>
                </View>

                {/* Donation Button */}
                <TouchableOpacity
                    onPress={handleDonation}
                    disabled={loading}
                    style={{
                        marginBottom: 20,
                    }}
                >
                    <LinearGradient
                        colors={
                            loading
                                ? [isDarkTheme ? "#6B7280" : "#9CA3AF", isDarkTheme ? "#6B7280" : "#9CA3AF"]
                                : isDarkTheme
                                    ? [colors.primaryDark, colors.secondaryDark]
                                    : [colors.primary, colors.secondary]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            borderRadius: 12,
                            padding: 18,
                            alignItems: "center",
                            shadowColor: loading ? "#000" : colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: loading ? 0.1 : 0.3,
                            shadowRadius: 8,
                            elevation: loading ? 2 : 5,
                            marginBottom: 20,
                        }}
                    >
                        {loading ? (
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
                                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Processando...</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Feather name="credit-card" size={20} color="white" style={{ marginRight: 10 }} />
                                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Gerar PIX para Doação</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <ErrorModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                type={errorModal.type}
                onClose={hideError}
            />
        </View>
    )
}


const styles = StyleSheet.create({
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
})