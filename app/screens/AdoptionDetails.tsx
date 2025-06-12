"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
    Animated,
    StyleSheet,
    Modal,
    TextInput,
    Linking,
    Alert,
    Dimensions,
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { auth, db, getPetById, type Pet } from "../config/firebase"
import { doc, getDoc } from "firebase/firestore"
import HeaderLayout from "../utils/HeaderLayout"

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isMediumScreen = width >= 380 && width < 768
const isLargeScreen = width >= 768
const isWebPlatform = Platform.OS === "web"

export default function PetAdoptionDetail() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()
    const route = useRoute<any>()
    const { petId } = route.params || {}

    // Enhanced animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))
    const [scaleAnim] = useState(new Animated.Value(0.95))
    const scrollY = useRef(new Animated.Value(0)).current

    // Enhanced header animation values
    const headerHeight = isLargeScreen ? 400 : isSmallScreen ? 280 : 320
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.3, headerHeight * 0.7],
        outputRange: [0, 0.3, 1],
        extrapolate: "clamp",
    })

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.5, headerHeight],
        outputRange: [1, 0.7, 0.3],
        extrapolate: "clamp",
    })

    const imageScale = scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [1, 1.1],
        extrapolate: "clamp",
    })

    const [pet, setPet] = useState<Pet | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [userPhone, setUserPhone] = useState<string | null>(null)
    const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false)
    const [phoneInput, setPhoneInput] = useState("")
    const [isSubmittingPhone, setIsSubmittingPhone] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Fetch pet data and user phone
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const pets = await getPetById(petId)

                if (!pets) {
                    throw new Error("Pet not found")
                } else {
                    setPet(pets)
                }

                // Fetch user phone from Firebase
                if (auth.currentUser) {
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        setUserPhone(userData.phone || null)
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                Alert.alert("Erro", "Ocorreu um erro ao carregar os dados. Tente novamente.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()

        // Enhanced animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 8,
                bounciness: 4,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                speed: 10,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [petId])

    const handleScroll = (event: any) => {
        // Para Android, atualizamos manualmente o valor animado
        if (Platform.OS === "android") {
            scrollY.setValue(event.nativeEvent.contentOffset.y)
        } else {
            // Para iOS, usamos o Animated.event
            Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: true,
            })(event)
        }
    }

    const handleAdopt = async () => {
        if (!pet) return

        const rawNumber = pet.contactPhone || userPhone

        if (rawNumber) {
            const phoneNumber = rawNumber.replace(/\D/g, "")
            if (phoneNumber) {
                const message = `Olá! Tenho interesse na adoção do ${pet.name}. Podemos conversar?`
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                try {
                    await Linking.openURL(url)
                } catch (error) {
                    console.error("Erro ao abrir WhatsApp:", error)
                    Alert.alert("Erro", "Não foi possível abrir o WhatsApp. Verifique se o app está instalado.")
                }
            } else {
                Alert.alert("Erro", "Número de telefone não disponível. Entre em contato por email.")
            }
        } else {
            Alert.alert("Erro", "Número de telefone não disponível. Entre em contato por email.")
        }
    }

    const nextImage = () => {
        if (!pet) return
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % pet.images.length)
    }

    const prevImage = () => {
        if (!pet) return
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + pet.images.length) % pet.images.length)
    }

    if (isLoading || !pet) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <View style={styles.loadingCard}>
                    <LinearGradient
                        colors={isDarkTheme ? ["#1F2937", "#374151"] : ["#FFFFFF", "#F9FAFB"]}
                        style={styles.loadingGradient}
                    >
                        <View style={[styles.loadingSpinner, { borderTopColor: colors.primary }]} />
                        <Text style={[styles.loadingText, { color: isDarkTheme ? "#E5E7EB" : "#374151" }]}>
                            Carregando informações do pet...
                        </Text>
                    </LinearGradient>
                </View>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
            {/* Enhanced Floating Header */}
            <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.floatingHeaderGradient}
                >
                    <View style={styles.floatingHeaderOverlay} />
                    <View style={styles.floatingHeaderContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingBackButton}>
                            <LinearGradient
                                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                                style={styles.floatingBackButtonGradient}
                            >
                                <Feather name="arrow-left" size={isSmallScreen ? 18 : 20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.floatingHeaderTitleContainer}>
                            <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
                                {pet.name}
                            </Text>
                            <Text style={styles.floatingHeaderSubtitle}>{pet.breed}</Text>
                        </View>
                        <View style={{ width: isSmallScreen ? 36 : 40 }} />
                    </View>
                </LinearGradient>
            </Animated.View>

            <View style={styles.headerLayoutContainer}>
                <HeaderLayout title="Adoção" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={isWebPlatform && styles.webScrollContent}
            >
                {/* Enhanced Image Carousel */}
                <Animated.View
                    style={[
                        styles.imageCarouselContainer,
                        {
                            opacity: imageOpacity,
                            transform: [{ scale: imageScale }],
                        },
                    ]}
                >
                    <View style={styles.imageCarousel}>
                        <Image source={{ uri: pet.images[currentImageIndex] }} style={styles.carouselImage} />

                        {/* Enhanced Image Navigation */}
                        {pet.images.length > 1 && (
                            <>
                                <TouchableOpacity onPress={prevImage} style={[styles.imageNavButton, styles.imageNavLeft]}>
                                    <LinearGradient colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.4)"]} style={styles.imageNavGradient}>
                                        <Feather name="chevron-left" size={isSmallScreen ? 20 : 24} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={nextImage} style={[styles.imageNavButton, styles.imageNavRight]}>
                                    <LinearGradient colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.4)"]} style={styles.imageNavGradient}>
                                        <Feather name="chevron-right" size={isSmallScreen ? 20 : 24} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Enhanced Image Indicators */}
                                <View style={styles.imageIndicators}>
                                    {pet.images.map((_, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setCurrentImageIndex(index)}
                                            style={[
                                                styles.imageIndicator,
                                                {
                                                    backgroundColor: index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.4)",
                                                    transform: [{ scale: index === currentImageIndex ? 1.2 : 1 }],
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Enhanced Gradient Overlay */}
                        <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.imageGradientOverlay} />

                        {/* Enhanced Back Button */}
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <LinearGradient colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.4)"]} style={styles.backButtonGradient}>
                                <Feather name="arrow-left" size={isSmallScreen ? 18 : 20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Status Badge */}
                        <View style={styles.statusBadge}>
                            <LinearGradient
                                colors={
                                    pet.status === "available"
                                        ? ["#10B981", "#059669"]
                                        : pet.status === "pending"
                                            ? ["#F59E0B", "#D97706"]
                                            : ["#EF4444", "#DC2626"]
                                }
                                style={styles.statusBadgeGradient}
                            >
                                <Feather
                                    name={pet.status === "available" ? "check" : pet.status === "pending" ? "clock" : "heart"}
                                    size={12}
                                    color="white"
                                    style={{ marginRight: 4 }}
                                />
                                <Text style={styles.statusBadgeText}>
                                    {pet.status === "available" ? "Disponível" : pet.status === "pending" ? "Pendente" : "Adotado"}
                                </Text>
                            </LinearGradient>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Enhanced Pet Header */}
                    <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                    : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                            }
                            style={styles.sectionGradient}
                        >
                            <View style={styles.petHeader}>
                                <View style={styles.petHeaderInfo}>
                                    <Text style={[styles.petName, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>{pet.name}</Text>
                                    <Text style={[styles.petBreed, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>
                                        {pet.breed} • {pet.age}
                                    </Text>
                                    <View style={styles.locationContainer}>
                                        <Feather name="map-pin" size={isSmallScreen ? 14 : 16} color={colors.primary} />
                                        <Text style={[styles.locationText, { color: isDarkTheme ? "#E5E7EB" : "#374151" }]}>
                                            {pet.location}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.petTypeContainer}>
                                    <View
                                        style={[
                                            styles.petTypeBadge,
                                            {
                                                backgroundColor: pet.type === "Cachorro" ? `${colors.primary}20` : `${colors.secondary}20`,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.petTypeText,
                                                {
                                                    color: pet.type === "Cachorro" ? colors.primary : colors.secondary,
                                                },
                                            ]}
                                        >
                                            {pet.type}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Enhanced Pet Attributes */}
                    <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                    : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                            }
                            style={styles.sectionGradient}
                        >
                            <View style={styles.sectionHeader}>
                                <Feather name="info" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                    Características
                                </Text>
                            </View>

                            <View style={styles.attributesGrid}>
                                <AttributeItem
                                    icon="maximize-2"
                                    label="Tamanho"
                                    value={pet.size}
                                    isDark={isDarkTheme}
                                    colors={colors}
                                />
                                <AttributeItem
                                    icon={pet.gender === "Macho" ? "github" : "gitlab"}
                                    label="Gênero"
                                    value={pet.gender}
                                    isDark={isDarkTheme}
                                    colors={colors}
                                />
                                <AttributeItem icon="droplet" label="Cor" value={pet.color} isDark={isDarkTheme} colors={colors} />
                                <AttributeItem icon="calendar" label="Idade" value={pet.age} isDark={isDarkTheme} colors={colors} />
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Enhanced Health Status */}
                    <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                    : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                            }
                            style={styles.sectionGradient}
                        >
                            <View style={styles.sectionHeader}>
                                <Feather name="shield" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>Saúde</Text>
                            </View>

                            <View style={styles.healthGrid}>
                                <HealthItem label="Vacinado" value={pet.vaccinated} isDark={isDarkTheme} colors={colors} />
                                <HealthItem label="Castrado" value={pet.neutered} isDark={isDarkTheme} colors={colors} />
                                <HealthItem
                                    label="Necessidades Especiais"
                                    value={pet.specialNeeds}
                                    isDark={isDarkTheme}
                                    colors={colors}
                                />
                            </View>

                            {pet.specialNeeds && pet.specialNeedsDescription && (
                                <View style={styles.specialNeedsContainer}>
                                    <View style={styles.specialNeedsHeader}>
                                        <Feather name="alert-circle" size={16} color="#F59E0B" />
                                        <Text style={[styles.specialNeedsTitle, { color: isDarkTheme ? "#FCD34D" : "#D97706" }]}>
                                            Cuidados Especiais
                                        </Text>
                                    </View>
                                    <Text style={[styles.specialNeedsText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                        {pet.specialNeedsDescription}
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </View>

                    {/* Enhanced Description */}
                    <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                    : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                            }
                            style={styles.sectionGradient}
                        >
                            <View style={styles.sectionHeader}>
                                <Feather name="book-open" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                    Sobre {pet.name}
                                </Text>
                            </View>

                            <Text style={[styles.descriptionText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                {pet.description}
                            </Text>

                            {pet.history && (
                                <>
                                    <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                                        <Feather name="clock" size={20} color={colors.secondary} />
                                        <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>História</Text>
                                    </View>
                                    <Text style={[styles.descriptionText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                        {pet.history}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </View>

                    {/* Enhanced Adoption Requirements */}
                    {pet.requirements && pet.requirements.length > 0 && (
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                            <LinearGradient
                                colors={
                                    isDarkTheme
                                        ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                        : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                                }
                                style={styles.sectionGradient}
                            >
                                <View style={styles.sectionHeader}>
                                    <Feather name="list" size={20} color={colors.primary} />
                                    <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                        Requisitos para Adoção
                                    </Text>
                                </View>

                                {pet.requirements.map((requirement, index) => (
                                    <View key={index} style={styles.requirementItem}>
                                        <View style={[styles.requirementIcon, { backgroundColor: `${colors.primary}20` }]}>
                                            <Feather name="check" size={isSmallScreen ? 12 : 14} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.requirementText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                            {requirement}
                                        </Text>
                                    </View>
                                ))}
                            </LinearGradient>
                        </View>
                    )}

                    {/* Enhanced Contact Information */}
                    <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.8)", "rgba(55,65,81,0.8)"]
                                    : ["rgba(255,255,255,0.9)", "rgba(249,250,251,0.9)"]
                            }
                            style={styles.sectionGradient}
                        >
                            <View style={styles.sectionHeader}>
                                <Feather name="phone" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>Contato</Text>
                            </View>

                            {pet.contactPhone && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(`tel:${pet.contactPhone?.replace(/\D/g, "")}`)}
                                    style={styles.contactItem}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                                        <Feather name="phone" size={isSmallScreen ? 18 : 20} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.contactText, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                        {pet.contactPhone}
                                    </Text>
                                    <Feather name="external-link" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                </TouchableOpacity>
                            )}

                            {pet.contactEmail && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(`mailto:${pet.contactEmail}`)}
                                    style={styles.contactItem}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: `${colors.secondary}20` }]}>
                                        <Feather name="mail" size={isSmallScreen ? 18 : 20} color={colors.secondary} />
                                    </View>
                                    <Text style={[styles.contactText, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                        {pet.contactEmail}
                                    </Text>
                                    <Feather name="external-link" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Enhanced Adoption Button */}
            <View style={[styles.adoptionButtonContainer, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <View style={styles.adoptionButtonWrapper}>
                    <TouchableOpacity onPress={handleAdopt} style={styles.adoptionButton}>
                        <LinearGradient
                            colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                            style={styles.adoptionButtonGradient}
                        >
                            <Feather name="heart" size={isSmallScreen ? 18 : 20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.adoptionButtonText}>Quero Adotar {pet.name}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Enhanced Phone Modal */}
            <Modal
                visible={isPhoneModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsPhoneModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                        <LinearGradient
                            colors={
                                isDarkTheme
                                    ? ["rgba(31,41,55,0.9)", "rgba(55,65,81,0.9)"]
                                    : ["rgba(255,255,255,0.95)", "rgba(249,250,251,0.95)"]
                            }
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalHeader}>
                                <Feather name="phone" size={24} color={colors.primary} />
                                <Text style={[styles.modalTitle, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}>
                                    Adicionar Telefone
                                </Text>
                            </View>

                            <Text style={[styles.modalDescription, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>
                                Para prosseguir com a adoção, precisamos do seu número de telefone para contato.
                            </Text>

                            <View style={[styles.phoneInputContainer, { backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB" }]}>
                                <Feather name="phone" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                <TextInput
                                    style={[styles.phoneInput, { color: isDarkTheme ? "#F9FAFB" : "#111827" }]}
                                    placeholder="(00) 00000-0000"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={phoneInput}
                                    onChangeText={setPhoneInput}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    onPress={() => setIsPhoneModalVisible(false)}
                                    style={[styles.modalButton, styles.modalCancelButton]}
                                >
                                    <Text style={[styles.modalCancelText, { color: isDarkTheme ? "#D1D5DB" : "#6B7280" }]}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]}>
                                    <LinearGradient colors={[colors.primary, `${colors.primary}CC`]} style={styles.modalConfirmGradient}>
                                        <Text style={styles.modalConfirmText}>Confirmar</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// Enhanced Attribute Item Component
interface AttributeItemProps {
    icon: string
    label: string
    value: string
    isDark: boolean
    colors: any
}

function AttributeItem({ icon, label, value, isDark, colors }: AttributeItemProps) {
    return (
        <View style={styles.attributeItem}>
            <View style={[styles.attributeIcon, { backgroundColor: `${colors.primary}15` }]}>
                <LinearGradient colors={[`${colors.primary}30`, `${colors.primary}10`]} style={styles.attributeIconGradient}>
                    <Feather name={icon as any} size={isSmallScreen ? 16 : 18} color={colors.primary} />
                </LinearGradient>
            </View>
            <Text style={[styles.attributeLabel, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>{label}</Text>
            <Text style={[styles.attributeValue, { color: isDark ? "#F9FAFB" : "#111827" }]}>{value}</Text>
        </View>
    )
}

// Enhanced Health Item Component
interface HealthItemProps {
    label: string
    value: boolean
    isDark: boolean
    colors: any
}

function HealthItem({ label, value, isDark, colors }: HealthItemProps) {
    return (
        <View style={styles.healthItem}>
            <View style={[styles.healthIcon, { backgroundColor: value ? "#10B98120" : "#EF444420" }]}>
                <Feather name={value ? "check" : "x"} size={isSmallScreen ? 14 : 16} color={value ? "#10B981" : "#EF4444"} />
            </View>
            <Text style={[styles.healthLabel, { color: isDark ? "#D1D5DB" : "#374151" }]}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    loadingCard: {
        borderRadius: 24,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
        }),
    },
    loadingGradient: {
        padding: 32,
        alignItems: "center",
    },
    loadingSpinner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: "transparent",
        marginBottom: 16,
        ...Platform.select({
            web: {
                animation: "spin 1s linear infinite",
            },
        }),
    },
    loadingText: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "600",
    },
    floatingHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    floatingHeaderGradient: {
        paddingTop: Platform.OS === "ios" ? 64 : Platform.OS === "android" ? 48 : 24,
        paddingBottom: 16,
        paddingHorizontal: isSmallScreen ? 16 : 20,
        position: "relative",
    },
    floatingHeaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    floatingHeaderContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1,
    },
    floatingBackButton: {
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: isSmallScreen ? 18 : 20,
        overflow: "hidden",
    },
    floatingBackButtonGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    floatingHeaderTitleContainer: {
        alignItems: "center",
        flex: 1,
        marginHorizontal: 16,
    },
    floatingHeaderTitle: {
        color: "white",
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "700",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    floatingHeaderSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: isSmallScreen ? 12 : 14,
        fontWeight: "500",
        marginTop: 2,
    },
    headerLayoutContainer: {
        position: "absolute",
        right: 0,
        top: 20,
        flexDirection: "row",
        alignSelf: "flex-end",
        alignItems: "center",
        zIndex: 11,
    },
    webScrollContent: {
        maxWidth: isLargeScreen ? 1200 : 800,
        alignSelf: "center",
        width: "100%",
    },
    imageCarouselContainer: {
        position: "relative",
    },
    imageCarousel: {
        position: "relative",
    },
    carouselImage: {
        width: "100%",
        height: isLargeScreen ? 400 : isSmallScreen ? 280 : 320,
    },
    imageNavButton: {
        position: "absolute",
        top: "50%",
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: isSmallScreen ? 18 : 20,
        overflow: "hidden",
        transform: [{ translateY: -20 }],
    },
    imageNavLeft: {
        left: isSmallScreen ? 12 : 16,
    },
    imageNavRight: {
        right: isSmallScreen ? 12 : 16,
    },
    imageNavGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    imageIndicators: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    imageIndicator: {
        width: isSmallScreen ? 6 : 8,
        height: isSmallScreen ? 6 : 8,
        borderRadius: isSmallScreen ? 3 : 4,
        marginHorizontal: isSmallScreen ? 3 : 4,
    },
    imageGradientOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    backButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 48 : Platform.OS === "android" ? 32 : 16,
        left: isSmallScreen ? 12 : 16,
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: isSmallScreen ? 18 : 20,
        overflow: "hidden",
    },
    backButtonGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statusBadge: {
        position: "absolute",
        top: Platform.OS === "ios" ? 48 : Platform.OS === "android" ? 32 : 16,
        right: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        overflow: "hidden",
    },
    statusBadgeGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    content: {
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingTop: isSmallScreen ? 16 : 20,
        paddingBottom: 120,
    },
    section: {
        borderRadius: 24,
        marginBottom: isSmallScreen ? 16 : 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            },
        }),
    },
    sectionGradient: {
        padding: isSmallScreen ? 20 : 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: isSmallScreen ? 16 : 20,
    },
    sectionTitle: {
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "700",
        marginLeft: 12,
    },
    petHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    petHeaderInfo: {
        flex: 1,
        marginRight: 16,
    },
    petName: {
        fontSize: isLargeScreen ? 32 : isSmallScreen ? 24 : 28,
        fontWeight: "700",
        marginBottom: 4,
    },
    petBreed: {
        fontSize: isSmallScreen ? 16 : 18,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: isSmallScreen ? 14 : 16,
        marginLeft: 6,
    },
    petTypeContainer: {
        alignItems: "flex-end",
    },
    petTypeBadge: {
        paddingHorizontal: isSmallScreen ? 12 : 16,
        paddingVertical: isSmallScreen ? 8 : 10,
        borderRadius: isSmallScreen ? 12 : 16,
    },
    petTypeText: {
        fontSize: isSmallScreen ? 12 : 14,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    attributesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    attributeItem: {
        width: "48%",
        alignItems: "center",
        marginBottom: isSmallScreen ? 16 : 20,
    },
    attributeIcon: {
        width: isSmallScreen ? 48 : 56,
        height: isSmallScreen ? 48 : 56,
        borderRadius: isSmallScreen ? 24 : 28,
        marginBottom: 8,
        overflow: "hidden",
    },
    attributeIconGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    attributeLabel: {
        fontSize: isSmallScreen ? 12 : 14,
        marginBottom: 4,
        textAlign: "center",
    },
    attributeValue: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "600",
        textAlign: "center",
        textTransform: "capitalize",
    },
    healthGrid: {
        flexDirection: "column",
        gap: 12,
    },
    healthItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    healthIcon: {
        width: isSmallScreen ? 24 : 28,
        height: isSmallScreen ? 24 : 28,
        borderRadius: isSmallScreen ? 12 : 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    healthLabel: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "500",
    },
    specialNeedsContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    specialNeedsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    specialNeedsTitle: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    specialNeedsText: {
        fontSize: isSmallScreen ? 13 : 14,
        lineHeight: isSmallScreen ? 18 : 20,
    },
    descriptionText: {
        fontSize: isSmallScreen ? 14 : 16,
        lineHeight: isSmallScreen ? 22 : 24,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    requirementIcon: {
        width: isSmallScreen ? 20 : 24,
        height: isSmallScreen ? 20 : 24,
        borderRadius: isSmallScreen ? 10 : 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    requirementText: {
        flex: 1,
        fontSize: isSmallScreen ? 14 : 16,
        lineHeight: isSmallScreen ? 20 : 22,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        marginBottom: 8,
    },
    contactIcon: {
        width: isSmallScreen ? 40 : 44,
        height: isSmallScreen ? 40 : 44,
        borderRadius: isSmallScreen ? 20 : 22,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    contactText: {
        flex: 1,
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "500",
    },
    adoptionButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingVertical: isSmallScreen ? 16 : 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
            },
        }),
    },
    adoptionButtonWrapper: {
        maxWidth: isLargeScreen ? 600 : "100%",
        alignSelf: "center",
        width: "100%",
    },
    adoptionButton: {
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                cursor: "pointer",
            },
        }),
    },
    adoptionButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: isSmallScreen ? 16 : 18,
        paddingHorizontal: 24,
    },
    adoptionButtonText: {
        color: "white",
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "700",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxWidth: isLargeScreen ? 500 : 400,
        borderRadius: 24,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            },
            web: {
                boxShadow: "0 8px 48px rgba(0,0,0,0.15)",
            },
        }),
    },
    modalGradient: {
        padding: isSmallScreen ? 24 : 32,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: isSmallScreen ? 20 : 24,
        fontWeight: "700",
        marginLeft: 12,
    },
    modalDescription: {
        fontSize: isSmallScreen ? 14 : 16,
        lineHeight: isSmallScreen ? 20 : 24,
        marginBottom: 24,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(156, 163, 175, 0.2)",
    },
    phoneInput: {
        flex: 1,
        fontSize: isSmallScreen ? 15 : 16,
        marginLeft: 12,
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    modalButton: {
        borderRadius: 12,
        overflow: "hidden",
    },
    modalCancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    modalCancelText: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "500",
    },
    modalConfirmButton: {
        overflow: "hidden",
    },
    modalConfirmGradient: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    modalConfirmText: {
        color: "white",
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: "600",
    },
})
