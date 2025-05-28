"use client"

import { SetStateAction, useState } from "react"
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { createUserWithEmailAndPassword, updateProfile, UserProfile } from "firebase/auth"
import { auth, db, uploadImage, uploadToCloudinary } from "../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button, Input } from "@ui-kitten/components"
import { useThemeContext } from "../utils/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import InputPassword from "../components/InputPassword"
import ImageUpload from "../components/ImageUpload"
import { u } from "framer-motion/dist/types.d-CtuPurYT"
import AnimatedProgressBar from "../components/AnimatedProgress"

interface FormData extends UserProfile {
    password: string;
    confirmPassword: string;
}

export default function RegisterScreen() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        first_name: '',
        last_name: '',
        phone: '',
        bio: '',
        photoURL: '',
        photoProfile: null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const router = useNavigation<any>();
    const { isDarkTheme, colors } = useThemeContext();

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    const stepTitles = [
        'Credenciais de Acesso',
        'Informações Pessoais',
        'Contato e Bio',
        'Foto de Perfil'
    ];

    const stepDescriptions = [
        'Configure seu email e senha',
        'Nos conte seu nome completo',
        'Adicione telefone e uma breve descrição',
        'Adicione uma foto para personalizar seu perfil'
    ];

    const stepIcons = ['mail', 'user', 'phone', 'camera'];

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.email) newErrors.email = 'Email é obrigatório';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(formData.email))) {
                    newErrors.email = 'Email inválido';
                }
                if (!formData.password) newErrors.password = 'Senha é obrigatória';
                else if (formData.password.length < 6) {
                    newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
                }
                if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
                else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Senhas não coincidem';
                }
                break;
            case 2:
                if (!formData.first_name) newErrors.first_name = 'Nome é obrigatório';
                if (!formData.last_name) newErrors.last_name = 'Sobrenome é obrigatório';
                if (!formData.displayName) newErrors.displayName = 'Nome de exibição é obrigatório';
                break;
            case 3:
                if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(String(formData.phone))) {
                    newErrors.phone = 'Formato: (11) 99999-9999';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleInputChange = (field: keyof FormData, value: string | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePhoneChange = (value: string) => {
        let formatted = value.replace(/\D/g, '');
        if (formatted.length <= 11) {
            formatted = formatted.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
            if (formatted.length < 14) {
                formatted = formatted.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            }
        }
        handleInputChange('phone', formatted);
    };


    const handleAuthError = (error: any) => {
        setIsLoading(false);
        console.error("Erro de registro:", error);

        let errorMessage = "Ocorreu um erro durante o registro. Tente novamente.";

        if (error.code) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    errorMessage = "Este email já está em uso.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Email inválido.";
                    break;
                case "auth/weak-password":
                    errorMessage = "A senha é muito fraca.";
                    break;
                case "auth/network-request-failed":
                    errorMessage = "Erro de conexão. Verifique sua internet.";
                    break;
                case "auth/invalid-profile-attribute":
                    errorMessage = "Atributo de perfil inválido. Verifique os dados inseridos.";
                    break;
                default:
                    errorMessage = "Erro desconhecido. Tente novamente mais tarde.";
                    break;
            }
        }

        setErrors(prev => ({ ...prev, general: errorMessage }));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, String(formData.email), String(formData.password));
            const user = userCredential.user;

            let uploadedPhotoURL = "";

            if (formData.photoProfile) {
                uploadedPhotoURL = await uploadToCloudinary(
                    formData.photoProfile as File,
                    (progress) => {
                        setUploadProgress(progress);
                    }
                );
            }

            await updateProfile(user, {
                displayName: typeof formData.displayName === "string" ? formData.displayName : undefined,
                photoURL: uploadedPhotoURL || undefined
            });

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
            });

            setIsLoading(false);
            router.navigate("Tabs");
        } catch (e: any) {
            handleAuthError(e);
        }
    };

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={[
                styles.progressBar,
                { backgroundColor: isDarkTheme ? "#374151" : "#E5E7EB" }
            ]}>
                <View style={[
                    styles.progressFill,
                    {
                        width: `${progress}%`,
                        backgroundColor: colors.primary
                    }
                ]} />
            </View>
            <Text style={[
                styles.progressText,
                { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }
            ]}>
                Passo {currentStep} de {totalSteps}
            </Text>
        </View>
    );

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
                                errors.email && styles.inputError
                            ]}
                            placeholder="seu@email.com"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Email *"
                            value={String(formData.email ?? '')}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <InputPassword
                            style={[
                                styles.input,
                                errors.password && styles.inputError
                            ]}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password}
                            label="Senha *"
                            onChangeText={(text: string) => handleInputChange('password', text)}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        <InputPassword
                            style={[
                                styles.input,
                                errors.confirmPassword && styles.inputError
                            ]}
                            placeholder="Digite a senha novamente"
                            value={formData.confirmPassword}
                            label="Confirmar Senha *"
                            onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
                        />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>
                );

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
                                errors.first_name && styles.inputError
                            ]}
                            placeholder="João"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Nome *"
                            value={String(formData.first_name ?? '')}
                            onChangeText={(text) => handleInputChange('first_name', text)}
                        />
                        {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.last_name && styles.inputError
                            ]}
                            placeholder="Silva"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Sobrenome *"
                            value={String(formData.last_name ?? '')}
                            onChangeText={(text) => handleInputChange('last_name', text)}
                        />
                        {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

                        <Input
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                                    borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                },
                                errors.displayName && styles.inputError
                            ]}
                            placeholder="Como você gostaria de ser chamado?"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Nome de Exibição *"
                            value={String(formData.displayName ?? "")}
                            onChangeText={(text) => handleInputChange('displayName', text)}
                        />
                        {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
                        <Text style={[styles.helperText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            Este será o nome que outros usuários verão
                        </Text>
                    </View>
                );

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
                                errors.phone && styles.inputError
                            ]}
                            placeholder="(11) 99999-9999"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Telefone (opcional)"
                            value={String(formData.phone ?? '')}
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
                                }
                            ]}
                            placeholder="Conte um pouco sobre você..."
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            label="Biografia (opcional)"
                            value={String(formData.bio ?? "")}
                            onChangeText={(text) => handleInputChange('bio', text)}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                        />
                        <Text style={[styles.charCount, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            {(typeof formData.bio === "string" ? formData.bio.length : 0)}/500 caracteres
                        </Text>
                    </View>
                );

            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <ImageUpload
                            onImageSelected={(uri) => handleInputChange('photoURL', uri)}
                            onFileSelected={(file) => handleInputChange('photoProfile', file)}
                            currentImage={formData.photoURL as string | undefined}
                        />
                        {uploadProgress !== null && (
                            <AnimatedProgressBar
                                progress={uploadProgress}
                            />
                        )}

                        <Text style={[styles.helperText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280", textAlign: 'center' }]}>
                            Formatos aceitos: JPG, PNG, GIF
                        </Text>
                    </View>
                );

            default:
                return null;
        }
    };

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
                        <View style={[
                            styles.iconContainer,
                            { backgroundColor: colors.primary }
                        ]}>
                            <Feather
                                name={stepIcons[currentStep - 1] as any}
                                size={32}
                                color="#fff"
                            />
                        </View>

                        <Text style={[
                            styles.headerText,
                            { color: isDarkTheme ? colors.secondary : colors.primary }
                        ]}>
                            {stepTitles[currentStep - 1]}
                        </Text>

                        <Text style={[
                            styles.subHeaderText,
                            { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }
                        ]}>
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
                                    opacity: currentStep === 1 ? 0.5 : 1
                                }
                            ]}
                            onPress={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            <Feather name="arrow-left" size={20} color={isDarkTheme ? "#E5E7EB" : "#1F2937"} />
                            <Text style={[
                                styles.navButtonText,
                                { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }
                            ]}>
                                Anterior
                            </Text>
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
                                    { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }
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
            </View>
        </ScrollView>
    );
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
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: 'center',
        marginBottom: 8,
    },
    subHeaderText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    progressContainer: {
        width: '100%',
        marginBottom: 30,
    },
    progressBar: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
    },
    formContainer: {
        width: "100%",
        marginBottom: 30,
    },
    stepContainer: {
        width: '100%',
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
        textAlignVertical: 'top',
    },
    errorText: {
        textAlign: 'center',
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
        textAlign: 'right',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 120,
        justifyContent: 'center',
    },
    backButton: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    nextButton: {

    },
    submitButton: {

    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    loginLink: {
        marginTop: 20,
    },
});