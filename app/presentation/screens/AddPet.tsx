"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator,
    Switch,
    Dimensions,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAccount } from "../contexts/AccountContext"
import { createPet, getPetById, type Pet, updatePet } from "../../repositories/FirebasePetRepository"
import InteractiveMap from "@/app/presentation/components/InterctiveMap"
import EnhancedImageUpload from "@/app/presentation/components/EnchanedImageUpload"

const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isMediumScreen = width >= 380 && width < 768
const isLargeScreen = width >= 768
const isWebPlatform = Platform.OS === "web"

export default function AddPetEnhanced() {
    const { isDarkTheme, colors } = useThemeContext()
    const { currentAccount } = useAccount()
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
    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: number
        longitude: number
        address: string
    } | null>(null)

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

    const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
        setSelectedLocation(location)
        handleInputChange("location", location.address)
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

    const validateForm = () => {
        const errors = []

        if (!pet.name.trim()) errors.push("Nome é obrigatório")
        if (!pet.type) errors.push("Tipo de pet é obrigatório")
        if (!pet.breed.trim()) errors.push("Raça é obrigatória")
        if (!pet.age.trim()) errors.push("Idade é obrigatória")
        if (!pet.gender) errors.push("Gênero é obrigatório")
        if (!pet.size) errors.push("Porte é obrigatório")
        if (!pet.description.trim()) errors.push("Descrição é obrigatória")
        if (!pet.location.trim()) errors.push("Localização é obrigatória")
        if (pet.images.length === 0) errors.push("Pelo menos uma imagem é obrigatória")

        if (errors.length > 0) {
            Alert.alert("Campos obrigatórios", errors.join("\n"))
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            setIsSubmitting(true)

            const petWithAccount = {
                ...pet,
                createdBy: currentAccount.profileId,
                createdByType: currentAccount.type,
                createdByName: currentAccount.profileName,
                createdByProfileId: currentAccount.profileId,
                createdByAvatar: currentAccount.profileImage,
            }

            if (isEditing && petId) {
                await updatePet(petId, petWithAccount)
                Alert.alert("Sucesso", "Pet atualizado com sucesso!")
            } else {
                await createPet(petWithAccount)
                Alert.alert("Sucesso", "Pet cadastrado com sucesso!")
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
        getDisplayName: (value: string) => string,
    ) => (
        <View style={styles.selectSection}>
            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>{label} *</Text>
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
                            {getDisplayName(option)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )

    const getTypeDisplayName = (type: string) => {
        const names = {
            dog: "Cão",
            cat: "Gato",
            bird: "Pássaro",
            rabbit: "Coelho",
            other: "Outro",
        }
        return names[type as keyof typeof names] || type
    }

    const getGenderDisplayName = (gender: string) => {
        const names = {
            male: "Macho",
            female: "Fêmea",
            unknown: "Não informado",
        }
        return names[gender as keyof typeof names] || gender
    }

    const getSizeDisplayName = (size: string) => {
        const names = {
            small: "Pequeno",
            medium: "Médio",
            large: "Grande",
            "extra-large": "Extra Grande",
        }
        return names[size as keyof typeof names] || size
    }

    const getStatusDisplayName = (status: string) => {
        const names = {
            available: "Disponível",
            pending: "Pendente",
            adopted: "Adotado",
        }
        return names[status as keyof typeof names] || status
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                {/* Enhanced Header */}
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
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>{isEditing ? "Editar Pet" : "Cadastrar Pet"}</Text>
                            <Text style={styles.headerSubtitle}>
                                {isEditing ? "Atualize as informações" : "Adicione um novo amigo"}
                            </Text>
                        </View>
                        <View style={{ width: isSmallScreen ? 36 : 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, isWebPlatform && styles.webScrollContent]}
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
                        {/* Account Info Card */}
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="user" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Cadastrando como</Text>
                            </View>
                            <View style={styles.authorInfo}>
                                <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.authorInitial}>{currentAccount.profileName.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.authorName, { color: isDarkTheme ? "white" : "#374151" }]}>
                                        {currentAccount.profileName}
                                    </Text>
                                    <Text style={[styles.authorType, { color: colors.primary }]}>
                                        {currentAccount.type === "user"
                                            ? "👤 Usuário"
                                            : currentAccount.type === "ong"
                                                ? "🏠 ONG"
                                                : "🏥 Clínica"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Enhanced Image Upload */}
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="camera" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Fotos do Pet</Text>
                            </View>
                            <EnhancedImageUpload
                                images={pet.images}
                                onImagesChange={(images: string | boolean | string[]) => handleInputChange("images", images)}
                                maxImages={5}
                                title=""
                            />
                        </View>

                        {/* Basic Information */}
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="info" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Informações Básicas
                                </Text>
                            </View>

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
                        </View>

                        {/* Interactive Map for Location */}
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="map-pin" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Localização</Text>
                            </View>
                            <InteractiveMap
                                onLocationSelect={handleLocationSelect}
                                initialLocation={
                                    selectedLocation
                                        ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }
                                        : undefined
                                }
                                height={250}
                            />
                            {selectedLocation && (
                                <View style={styles.locationInfo}>
                                    <Text style={[styles.locationText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                        📍 {selectedLocation.address}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Select Options */}
                        {renderSelectButton(
                            petTypes,
                            pet.type,
                            (value) => handleInputChange("type", value),
                            "Tipo de Pet",
                            getTypeDisplayName,
                        )}
                        {renderSelectButton(
                            genders,
                            pet.gender,
                            (value) => handleInputChange("gender", value),
                            "Gênero",
                            getGenderDisplayName,
                        )}
                        {renderSelectButton(
                            sizes,
                            pet.size,
                            (value) => handleInputChange("size", value),
                            "Porte",
                            getSizeDisplayName,
                        )}

                        {/* Description */}
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="file-text" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Descrição e História
                                </Text>
                            </View>

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
                                    placeholder="Descreva a personalidade, comportamento, gostos do pet..."
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
                                    placeholder="Informações sobre o histórico do pet..."
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
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="check-square" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Requisitos para Adoção
                                </Text>
                            </View>

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
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="heart" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Saúde e Medicina</Text>
                            </View>

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
                                        placeholder="Descreva as necessidades especiais..."
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
                        <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <View style={styles.cardHeader}>
                                <Feather name="phone" size={20} color={colors.primary} />
                                <Text style={[styles.cardTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Informações de Contato
                                </Text>
                            </View>

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
                        {renderSelectButton(
                            statuses,
                            pet.status,
                            (value) => handleInputChange("status", value),
                            "Status de Adoção",
                            getStatusDisplayName,
                        )}

                        {/* Enhanced Submit Button */}
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
                            <LinearGradient
                                colors={isSubmitting ? ["#6B7280", "#6B7280"] : [colors.primary, colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButtonGradient}
                            >
                                {isSubmitting ? (
                                    <View style={styles.submitButtonContent}>
                                        <ActivityIndicator size="small" color="white" />
                                        <Text style={styles.submitButtonText}>{isEditing ? "Atualizando..." : "Salvando..."}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.submitButtonContent}>
                                        <Feather name="save" size={isSmallScreen ? 18 : 20} color="white" />
                                        <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Pet" : "Cadastrar Pet"}</Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
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
        width: isSmallScreen ? 48 : 52,
        height: isSmallScreen ? 48 : 52,
        borderRadius: isSmallScreen ? 24 : 26,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleContainer: {
        alignItems: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: isSmallScreen ? 12 : 14,
        marginTop: 2,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    webScrollContent: {
        maxWidth: isLargeScreen ? 800 : 600,
        alignSelf: "center",
        width: "100%",
    },
    content: {
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingTop: isSmallScreen ? 16 : 20,
    },
    card: {
        borderRadius: 16,
        padding: isSmallScreen ? 16 : 20,
        marginBottom: isSmallScreen ? 16 : 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    cardTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "700",
    },
    authorInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    authorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    authorInitial: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    authorName: {
        fontSize: 16,
        fontWeight: "600",
    },
    authorType: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 2,
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
    locationInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
        fontWeight: "500",
    },
    selectSection: {
        marginBottom: isSmallScreen ? 16 : 20,
    },
    label: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "600",
        marginBottom: 12,
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
        fontSize: isSmallScreen ? 13 : 14,
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
        marginTop: isSmallScreen ? 20 : 24,
        overflow: "hidden",
    },
    submitButtonGradient: {
        paddingVertical: isSmallScreen ? 14 : 16,
        alignItems: "center",
        justifyContent: "center",
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
})
