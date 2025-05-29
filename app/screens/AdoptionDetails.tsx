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
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { auth, db, getPetById, Pet } from "../config/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import HeaderLayout from "../utils/HeaderLayout"

export default function PetAdoptionDetail() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()
    const route = useRoute<any>()
    const { petId } = route.params || {}

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))
    const scrollY = useRef(new Animated.Value(0)).current

    // Header animation values
    const headerHeight = 300 // Approximate header height with image
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.5, headerHeight],
        outputRange: [0, 0.5, 1],
        extrapolate: "clamp",
    })

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.5, headerHeight],
        outputRange: [1, 0.5, 0],
        extrapolate: "clamp",
    })

    const imageTranslateY = scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, headerHeight * 0.5],
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
    const isWeb = Platform.OS === "web"

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

        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [petId])

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true
        }
    );

    const handleAdopt = async () => {
        if (!pet) return

        const rawNumber = pet.contactPhone || userPhone

        if (rawNumber) {
            const phoneNumber = rawNumber.replace(/\D/g, '')
            if (phoneNumber) {
                const message = 'Olá! Tenho interesse na adoção.'
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                try {
                    await Linking.openURL(url)
                } catch (error) {
                    console.error('Erro ao abrir WhatsApp:', error)
                    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se o app está instalado.')
                }
            } else {
                Alert.alert('Erro', 'Número de telefone não disponível. Entre em contato por email.')
            }
        } else {
            Alert.alert('Erro', 'Número de telefone não disponível. Entre em contato por email.')
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
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: fadeAnim }],
                    }}
                >
                    <Feather name="loader" size={40} color={colors.primary} className="animate-spin" />
                </Animated.View>
                <Text
                    className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    Carregando informações do pet...
                </Text>
            </View>
        )
    }

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Floating Header */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    opacity: headerOpacity,
                }}
            >
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pt-16 pb-4 px-4"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-base font-bold" numberOfLines={1}>
                            {pet.name}
                        </Text>
                        <View className="w-10" />
                    </View>
                </LinearGradient>
            </Animated.View>
            <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center', zIndex: 11 }}>
                <HeaderLayout title="Adoção" />
            </View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Image Carousel */}
                <Animated.View
                    style={{
                        opacity: imageOpacity,
                        transform: [{ translateY: imageTranslateY }],
                    }}
                >
                    <View className="relative">
                        <Image source={{ uri: pet.images[currentImageIndex] }} className="w-full h-80 object-cover" />

                        {/* Image Navigation */}
                        {pet.images.length > 1 && (
                            <>
                                <TouchableOpacity
                                    onPress={prevImage}
                                    className="absolute left-4 top-1/2 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                                    style={{ transform: [{ translateY: -20 }] }}
                                >
                                    <Feather name="chevron-left" size={24} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={nextImage}
                                    className="absolute right-4 top-1/2 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                                    style={{ transform: [{ translateY: -20 }] }}
                                >
                                    <Feather name="chevron-right" size={24} color="white" />
                                </TouchableOpacity>

                                {/* Image Indicators */}
                                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                                    {pet.images.map((_, index) => (
                                        <View
                                            key={index}
                                            className={`w-2 h-2 rounded-full mx-1 ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                                                }`}
                                        />
                                    ))}
                                </View>
                            </>
                        )}

                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-4 pt-6 pb-20"
                >
                    {/* Pet Name and Basic Info */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text
                                className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {pet.name}
                            </Text>
                            <Text
                                className={`text-base ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {pet.breed} • {pet.age}
                            </Text>
                        </View>

                        <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: pet.type === "Cachorro" ? `${colors.primary}20` : `${colors.secondary}20` }}
                        >
                            <Text
                                className="font-medium"
                                style={{
                                    color: pet.type === "Cachorro" ? colors.primary : colors.secondary,
                                    ...Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                }}
                            >
                                {pet.type}
                            </Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View className="flex-row items-center mb-6">
                        <Feather name="map-pin" size={16} color={colors.primary} />
                        <Text
                            className={`ml-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {pet.location}
                        </Text>
                    </View>

                    {/* Pet Attributes */}
                    <View
                        className={`flex-row flex-wrap justify-between p-4 rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"
                            }`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <AttributeItem icon="maximize-2" label="Tamanho" value={pet.size} isDark={isDarkTheme} colors={colors} />
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

                    {/* Health Status */}
                    <View
                        className={`p-4 rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Saúde
                        </Text>

                        <View className="flex-row flex-wrap">
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
                            <Text
                                className={`mt-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {pet.specialNeedsDescription}
                            </Text>
                        )}
                    </View>

                    {/* Description */}
                    <View
                        className={`p-4 rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Sobre {pet.name}
                        </Text>
                        <Text
                            className={`mb-4 leading-6 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {pet.description}
                        </Text>

                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            História
                        </Text>
                        <Text
                            className={`leading-6 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {pet.history}
                        </Text>
                    </View>

                    {/* Adoption Requirements */}
                    <View
                        className={`p-4 rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Requisitos para Adoção
                        </Text>

                        {pet.requirements.map((requirement, index) => (
                            <View key={index} className="flex-row mb-2">
                                <View
                                    className="w-6 h-6 rounded-full items-center justify-center mr-2"
                                    style={{ backgroundColor: `${colors.primary}20` }}
                                >
                                    <Feather name="check" size={14} color={colors.primary} />
                                </View>
                                <Text
                                    className={`flex-1 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {requirement}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Contact Information */}
                    <View
                        className={`p-4 rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <Text
                            className={`text-lg font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Contato
                        </Text>

                        {pet.contactPhone && (
                            <View className="flex-row items-center mb-3">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: `${colors.primary}20` }}
                                >
                                    <Feather name="phone" size={18} color={colors.primary} />
                                </View>
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${pet.contactPhone?.replace(/\D/g, "")}`)}>
                                    <Text
                                        className={`${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                        style={Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        })}
                                    >
                                        {pet.contactPhone}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {pet.contactEmail && (
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: `${colors.secondary}20` }}
                                >
                                    <Feather name="mail" size={18} color={colors.secondary} />
                                </View>
                                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${pet.contactEmail}`)}>
                                    <Text
                                        className={`${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                        style={Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        })}
                                    >
                                        {pet.contactEmail}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </Animated.ScrollView>

            {/* Adoption Button */}
            <View
                className={`absolute bottom-0 left-0 right-0 p-4 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <TouchableOpacity
                    onPress={handleAdopt}
                    className="py-4 rounded-xl flex-row items-center justify-center"
                    style={{
                        backgroundColor: colors.primary,
                        ...styles.adoptButton,
                    }}
                >
                    <Feather name="heart" size={20} color="white" className="mr-2" />
                    <Text
                        className="text-white font-bold text-lg"
                        style={Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        })}
                    >
                        Quero Adotar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Phone Modal */}
            <Modal
                visible={isPhoneModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsPhoneModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-4">
                    <View
                        className={`w-full max-w-md p-6 rounded-2xl ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        <Text
                            className={`text-xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Adicionar Telefone
                        </Text>

                        <Text
                            className={`mb-4 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Para prosseguir com a adoção, precisamos do seu número de telefone para contato.
                        </Text>

                        <TextInput
                            className={`p-4 rounded-xl mb-4 ${isDarkTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"}`}
                            placeholder="(00) 00000-0000"
                            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                            value={phoneInput}
                            onChangeText={setPhoneInput}
                            keyboardType="phone-pad"
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        />

                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={() => setIsPhoneModalVisible(false)} className="py-2 px-4 rounded-lg mr-2">
                                <Text
                                    className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// Attribute Item Component
interface AttributeItemProps {
    icon: string
    label: string
    value: string
    isDark: boolean
    colors: any
}

function AttributeItem({ icon, label, value, isDark, colors }: AttributeItemProps) {
    return (
        <View className="items-center mb-2 w-[48%]">
            <View
                className="w-10 h-10 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${colors.primary}15` }}
            >
                <Feather name={icon as any} size={18} color={colors.primary} />
            </View>
            <Text
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                style={Platform.select({
                    ios: { fontFamily: "San Francisco" },
                    android: { fontFamily: "Roboto" },
                })}
            >
                {label}
            </Text>
            <Text
                className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                style={Platform.select({
                    ios: { fontFamily: "San Francisco" },
                    android: { fontFamily: "Roboto" },
                })}
            >
                {value}
            </Text>
        </View>
    )
}

// Health Item Component
interface HealthItemProps {
    label: string
    value: boolean
    isDark: boolean
    colors: any
}

function HealthItem({ label, value, isDark, colors }: HealthItemProps) {
    return (
        <View className="flex-row items-center mr-6 mb-2">
            <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: value ? `${colors.success || "#10B981"}20` : `${colors.error}20` }}
            >
                <Feather name={value ? "check" : "x"} size={14} color={value ? colors.success || "#10B981" : colors.error} />
            </View>
            <Text
                className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                style={Platform.select({
                    ios: { fontFamily: "San Francisco" },
                    android: { fontFamily: "Roboto" },
                })}
            >
                {label}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    androidShadow: {
        elevation: 3,
    },
    webShadow: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    adoptButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
})
