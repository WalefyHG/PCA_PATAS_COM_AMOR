"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Image, Modal, Platform, StyleSheet, Dimensions } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useThemeContext } from "../utils/ThemeContext"

const { width } = Dimensions.get("window")
const isSmallScreen = width < 380

interface EnhancedImageUploadProps {
    onImageSelected?: (uri: string) => void
    onFileSelected?: (file: File) => void
    currentImage?: string
    size?: number
}

export default function EnhancedImageUpload({
    onImageSelected,
    onFileSelected,
    currentImage,
    size = isSmallScreen ? 120 : 140,
}: EnhancedImageUploadProps) {
    const { isDarkTheme, colors } = useThemeContext()
    const [showImageModal, setShowImageModal] = useState(false)
    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

    // Mobile camera function (Android/iOS)
    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()

        if (status !== "granted") {
            alert("Precisamos de permissão para acessar sua câmera.")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            aspect: [1, 1],
        })

        if (!result.canceled) {
            onImageSelected?.(result.assets[0].uri)
        }
        setShowImageModal(false)
    }

    // Mobile gallery function (Android/iOS)
    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            alert("Precisamos de permissão para acessar sua galeria de fotos.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            aspect: [1, 1],
        })

        if (!result.canceled) {
            onImageSelected?.(result.assets[0].uri)
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
            alert("Não foi possível acessar a webcam.")
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
                onFileSelected?.(file)
                const reader = new FileReader()
                reader.onload = (e) => {
                    if (e.target?.result) {
                        onImageSelected?.(e.target.result as string)
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
            onImageSelected?.(imageData)
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

    const renderImagePickerModal = () => (
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
                                <Text style={[styles.modalCancelText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )

    // Webcam modal for web
    const renderWebcamModal = () =>
        Platform.OS === "web" && (
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
                            {Platform.OS === "web" && (
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
                            )}
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
        )

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.imageContainer,
                    {
                        width: size,
                        height: size,
                        backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                        borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                    },
                ]}
                onPress={() => setShowImageModal(true)}
            >
                {currentImage ? (
                    <Image source={{ uri: currentImage }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                            <Feather name="camera" size={size * 0.25} color={colors.primary} />
                        </View>
                        <Text style={[styles.placeholderText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>Adicionar foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {renderImagePickerModal()}
            {renderWebcamModal()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    imageContainer: {
        borderRadius: 70,
        borderWidth: 3,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
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
