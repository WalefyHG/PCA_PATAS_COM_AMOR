"use client"

import { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Image,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { createUserWithEmailAndPassword, updateProfile, type UserProfile } from "firebase/auth"
import { auth, db, uploadToCloudinary } from "../../data/datasources/firebase/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Input } from "@ui-kitten/components"
import { useThemeContext } from "../contexts/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import InputPassword from "../components/InputPassword"
import AnimatedProgressBar from "../components/AnimatedProgress"
import * as ImagePicker from "expo-image-picker"

interface FormData extends UserProfile {
    password: string
    confirmPassword: string
    photoProfile?: File | null
}

export default function RegisterScreenEnhanced() {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        first_name: "",
        last_name: "",
        phone: "",
        bio: "",
        photoURL: "",
        photoProfile: null,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)

    // Camera/Image picker states
    const [showImageModal, setShowImageModal] = useState(false)
    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

    const router = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()

    const totalSteps = 4
    const progress = (currentStep / totalSteps) * 100

    const stepTitles = ["Credenciais de Acesso", "Informações Pessoais", "Contato e Bio", "Foto de Perfil"]

    const stepDescriptions = [
        "Configure seu email e senha",
        "Nos conte seu nome completo",
        "Adicione telefone e uma breve descrição",
        "Adicione uma foto para personalizar seu perfil",
    ]

    const stepIcons = ["mail", "user", "phone", "camera"]

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        switch (step) {
            case 1:
                if (!formData.email) newErrors.email = "Email é obrigatório"
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email))) {
                    newErrors.email = "Email inválido"
                }
                if (!formData.password) newErrors.password = "Senha é obrigatória"
                else if (formData.password.length < 6) {
                    newErrors.password = "Senha deve ter pelo menos 6 caracteres"
                }
                if (!formData.confirmPassword) newErrors.confirmPassword = "Confirmação de senha é obrigatória"
                else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Senhas não coincidem"
                }
                break
            case 2:
                if (!formData.first_name) newErrors.first_name = "Nome é obrigatório"
                if (!formData.last_name) newErrors.last_name = "Sobrenome é obrigatório"
                if (!formData.displayName) newErrors.displayName = "Nome de exibição é obrigatório"
                break
            case 3:
                if (formData.phone && !/^$$\d{2}$$\s\d{4,5}-\d{4}$/.test(String(formData.phone))) {
                    newErrors.phone = "Formato: (11) 99999-9999"
                }
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
        }
    }

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleInputChange = (field: keyof FormData, value: string | File | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handlePhoneChange = (value: string) => {
        let formatted = value.replace(/\D/g, "")
        if (formatted.length <= 11) {
            formatted = formatted.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
            if (formatted.length < 14) {
                formatted = formatted.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
            }
        }
        handleInputChange("phone", formatted)
    }

    const handleImageSelected = (uri: string) => {
        handleInputChange("photoURL", uri)
    }

    const handleFileSelected = (file: File) => {
        handleInputChange("photoProfile", file)
    }

    // Enhanced image picker with platform-specific options
    const showImagePickerOptions = () => {
        setShowImageModal(true)
    }

    // Mobile camera function (Android/iOS)
    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()

        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua câmera.")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            aspect: [1, 1],
        })

        if (!result.canceled) {
            handleInputChange("photoURL", result.assets[0].uri)
        }
        setShowImageModal(false)
    }

    // Mobile gallery function (Android/iOS)
    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua galeria de fotos.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            aspect: [1, 1],
        })

        if (!result.canceled) {
            handleInputChange("photoURL", result.assets[0].uri)
        }
        setShowImageModal(false)
    }

    // Web webcam function
    const startWebcam = async () => {
        if (Platform.OS !== "web") return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
            })
            setWebcamStream(stream)
            setIsWebcamActive(true)
            setShowImageModal(false)
        } catch (error) {
            console.error("Erro ao acessar webcam:", error)
            Alert.alert("Erro", "Não foi possível acessar a webcam.")
        }
    }

    // Web file upload function
    const uploadFileFromWeb = () => {
        if (Platform.OS !== "web") return

        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"

        input.onchange = (event: any) => {
            const file = event.target.files[0]
            if (file) {
                handleInputChange("photoProfile", file)
                const reader = new FileReader()
                reader.onload = (e) => {
                    if (e.target?.result) {
                        handleInputChange("photoURL", e.target.result as string)
                    }
                }
                reader.readAsDataURL(file)
            }
        }

        input.click()
        setShowImageModal(false)
    }

    // Capture photo from webcam
    const captureWebcamPhoto = () => {
        if (!webcamStream || Platform.OS !== "web") return

        const video = document.getElementById("webcam-video") as HTMLVideoElement
        if (!video) return

        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.drawImage(video, 0, 0)
            const imageData = canvas.toDataURL("image/jpeg", 0.7)
            handleInputChange("photoURL", imageData)
            stopWebcam()
        }
    }

    // Stop webcam
    const stopWebcam = () => {
        if (webcamStream) {
            webcamStream.getTracks().forEach((track) => track.stop())
            setWebcamStream(null)
        }
        setIsWebcamActive(false)
    }

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
                case "auth/invalid-profile-attribute":
                    errorMessage = "Atributo de perfil inválido. Verifique os dados inseridos."
                    break
                default:
                    errorMessage = "Erro desconhecido. Tente novamente mais tarde."
                    break
            }
        }

        setErrors((prev) => ({ ...prev, general: errorMessage }))
    }

    const handleSubmit = async () => {
        if (!validateStep(4)) return

        setIsLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                String(formData.email),
                String(formData.password),
            )
            const user = userCredential.user

            let uploadedPhotoURL = ""

            // Upload da imagem usando Cloudinary
            if (formData.photoURL && formData.photoURL !== "") {
                try {
                    if (Platform.OS === "web" && formData.photoProfile) {
                        // Para web, usar o arquivo File
                        uploadedPhotoURL = await uploadToCloudinary(formData.photoProfile, (progress) => {
                            setUploadProgress(progress)
                        })
                    } else if (typeof formData.photoURL === "string" && formData.photoURL) {
                        // Para mobile, usar a URI
                        uploadedPhotoURL = await uploadToCloudinary(formData.photoURL, (progress) => {
                            setUploadProgress(progress)
                        })
                    }
                } catch (uploadError) {
                    console.error("Erro no upload da imagem:", uploadError)
                    // Continuar sem a imagem se o upload falhar
                }
            }

            await updateProfile(user, {
                displayName: typeof formData.displayName === "string" ? formData.displayName : undefined,
                photoURL: uploadedPhotoURL || undefined,
            })

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: formData.displayName,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                bio: formData.bio,
                photoURL: uploadedPhotoURL || "",
                role: "user",
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

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDarkTheme ? "#374151" : "#E5E7EB" }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progress}%`,
                            backgroundColor: colors.primary,
                        },
                    ]}
                />
            </View>
            <Text style={[styles.progressText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                Passo {currentStep} de {totalSteps}
            </Text>
        </View>
    )

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.email && styles.inputError,
                            ]}
                            placeholder="seu@email.com"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Email *"
                            value={String(formData.email ?? "")}
                            onChangeText={(text) => handleInputChange("email", text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <InputPassword
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            label="Senha *"
                            onChangeText={(text: string) => handleInputChange("password", text)}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        <InputPassword
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Digite a senha novamente"
                            value={formData.confirmPassword}
                            label="Confirmar Senha *"
                            onChangeText={(text: string) => handleInputChange("confirmPassword", text)}
                        />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>
                )

            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.first_name && styles.inputError,
                            ]}
                            placeholder="João"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Nome *"
                            value={String(formData.first_name ?? "")}
                            onChangeText={(text) => handleInputChange("first_name", text)}
                        />
                        {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.last_name && styles.inputError,
                            ]}
                            placeholder="Silva"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Sobrenome *"
                            value={String(formData.last_name ?? "")}
                            onChangeText={(text) => handleInputChange("last_name", text)}
                        />
                        {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.displayName && styles.inputError,
                            ]}
                            placeholder="Como você gostaria de ser chamado?"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Nome de Exibição *"
                            value={String(formData.displayName ?? "")}
                            onChangeText={(text) => handleInputChange("displayName", text)}
                        />
                        {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
                        <Text style={[styles.helperText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            Este será o nome que outros usuários verão
                        </Text>
                    </View>
                )

            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.phone && styles.inputError,
                            ]}
                            placeholder="(11) 99999-9999"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Telefone (opcional)"
                            value={String(formData.phone ?? "")}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                        <Input
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                            ]}
                            placeholder="Conte um pouco sobre você..."
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Biografia (opcional)"
                            value={String(formData.bio ?? "")}
                            onChangeText={(text) => handleInputChange("bio", text)}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                        />
                        <Text style={[styles.charCount, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            {typeof formData.bio === "string" ? formData.bio.length : 0}/500 caracteres
                        </Text>
                    </View>
                )

            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.imageUploadSection}>
                            <TouchableOpacity
                                style={[
                                    styles.imageContainer,
                                    {
                                        borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                                    },
                                ]}
                                onPress={showImagePickerOptions}
                            >
                                {formData.photoURL ? (
                                    <Image source={{ uri: formData.photoURL as string }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                                            <Feather name="camera" size={40} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.placeholderText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                            Adicionar foto
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {uploadProgress !== null && uploadProgress > 0 && (
                            <View style={styles.progressContainer}>
                                <AnimatedProgressBar progress={uploadProgress} />
                                <Text style={[styles.progressText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    Enviando imagem... {uploadProgress}%
                                </Text>
                            </View>
                        )}

                        <Text style={[styles.helperText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280", textAlign: "center" }]}>
                            Formatos aceitos: JPG, PNG, GIF
                        </Text>
                    </View>
                )

            default:
                return null
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
                    {/* Logo e Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <Feather name={stepIcons[currentStep - 1] as any} size={32} color="#fff" />
                        </View>

                        <Text style={[styles.headerText, { color: isDarkTheme ? colors.secondary : colors.primary }]}>
                            {stepTitles[currentStep - 1]}
                        </Text>

                        <Text style={[styles.subHeaderText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            {stepDescriptions[currentStep - 1]}
                        </Text>
                    </View>

                    {renderProgressBar()}

                    <View style={styles.formContainer}>
                        {renderStepContent()}

                        {errors.general && (
                            <View style={styles.errorContainer}>
                                <Feather name="alert-circle" size={16} color="#EF4444" />
                                <Text style={styles.errorText}>{errors.general}</Text>
                            </View>
                        )}
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.navigationContainer}>
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                styles.backButton,
                                {
                                    backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                                    opacity: currentStep === 1 ? 0.5 : 1,
                                },
                            ]}
                            onPress={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            <Feather name="arrow-left" size={20} color={isDarkTheme ? "#E5E7EB" : "#1F2937"} />
                            <Text style={[styles.navButtonText, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>Anterior</Text>
                        </TouchableOpacity>

                        {currentStep < totalSteps ? (
                            <TouchableOpacity
                                style={[styles.navButton, styles.nextButton, { backgroundColor: colors.primary }]}
                                onPress={handleNext}
                            >
                                <Text style={styles.nextButtonText}>Próximo</Text>
                                <Feather name="arrow-right" size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.navButton,
                                    styles.submitButton,
                                    { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 },
                                ]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.submitButtonText}>Finalizar Cadastro</Text>
                                        <Feather name="check" size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
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

                {/* Image Picker Modal */}
                <Modal
                    visible={showImageModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowImageModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                                <View style={styles.modalHeader}>
                                    <Text style={[styles.modalTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                        Adicionar Foto de Perfil
                                    </Text>
                                    <Text style={[styles.modalSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                        Escolha como deseja adicionar sua foto
                                    </Text>
                                </View>

                                <View style={styles.modalButtons}>
                                    {Platform.OS === "web" ? (
                                        // Web options
                                        <>
                                            <TouchableOpacity
                                                style={[
                                                    styles.modalButton,
                                                    { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                                                ]}
                                                onPress={startWebcam}
                                            >
                                                <View style={[styles.modalButtonIcon, { backgroundColor: colors.primary }]}>
                                                    <Feather name="video" size={24} color="white" />
                                                </View>
                                                <View style={styles.modalButtonContent}>
                                                    <Text style={[styles.modalButtonTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                        Usar Webcam
                                                    </Text>
                                                    <Text style={[styles.modalButtonSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                                        Tirar foto com a webcam
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.modalButton,
                                                    { backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary },
                                                ]}
                                                onPress={uploadFileFromWeb}
                                            >
                                                <View style={[styles.modalButtonIcon, { backgroundColor: colors.secondary }]}>
                                                    <Feather name="upload" size={24} color="white" />
                                                </View>
                                                <View style={styles.modalButtonContent}>
                                                    <Text style={[styles.modalButtonTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                        Enviar Arquivo
                                                    </Text>
                                                    <Text style={[styles.modalButtonSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                                        Selecionar arquivo do computador
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        // Mobile options (Android/iOS)
                                        <>
                                            <TouchableOpacity
                                                style={[
                                                    styles.modalButton,
                                                    { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                                                ]}
                                                onPress={takePhotoWithCamera}
                                            >
                                                <View style={[styles.modalButtonIcon, { backgroundColor: colors.primary }]}>
                                                    <Feather name="camera" size={24} color="white" />
                                                </View>
                                                <View style={styles.modalButtonContent}>
                                                    <Text style={[styles.modalButtonTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                        Tirar Foto
                                                    </Text>
                                                    <Text style={[styles.modalButtonSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                                        Use a câmera do dispositivo
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.modalButton,
                                                    { backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary },
                                                ]}
                                                onPress={pickImageFromGallery}
                                            >
                                                <View style={[styles.modalButtonIcon, { backgroundColor: colors.secondary }]}>
                                                    <Feather name="image" size={24} color="white" />
                                                </View>
                                                <View style={styles.modalButtonContent}>
                                                    <Text style={[styles.modalButtonTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                        Escolher da Galeria
                                                    </Text>
                                                    <Text style={[styles.modalButtonSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                                        Selecione fotos existentes
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>

                                <View style={styles.modalCancelContainer}>
                                    <TouchableOpacity
                                        style={[styles.modalCancelButton, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }]}
                                        onPress={() => setShowImageModal(false)}
                                    >
                                        <Text style={[styles.modalCancelText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Webcam Modal */}
                {Platform.OS === "web" && (
                    <Modal visible={isWebcamActive} transparent={true} animationType="slide" onRequestClose={stopWebcam}>
                        <View style={styles.webcamOverlay}>
                            <View style={[styles.webcamContainer, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                                <View style={styles.webcamHeader}>
                                    <Text style={[styles.webcamTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Tirar Foto</Text>
                                    <TouchableOpacity onPress={stopWebcam} style={styles.webcamCloseButton}>
                                        <Feather name="x" size={24} color={isDarkTheme ? "white" : "#374151"} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.webcamVideoContainer}>
                                    <video
                                        id="webcam-video"
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: 12,
                                        }}
                                        ref={(video) => {
                                            if (video && webcamStream) {
                                                video.srcObject = webcamStream
                                            }
                                        }}
                                    />
                                </View>

                                <View style={styles.webcamControls}>
                                    <TouchableOpacity
                                        style={[styles.webcamCaptureButton, { backgroundColor: colors.primary }]}
                                        onPress={captureWebcamPhoto}
                                    >
                                        <Feather name="camera" size={24} color="white" />
                                        <Text style={styles.webcamCaptureText}>Capturar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}
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
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subHeaderText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 22,
    },
    progressContainer: {
        width: "100%",
        marginBottom: 30,
    },
    progressBar: {
        width: "100%",
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        textAlign: "center",
    },
    formContainer: {
        width: "100%",
        marginBottom: 30,
    },
    stepContainer: {
        width: "100%",
    },
    input: {
        width: "100%",
        height: 50,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    errorText: {
        textAlign: "center",
        color: "#EF4444",
        fontSize: 14,
        marginBottom: 10,
        marginLeft: 4,
    },
    helperText: {
        fontSize: 14,
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 18,
    },
    charCount: {
        fontSize: 12,
        textAlign: "right",
        marginTop: -10,
        marginBottom: 15,
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        padding: 12,
        borderRadius: 8,
    },
    navigationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    navButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: "center",
    },
    backButton: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    nextButton: {},
    submitButton: {},
    navButtonText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    loginLink: {
        marginTop: 20,
    },
    imageUploadSection: {
        alignItems: "center",
        marginBottom: 20,
    },
    imageContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {
        fontSize: 12,
        textAlign: "center",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 34 : 24,
        paddingHorizontal: 24,
        minHeight: 280,
    },
    modalHeader: {
        alignItems: "center",
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: "center",
    },
    modalButtons: {
        gap: 12,
        marginBottom: 20,
    },
    modalButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
    },
    modalButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    modalButtonContent: {
        flex: 1,
    },
    modalButtonTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    modalButtonSubtitle: {
        fontSize: 13,
    },
    modalCancelContainer: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 16,
    },
    modalCancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: "500",
    },
    // Webcam modal styles
    webcamOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    webcamContainer: {
        width: "100%",
        maxWidth: 600,
        height: "80%",
        borderRadius: 20,
        overflow: "hidden",
    },
    webcamHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    webcamTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    webcamCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    webcamVideoContainer: {
        flex: 1,
        margin: 20,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#000",
    },
    webcamControls: {
        padding: 20,
        alignItems: "center",
    },
    webcamCaptureButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        gap: 8,
    },
    webcamCaptureText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
})
