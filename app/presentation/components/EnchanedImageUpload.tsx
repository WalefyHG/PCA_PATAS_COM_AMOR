"use client"

import { useState, useRef } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    Animated,
    Platform,
    Dimensions,
    Alert,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"

const { width } = Dimensions.get("window")
const isSmallScreen = width < 380

interface EnhancedImageUploadProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
    title?: string
}

export default function EnhancedImageUpload({
    images,
    onImagesChange,
    maxImages = 5,
    title = "Fotos do Pet",
}: EnhancedImageUploadProps) {
    const { isDarkTheme, colors } = useThemeContext()
    const [showModal, setShowModal] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const scaleAnim = useRef(new Animated.Value(1)).current
    const fadeAnim = useRef(new Animated.Value(0)).current

    const animateImageAdd = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start()
    }

    const showImageOptions = () => {
        setShowModal(true)
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    const hideModal = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowModal(false))
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua câmera.")
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        })

        if (!result.canceled) {
            const newImages = [...images, result.assets[0].uri].slice(0, maxImages)
            onImagesChange(newImages)
            animateImageAdd()
        }
        hideModal()
    }

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua galeria.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            allowsMultipleSelection: true,
        })

        if (!result.canceled) {
            const newImageUris = result.assets.map((asset) => asset.uri)
            const updatedImages = [...images, ...newImageUris].slice(0, maxImages)
            onImagesChange(updatedImages)
            animateImageAdd()
        }
        hideModal()
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
    }

    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images]
        const [movedImage] = newImages.splice(fromIndex, 1)
        newImages.splice(toIndex, 0, movedImage)
        onImagesChange(newImages)
    }

    const renderImageItem = (uri: string, index: number) => (
        <Animated.View
            key={`${uri}-${index}`}
            style={[
                styles.imageContainer,
                {
                    transform: [{ scale: draggedIndex === index ? 1.05 : 1 }],
                    opacity: draggedIndex === index ? 0.8 : 1,
                },
            ]}
        >
            <Image source={{ uri }} style={styles.image} />

            {/* Main photo badge */}
            {index === 0 && (
                <View style={[styles.mainPhotoBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="star" size={12} color="white" />
                    <Text style={styles.mainPhotoText}>Principal</Text>
                </View>
            )}

            {/* Remove button */}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="x" size={16} color="white" />
            </TouchableOpacity>

            {/* Drag handle */}
            <TouchableOpacity
                style={styles.dragHandle}
                onPressIn={() => setDraggedIndex(index)}
                onPressOut={() => setDraggedIndex(null)}
            >
                <Feather name="move" size={14} color="white" />
            </TouchableOpacity>

            {/* Image overlay with info */}
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.3)"]} style={styles.imageOverlay}>
                <Text style={styles.imageIndex}>{index + 1}</Text>
            </LinearGradient>
        </Animated.View>
    )

    const renderAddButton = () => (
        <TouchableOpacity
            style={[
                styles.addButton,
                {
                    backgroundColor: isDarkTheme ? "#374151" : "white",
                    borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                },
            ]}
            onPress={showImageOptions}
        >
            <LinearGradient colors={[`${colors.primary}20`, `${colors.secondary}20`]} style={styles.addButtonGradient}>
                <Feather name="plus" size={24} color={colors.primary} />
                <Text style={[styles.addButtonText, { color: colors.primary }]}>Adicionar</Text>
                <Text style={[styles.addButtonSubtext, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                    {images.length}/{maxImages}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: isDarkTheme ? "white" : "#374151" }]}>{title} *</Text>
                <View style={styles.counter}>
                    <Text style={[styles.counterText, { color: colors.primary }]}>
                        {images.length}/{maxImages}
                    </Text>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {images.map((uri, index) => renderImageItem(uri, index))}
                {images.length < maxImages && renderAddButton()}
            </ScrollView>

            <Text style={[styles.hint, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                A primeira foto será a principal. Arraste para reordenar.
            </Text>

            {/* Enhanced Modal */}
            <Modal visible={showModal} transparent animationType="none" onRequestClose={hideModal}>
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: isDarkTheme ? "#1F2937" : "white",
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [300, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Adicionar Foto</Text>
                            <Text style={[styles.modalSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                Escolha como deseja adicionar a foto do pet
                            </Text>
                        </View>

                        <View style={styles.modalOptions}>
                            <TouchableOpacity
                                style={[styles.modalOption, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}
                                onPress={takePhoto}
                            >
                                <View style={[styles.modalOptionIcon, { backgroundColor: colors.primary }]}>
                                    <Feather name="camera" size={24} color="white" />
                                </View>
                                <View style={styles.modalOptionContent}>
                                    <Text style={[styles.modalOptionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                        Tirar Foto
                                    </Text>
                                    <Text style={[styles.modalOptionSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                        Use a câmera do dispositivo
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={colors.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    { backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary },
                                ]}
                                onPress={pickFromGallery}
                            >
                                <View style={[styles.modalOptionIcon, { backgroundColor: colors.secondary }]}>
                                    <Feather name="image" size={24} color="white" />
                                </View>
                                <View style={styles.modalOptionContent}>
                                    <Text style={[styles.modalOptionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                        Escolher da Galeria
                                    </Text>
                                    <Text style={[styles.modalOptionSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                        Selecione fotos existentes
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={colors.secondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalCancel, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }]}
                            onPress={hideModal}
                        >
                            <Text style={[styles.modalCancelText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    counter: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    counterText: {
        fontSize: 12,
        fontWeight: "600",
    },
    scrollView: {
        marginBottom: 8,
    },
    scrollContent: {
        paddingRight: 16,
    },
    imageContainer: {
        position: "relative",
        marginRight: 12,
        borderRadius: 12,
        overflow: "hidden",
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    mainPhotoBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    mainPhotoText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    removeButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        alignItems: "center",
        justifyContent: "center",
    },
    dragHandle: {
        position: "absolute",
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        alignItems: "center",
        justifyContent: "center",
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        justifyContent: "flex-end",
        alignItems: "flex-start",
        paddingLeft: 8,
        paddingBottom: 6,
    },
    imageIndex: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    addButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: "dashed",
        overflow: "hidden",
    },
    addButtonGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    addButtonSubtext: {
        fontSize: 11,
    },
    hint: {
        fontSize: 12,
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 34 : 24,
        paddingHorizontal: 24,
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
    modalOptions: {
        gap: 12,
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
    },
    modalOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    modalOptionContent: {
        flex: 1,
    },
    modalOptionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    modalOptionSubtitle: {
        fontSize: 13,
    },
    modalCancel: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 20,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: "500",
    },
})
