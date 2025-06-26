"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator,
    Switch,
    Dimensions,
    Modal,
    Linking,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../utils/ThemeContext"
import { createPet, getPetById, type Pet, updatePet } from "@/app/config/firebase"

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isMediumScreen = width >= 380 && width < 768
const isLargeScreen = width >= 768
const isWebPlatform = Platform.OS === "web"

export default function AddPetEnhanced() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { petId } = route.params || {}
    const isEditing = !!petId

    // Pet state with all required fields
    const [pet, setPet] = useState<Pet>({
        name: "",
        age: "",
        type: "",
        breed: "",
        gender: "",
        size: "",
        color: "",
        description: "",
        history: "",
        location: "",
        images: [],
        requirements: [],
        vaccinated: false,
        neutered: false,
        specialNeeds: false,
        specialNeedsDescription: "",
        contactPhone: "",
        contactEmail: "",
        status: "available",
        createdBy: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentRequirement, setCurrentRequirement] = useState("")
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number
        longitude: number
        address?: string
    } | null>(null)
    const [showImageModal, setShowImageModal] = useState(false)
    const [isWebcamActive, setIsWebcamActive] = useState(false)
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const petTypes = ["dog", "cat", "bird", "rabbit", "other"]
    const genders = ["male", "female", "unknown"]
    const sizes = ["small", "medium", "large", "extra-large"]
    const statuses = ["available", "pending", "adopted"]

    useEffect(() => {
        const loadPetData = async () => {
            if (isEditing && petId) {
                try {
                    const dataPet = await getPetById(petId)
                    if (dataPet) {
                        setPet(dataPet)
                    } else {
                        Alert.alert("Erro", "Não foi possível carregar os dados do pet.")
                    }
                } catch (error) {
                    console.error("Erro ao buscar pet:", error)
                    Alert.alert("Erro", "Erro ao carregar os dados do pet.")
                }
            }
        }

        loadPetData()
    }, [isEditing, petId])

    useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const handleInputChange = (field: keyof Pet, value: string | boolean | string[]) => {
        setPet((prevPet) => ({
            ...prevPet,
            [field]: value,
        }))
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
        })

        if (!result.canceled) {
            const newImage = result.assets[0].uri
            setPet((prevPet) => ({
                ...prevPet,
                images: [...prevPet.images, newImage].slice(0, 5),
            }))
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
            allowsMultipleSelection: true,
        })

        if (!result.canceled) {
            const newImages = result.assets.map((asset) => asset.uri)
            setPet((prevPet) => ({
                ...prevPet,
                images: [...prevPet.images, ...newImages].slice(0, 5),
            }))
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
        input.multiple = true

        input.onchange = (event: any) => {
            const files = event.target.files
            if (files && files.length > 0) {
                const newImages: string[] = []

                Array.from(files).forEach((file: any) => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            newImages.push(e.target.result as string)

                            // Update state when all files are processed
                            if (newImages.length === files.length) {
                                setPet((prevPet) => ({
                                    ...prevPet,
                                    images: [...prevPet.images, ...newImages].slice(0, 5),
                                }))
                            }
                        }
                    }
                    reader.readAsDataURL(file)
                })
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

            setPet((prevPet) => ({
                ...prevPet,
                images: [...prevPet.images, imageData].slice(0, 5),
            }))

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

    // Enhanced geolocation functionality with more specific location
    const getCurrentLocation = async () => {
        setIsLoadingLocation(true)

        try {
            const { status } = await Location.requestForegroundPermissionsAsync()

            if (status !== "granted") {
                Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua localização.")
                setIsLoadingLocation(false)
                return
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            })

            const { latitude, longitude } = location.coords

            // Enhanced reverse geocoding with multiple attempts
            let formattedAddress = ""

            try {
                // First attempt: High precision reverse geocoding
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                })

                if (reverseGeocode.length > 0) {
                    const address = reverseGeocode[0]

                    // Build comprehensive address
                    const addressParts = []

                    if (address.street) addressParts.push(address.street)
                    if (address.streetNumber) addressParts.push(address.streetNumber)
                    if (address.district) addressParts.push(address.district)
                    if (address.city) addressParts.push(address.city)
                    if (address.region) addressParts.push(address.region)
                    if (address.country) addressParts.push(address.country)
                    if (address.postalCode) addressParts.push(`CEP: ${address.postalCode}`)

                    formattedAddress = addressParts.join(", ")
                }

                // If no detailed address found, try with lower precision
                if (!formattedAddress || formattedAddress.length < 10) {
                    // Second attempt: Try nearby locations with slight coordinate variations
                    const variations = [
                        { lat: latitude + 0.001, lng: longitude },
                        { lat: latitude - 0.001, lng: longitude },
                        { lat: latitude, lng: longitude + 0.001 },
                        { lat: latitude, lng: longitude - 0.001 },
                    ]

                    for (const variation of variations) {
                        try {
                            const nearbyGeocode = await Location.reverseGeocodeAsync({
                                latitude: variation.lat,
                                longitude: variation.lng,
                            })

                            if (nearbyGeocode.length > 0) {
                                const nearbyAddress = nearbyGeocode[0]
                                const nearbyParts = []

                                if (nearbyAddress.street) nearbyParts.push(nearbyAddress.street)
                                if (nearbyAddress.district) nearbyParts.push(nearbyAddress.district)
                                if (nearbyAddress.city) nearbyParts.push(nearbyAddress.city)
                                if (nearbyAddress.region) nearbyParts.push(nearbyAddress.region)

                                if (nearbyParts.length > 0) {
                                    formattedAddress = nearbyParts.join(", ") + " (aproximado)"
                                    break
                                }
                            }
                        } catch (error) {
                            console.log("Tentativa de geocoding próximo falhou:", error)
                        }
                    }
                }

                // Final fallback: Use coordinates with city/region if available
                if (!formattedAddress || formattedAddress.length < 5) {
                    if (reverseGeocode.length > 0) {
                        const address = reverseGeocode[0]
                        const fallbackParts = []

                        if (address.city) fallbackParts.push(address.city)
                        if (address.region) fallbackParts.push(address.region)
                        if (address.country) fallbackParts.push(address.country)

                        if (fallbackParts.length > 0) {
                            formattedAddress = `${fallbackParts.join(", ")} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
                        } else {
                            formattedAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        }
                    } else {
                        formattedAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    }
                }
            } catch (geocodeError) {
                console.error("Erro no reverse geocoding:", geocodeError)
                formattedAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }

            setCurrentLocation({
                latitude,
                longitude,
                address: formattedAddress,
            })

            // Update pet location with formatted address
            handleInputChange("location", formattedAddress)
        } catch (error) {
            console.error("Erro ao obter localização:", error)
            Alert.alert("Erro", "Não foi possível obter sua localização atual.")
        } finally {
            setIsLoadingLocation(false)
        }
    }

    const openMapsForLocation = async () => {
        if (currentLocation) {
            const { latitude, longitude } = currentLocation
            const url = Platform.select({
                ios: `maps:${latitude},${longitude}`,
                android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
                default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            })

            try {
                const supported = await Linking.canOpenURL(url!)
                if (supported) {
                    await Linking.openURL(url!)
                } else {
                    // Fallback to web version
                    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
                    await Linking.openURL(webUrl)
                }
            } catch (error) {
                console.error("Erro ao abrir mapa:", error)
                Alert.alert("Erro", "Não foi possível abrir o mapa.")
            }
        }
    }

    const removeImage = (index: number) => {
        const newImages = [...pet.images]
        newImages.splice(index, 1)
        setPet((prevPet) => ({
            ...prevPet,
            images: newImages,
        }))
    }

    const handleAddRequirement = () => {
        if (currentRequirement.trim()) {
            const updatedRequirements = [...pet.requirements, currentRequirement.trim()]
            setPet((prevPet) => ({
                ...prevPet,
                requirements: updatedRequirements,
            }))
            setCurrentRequirement("")
        }
    }

    const handleRemoveRequirement = (index: number) => {
        const updatedRequirements = pet.requirements.filter((_, i) => i !== index)
        setPet((prevPet) => ({
            ...prevPet,
            requirements: updatedRequirements,
        }))
    }

    const handleSubmit = async () => {
        // Validação
        if (!pet.name || !pet.type || !pet.breed || !pet.description || !pet.location) {
            Alert.alert("Erro de Validação", "Por favor, preencha todos os campos obrigatórios")
            return
        }

        if (pet.images.length === 0) {
            Alert.alert("Imagem Obrigatória", "Por favor, adicione pelo menos uma imagem do pet")
            return
        }

        try {
            setIsSubmitting(true)

            if (isEditing && petId) {
                await updatePet(petId, pet)
                Alert.alert("Sucesso", "Pet atualizado com sucesso!")
            } else {
                await createPet(pet)
                Alert.alert("Sucesso", "Pet salvo com sucesso!")
            }

            navigation.navigate("Adopt")
        } catch (error) {
            console.error("Erro ao salvar pet:", error)
            Alert.alert("Erro", "Houve um erro ao salvar o pet. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }


    const renderSelectButton = (
        options: string[],
        currentValue: string,
        onSelect: (value: string) => void,
        label: string,
    ) => (
        <View style={styles.selectSection}>
            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectScrollView}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onSelect(option)}
                        style={[
                            styles.selectButton,
                            {
                                backgroundColor: currentValue === option ? colors.primary : isDarkTheme ? "#374151" : "white",
                                marginRight: isSmallScreen ? 8 : 12,
                                borderColor: currentValue === option ? colors.primary : "#E5E7EB",
                            },
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {},
                        ]}
                    >
                        <Text
                            style={[
                                styles.selectButtonText,
                                {
                                    color: currentValue === option ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                                },
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )

    const renderStatusBadges = () => (
        <View style={styles.statusSection}>
            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>Status de Adoção</Text>
            <View style={styles.statusContainer}>
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => handleInputChange("status", status)}
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: pet.status === status ? colors.primary : isDarkTheme ? "#374151" : "white",
                                flex: 1,
                                marginHorizontal: isSmallScreen ? 2 : 4,
                                borderColor: pet.status === status ? colors.primary : "#E5E7EB",
                            },
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {},
                        ]}
                    >
                        <Feather
                            name={status === "available" ? "check" : status === "pending" ? "clock" : "heart"}
                            size={isSmallScreen ? 14 : 16}
                            color={pet.status === status ? "white" : colors.primary}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            style={[
                                styles.statusBadgeText,
                                {
                                    color: pet.status === status ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                                },
                            ]}
                        >
                            {status === "available" ? "Disponível" : status === "pending" ? "Pendente" : "Adotado"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )

    const renderImagePickerModal = () => (
        <Modal
            visible={showImageModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowImageModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Animated.View style={[styles.modalContent, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Adicionar Foto do Pet
                            </Text>
                            <Text style={[styles.modalSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                {Platform.OS === "web"
                                    ? "Escolha como deseja adicionar a foto"
                                    : "Escolha como deseja adicionar a foto"}
                            </Text>
                        </View>

                        <View style={styles.modalButtons}>
                            {Platform.OS === "web" ? (
                                // Web options
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalButton,
                                            styles.cameraButton,
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
                                            styles.galleryButton,
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
                                                Selecionar arquivos do computador
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
                                            styles.cameraButton,
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
                                            styles.galleryButton,
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
                    </Animated.View>
                </View>
            </View>
        </Modal>
    )

    // Add webcam modal for web
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                {/* Header with gradient */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Feather name="arrow-left" size={isSmallScreen ? 18 : 20} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEditing ? "Editar Pet" : "Adicionar Pet"}</Text>
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
                        {/* Enhanced Image Upload Section */}
                        <View style={styles.imageSection}>
                            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>Imagens do Pet *</Text>

                            <TouchableOpacity
                                style={[
                                    styles.imageUploadContainer,
                                    { backgroundColor: isDarkTheme ? "#374151" : "white" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {},
                                ]}
                                onPress={showImagePickerOptions}
                            >
                                {pet.images.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {pet.images.map((image, index) => (
                                            <View key={index} style={styles.imageContainer}>
                                                <Image source={{ uri: image }} style={styles.image} />
                                                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                                    <Feather name="x" size={isSmallScreen ? 14 : 16} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        {pet.images.length < 5 && (
                                            <TouchableOpacity style={styles.addMoreImagesButton} onPress={showImagePickerOptions}>
                                                <Feather name="plus" size={isSmallScreen ? 28 : 32} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyImageContainer}>
                                        <View style={[styles.imageIcon, { backgroundColor: `${colors.primary}15` }]}>
                                            <Feather name="camera" size={isSmallScreen ? 28 : 32} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.imageUploadText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                            Toque para tirar foto ou escolher da galeria
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Basic Information */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Informações Básicas
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Nome do Pet *</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Digite o nome do pet"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.name}
                                    onChangeText={(value) => handleInputChange("name", value)}
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                    <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Idade *</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            {
                                                backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                                color: isDarkTheme ? "white" : "#374151",
                                            },
                                        ]}
                                        placeholder="ex: 2 anos"
                                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        value={pet.age}
                                        onChangeText={(value) => handleInputChange("age", value)}
                                    />
                                </View>

                                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Cor</Text>
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            {
                                                backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                                color: isDarkTheme ? "white" : "#374151",
                                            },
                                        ]}
                                        placeholder="ex: Marrom"
                                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        value={pet.color}
                                        onChangeText={(value) => handleInputChange("color", value)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Raça *</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="ex: Labrador Retriever"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.breed}
                                    onChangeText={(value) => handleInputChange("breed", value)}
                                />
                            </View>

                            {/* Enhanced Location Section */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Localização *</Text>
                                <View style={styles.locationContainer}>
                                    <TextInput
                                        style={[
                                            styles.locationInput,
                                            {
                                                backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                                color: isDarkTheme ? "white" : "#374151",
                                            },
                                        ]}
                                        placeholder="Digite a localização ou use GPS"
                                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        value={pet.location}
                                        onChangeText={(value) => handleInputChange("location", value)}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={[styles.locationButton, { backgroundColor: colors.primary }]}
                                        onPress={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                    >
                                        {isLoadingLocation ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Feather name="map-pin" size={isSmallScreen ? 18 : 20} color="white" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {currentLocation && (
                                    <TouchableOpacity style={styles.mapButton} onPress={openMapsForLocation}>
                                        <Feather name="map" size={14} color={colors.primary} />
                                        <Text style={[styles.mapButtonText, { color: colors.primary }]}>Ver no mapa</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Select Options */}
                        {renderSelectButton(petTypes, pet.type, (value) => handleInputChange("type", value), "Tipo de Pet *")}
                        {renderSelectButton(genders, pet.gender, (value) => handleInputChange("gender", value), "Gênero *")}
                        {renderSelectButton(sizes, pet.size, (value) => handleInputChange("size", value), "Tamanho *")}

                        {/* Description */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Descrição</Text>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Descrição *</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Descreva a personalidade, comportamento, gostos do pet, etc."
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.description}
                                    onChangeText={(value) => handleInputChange("description", value)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>História</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Informações sobre o histórico do pet e lares anteriores."
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.history}
                                    onChangeText={(value) => handleInputChange("history", value)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Requirements */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Requisitos para Adoção
                            </Text>

                            <View style={styles.requirementInputContainer}>
                                <TextInput
                                    style={[
                                        styles.requirementInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Adicionar requisito"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={currentRequirement}
                                    onChangeText={setCurrentRequirement}
                                />
                                <TouchableOpacity
                                    style={[styles.addRequirementButton, { backgroundColor: colors.primary }]}
                                    onPress={handleAddRequirement}
                                >
                                    <Feather name="plus" size={isSmallScreen ? 18 : 20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {pet.requirements.length > 0 ? (
                                <View style={styles.requirementsList}>
                                    {pet.requirements.map((requirement, index) => (
                                        <View
                                            key={index}
                                            style={[styles.requirementItem, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }]}
                                        >
                                            <Text style={[styles.requirementText, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                {requirement}
                                            </Text>
                                            <TouchableOpacity onPress={() => handleRemoveRequirement(index)}>
                                                <Feather name="trash-2" size={isSmallScreen ? 14 : 16} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={[styles.noRequirementsText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    Nenhum requisito adicionado ainda.
                                </Text>
                            )}
                        </View>

                        {/* Health & Medical */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Saúde e Medicina</Text>

                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Vacinado</Text>
                                <Switch
                                    value={pet.vaccinated}
                                    onValueChange={(value) => handleInputChange("vaccinated", value)}
                                    trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                    thumbColor={pet.vaccinated ? "white" : "#F3F4F6"}
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Castrado/Esterilizado
                                </Text>
                                <Switch
                                    value={pet.neutered}
                                    onValueChange={(value) => handleInputChange("neutered", value)}
                                    trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                    thumbColor={pet.neutered ? "white" : "#F3F4F6"}
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Possui Necessidades Especiais
                                </Text>
                                <Switch
                                    value={pet.specialNeeds}
                                    onValueChange={(value) => handleInputChange("specialNeeds", value)}
                                    trackColor={{ false: "#D1D5DB", true: colors.primary }}
                                    thumbColor={pet.specialNeeds ? "white" : "#F3F4F6"}
                                />
                            </View>

                            {pet.specialNeeds && (
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                        Descrição das Necessidades Especiais
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            {
                                                backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                                color: isDarkTheme ? "white" : "#374151",
                                            },
                                        ]}
                                        placeholder="Descreva as necessidades especiais ou condições médicas do pet"
                                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        value={pet.specialNeedsDescription || ""}
                                        onChangeText={(value) => handleInputChange("specialNeedsDescription", value)}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        </View>

                        {/* Contact Information */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Informações de Contato
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Telefone de Contato
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Número de telefone"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.contactPhone || ""}
                                    onChangeText={(value) => handleInputChange("contactPhone", value)}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Email de Contato</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Endereço de email"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.contactEmail || ""}
                                    onChangeText={(value) => handleInputChange("contactEmail", value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Status */}
                        {renderStatusBadges()}

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
                                    <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Pet" : "Salvar Pet"}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
                {renderImagePickerModal()}
                {renderWebcamModal()}
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
        paddingBottom: isSmallScreen ? 20 : 24,
        paddingHorizontal: isSmallScreen ? 16 : 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: isSmallScreen ? 18 : 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingTop: isSmallScreen ? 16 : 20,
        paddingBottom: 40,
    },
    webScrollContent: {
        maxWidth: isLargeScreen ? 800 : 600,
        alignSelf: "center",
        width: "100%",
    },
    section: {
        borderRadius: 16,
        padding: isSmallScreen ? 16 : 20,
        marginBottom: isSmallScreen ? 20 : 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sectionTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "700",
        marginBottom: isSmallScreen ? 12 : 16,
    },
    label: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: isSmallScreen ? 14 : 16,
    },
    inputRow: {
        flexDirection: isSmallScreen ? "column" : "row",
        marginBottom: isSmallScreen ? 0 : 16,
    },
    inputLabel: {
        fontSize: isSmallScreen ? 13 : 14,
        fontWeight: "500",
        marginBottom: 6,
    },
    textInput: {
        borderRadius: 12,
        paddingVertical: Platform.OS === "web" ? 14 : 12,
        paddingHorizontal: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
            height: 50,
        }),
    },
    textArea: {
        borderRadius: 12,
        padding: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: isSmallScreen ? 80 : 100,
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    // Enhanced location styles
    locationContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    locationInput: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: 50,
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    locationButton: {
        width: isSmallScreen ? 44 : 48,
        height: isSmallScreen ? 44 : 48,
        borderRadius: isSmallScreen ? 22 : 24,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 3,
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingVertical: 4,
    },
    mapButtonText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: "500",
    },
    selectSection: {
        marginBottom: isSmallScreen ? 20 : 24,
    },
    selectScrollView: {
        marginBottom: 8,
    },
    selectButton: {
        paddingHorizontal: isSmallScreen ? 14 : 18,
        paddingVertical: isSmallScreen ? 10 : 12,
        borderRadius: 25,
        borderWidth: 2,
        minWidth: isSmallScreen ? 80 : 100,
        alignItems: "center",
    },
    selectButtonText: {
        fontWeight: "600",
        textTransform: "capitalize",
        fontSize: isSmallScreen ? 13 : 14,
    },
    statusSection: {
        marginBottom: isSmallScreen ? 20 : 24,
    },
    statusContainer: {
        flexDirection: isSmallScreen ? "column" : "row",
        gap: isSmallScreen ? 8 : 0,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: isSmallScreen ? 10 : 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 2,
        ...(isSmallScreen && { marginBottom: 8 }),
    },
    statusBadgeText: {
        fontWeight: "600",
        fontSize: isSmallScreen ? 12 : 14,
    },
    imageSection: {
        marginBottom: isSmallScreen ? 20 : 24,
    },
    imageUploadContainer: {
        height: isSmallScreen ? 180 : 200,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
    },
    emptyImageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    imageIcon: {
        width: isSmallScreen ? 56 : 64,
        height: isSmallScreen ? 56 : 64,
        borderRadius: isSmallScreen ? 28 : 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    imageUploadText: {
        fontSize: isSmallScreen ? 14 : 16,
        textAlign: "center",
    },
    imageContainer: {
        position: "relative",
        marginRight: 12,
        marginVertical: 8,
    },
    image: {
        width: isSmallScreen ? 100 : 120,
        height: isSmallScreen ? 100 : 120,
        borderRadius: 12,
    },
    removeImageButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 12,
        width: isSmallScreen ? 20 : 24,
        height: isSmallScreen ? 20 : 24,
        alignItems: "center",
        justifyContent: "center",
    },
    addMoreImagesButton: {
        width: isSmallScreen ? 100 : 120,
        height: isSmallScreen ? 100 : 120,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
    },
    requirementInputContainer: {
        flexDirection: "row",
        marginBottom: 16,
        gap: 8,
    },
    requirementInput: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    addRequirementButton: {
        width: isSmallScreen ? 44 : 48,
        height: isSmallScreen ? 44 : 48,
        borderRadius: isSmallScreen ? 22 : 24,
        alignItems: "center",
        justifyContent: "center",
        ...(Platform.OS === "web" && {
            cursor: "pointer",
            transition: "0.2s opacity",
        }),
    },
    requirementsList: {
        marginTop: 8,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    requirementText: {
        flex: 1,
        fontSize: isSmallScreen ? 13 : 14,
        marginRight: 8,
    },
    noRequirementsText: {
        fontSize: isSmallScreen ? 13 : 14,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 8,
        padding: 16,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingVertical: 4,
    },
    switchLabel: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "500",
        flex: 1,
    },
    submitButton: {
        borderRadius: 16,
        paddingVertical: isSmallScreen ? 14 : 16,
        marginTop: isSmallScreen ? 20 : 24,
        ...(Platform.OS === "web" && {
            cursor: "pointer",
            transition: "0.2s opacity",
        }),
    },
    submitButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    submitButtonText: {
        color: "white",
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "700",
    },
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    androidShadow: {
        elevation: 4,
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
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
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
    cameraButton: {
        // Additional styles for camera button if needed
    },
    galleryButton: {
        // Additional styles for gallery button if needed
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
