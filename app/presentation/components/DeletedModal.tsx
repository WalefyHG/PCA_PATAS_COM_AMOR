"use client"

import type React from "react"

import { useState } from "react"
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, StyleSheet, Platform, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { auth } from "../../data/datasources/firebase/firebase"
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { useThemeContext } from "../contexts/ThemeContext"
import DeviceRegistrationService from "../../utils/DeviceRegistrationService"
import { deleteUserProfile } from "../../repositories/FirebaseUserRepository"

interface DeleteAccountModalProps {
    visible: boolean
    onClose: () => void
    onAccountDeleted: () => void
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onClose, onAccountDeleted }) => {
    const { isDarkTheme, colors } = useThemeContext()
    const [step, setStep] = useState<"warning" | "confirm" | "password">("warning")
    const [password, setPassword] = useState("")
    const [confirmText, setConfirmText] = useState("")
    const [loading, setLoading] = useState(false)
    const [fadeAnim] = useState(new Animated.Value(0))

    const resetModal = () => {
        setStep("warning")
        setPassword("")
        setConfirmText("")
        setLoading(false)
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    const handleNextStep = () => {
        if (step === "warning") {
            setStep("confirm")
        } else if (step === "confirm") {
            if (confirmText.toLowerCase() === "deletar") {
                setStep("password")
            } else {
                Alert.alert("Erro", "Digite 'DELETAR' para confirmar")
            }
        }
    }

    const handleDeleteAccount = async () => {
        if (!auth.currentUser || !password.trim()) {
            Alert.alert("Erro", "Digite sua senha para continuar")
            return
        }

        setLoading(true)

        try {
            console.log("🗑️ Iniciando processo de exclusão da conta...")

            // 1. Reautenticar usuário
            const credential = EmailAuthProvider.credential(auth.currentUser.email!, password)
            await reauthenticateWithCredential(auth.currentUser, credential)
            console.log("✅ Usuário reautenticado")

            // 2. Desregistrar dispositivo
            try {
                const deviceService = DeviceRegistrationService.getInstance()
                await deviceService.unregisterDevice()
                console.log("✅ Dispositivo desregistrado")
            } catch (error) {
                console.error("❌ Erro ao desregistrar dispositivo:", error)
                // Continuar mesmo com erro no dispositivo
            }

            // 3. Deletar dados do usuário no Firestore (se você tiver uma função para isso)
            try {
                if (deleteUserProfile) {
                    await deleteUserProfile(auth.currentUser.uid)
                    console.log("✅ Dados do usuário deletados do Firestore")
                }
            } catch (error) {
                console.error("❌ Erro ao deletar dados do Firestore:", error)
                // Continuar mesmo com erro nos dados
            }

            // 4. Deletar conta do Firebase Auth
            await deleteUser(auth.currentUser)
            console.log("✅ Conta deletada do Firebase Auth")

            Alert.alert("Conta Deletada", "Sua conta foi deletada permanentemente. Sentiremos sua falta! 😢", [
                {
                    text: "OK",
                    onPress: () => {
                        handleClose()
                        onAccountDeleted()
                    },
                },
            ])
        } catch (error: any) {
            console.error("❌ Erro ao deletar conta:", error)

            let errorMessage = "Erro desconhecido. Tente novamente."

            if (error.code === "auth/wrong-password") {
                errorMessage = "Senha incorreta. Tente novamente."
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Muitas tentativas. Tente novamente mais tarde."
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Erro de conexão. Verifique sua internet."
            }

            Alert.alert("Erro ao Deletar Conta", errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const renderWarningStep = () => (
        <View style={styles.stepContainer}>
            <View style={styles.warningIcon}>
                <Feather name="alert-triangle" size={48} color="#EF4444" />
            </View>

            <Text style={[styles.title, { color: isDarkTheme ? "#F3F4F6" : "#111827" }]}>Deletar Conta</Text>

            <Text style={[styles.warningText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                ⚠️ Esta ação é <Text style={styles.boldText}>PERMANENTE</Text> e não pode ser desfeita.
            </Text>

            <View style={styles.consequencesList}>
                <Text style={[styles.consequenceTitle, { color: isDarkTheme ? "#F87171" : "#DC2626" }]}>
                    O que será perdido:
                </Text>

                {[
                    "Todos os seus dados pessoais",
                    "Histórico de conversas no chat",
                    "Pets favoritos salvos",
                    "Configurações e preferências",
                    "Acesso ao aplicativo",
                ].map((item, index) => (
                    <View key={index} style={styles.consequenceItem}>
                        <Feather name="x" size={16} color="#EF4444" />
                        <Text style={[styles.consequenceText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB" }]}
                    onPress={handleClose}
                >
                    <Text style={[styles.cancelButtonText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dangerButton} onPress={handleNextStep}>
                    <Text style={styles.dangerButtonText}>Continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    const renderConfirmStep = () => (
        <View style={styles.stepContainer}>
            <View style={styles.warningIcon}>
                <Feather name="type" size={48} color="#F59E0B" />
            </View>

            <Text style={[styles.title, { color: isDarkTheme ? "#F3F4F6" : "#111827" }]}>Confirmação</Text>

            <Text style={[styles.confirmText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                Para confirmar que você realmente deseja deletar sua conta, digite <Text style={styles.boldText}>DELETAR</Text>{" "}
                no campo abaixo:
            </Text>

            <TextInput
                style={[
                    styles.confirmInput,
                    {
                        backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                        borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB",
                        color: isDarkTheme ? "#F3F4F6" : "#111827",
                    },
                ]}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Digite DELETAR"
                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                autoCapitalize="characters"
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB" }]}
                    onPress={() => setStep("warning")}
                >
                    <Text style={[styles.cancelButtonText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.dangerButton, { opacity: confirmText.toLowerCase() === "deletar" ? 1 : 0.5 }]}
                    onPress={handleNextStep}
                    disabled={confirmText.toLowerCase() !== "deletar"}
                >
                    <Text style={styles.dangerButtonText}>Confirmar</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

    const renderPasswordStep = () => (
        <View style={styles.stepContainer}>
            <View style={styles.warningIcon}>
                <Feather name="lock" size={48} color="#DC2626" />
            </View>

            <Text style={[styles.title, { color: isDarkTheme ? "#F3F4F6" : "#111827" }]}>Senha Necessária</Text>

            <Text style={[styles.passwordText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                Por segurança, digite sua senha atual para confirmar a exclusão da conta:
            </Text>

            <TextInput
                style={[
                    styles.passwordInput,
                    {
                        backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                        borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB",
                        color: isDarkTheme ? "#F3F4F6" : "#111827",
                    },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                secureTextEntry
                autoCapitalize="none"
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: isDarkTheme ? "#4B5563" : "#D1D5DB" }]}
                    onPress={() => setStep("confirm")}
                >
                    <Text style={[styles.cancelButtonText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleDeleteAccount}
                    disabled={loading || !password.trim()}
                >
                    {loading ? (
                        <Text style={styles.deleteButtonText}>Deletando...</Text>
                    ) : (
                        <>
                            <Feather name="trash-2" size={16} color="white" />
                            <Text style={styles.deleteButtonText}>Deletar Conta</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                    {step === "warning" && renderWarningStep()}
                    {step === "confirm" && renderConfirmStep()}
                    {step === "password" && renderPasswordStep()}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    stepContainer: {
        alignItems: "center",
    },
    warningIcon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    warningText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    boldText: {
        fontWeight: "bold",
        color: "#DC2626",
    },
    consequencesList: {
        width: "100%",
        marginBottom: 32,
    },
    consequenceTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    consequenceItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    consequenceText: {
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    confirmText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    passwordText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    confirmInput: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 32,
        textAlign: "center",
        fontWeight: "600",
    },
    passwordInput: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 32,
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "500",
    },
    dangerButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#4F46E5",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    dangerButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    deleteButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#DC2626",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    deleteButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
})
