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
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
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

export default function AddPet() {
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

    const pickImage = async () => {
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
                images: [...prevPet.images, ...newImages].slice(0, 5), // Limit to 5 images
            }))
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

            navigation.goBack()
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
                        {/* Image Upload Section */}
                        <View style={styles.imageSection}>
                            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>Imagens do Pet *</Text>

                            <TouchableOpacity
                                style={[
                                    styles.imageUploadContainer,
                                    { backgroundColor: isDarkTheme ? "#374151" : "white" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {},
                                ]}
                                onPress={pickImage}
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
                                            <TouchableOpacity style={styles.addMoreImagesButton}>
                                                <Feather name="plus" size={isSmallScreen ? 28 : 32} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyImageContainer}>
                                        <View style={[styles.imageIcon, { backgroundColor: `${colors.primary}15` }]}>
                                            <Feather name="image" size={isSmallScreen ? 28 : 32} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.imageUploadText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                            Toque para adicionar imagens
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

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Localização *</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Digite a localização atual do pet"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.location}
                                    onChangeText={(value) => handleInputChange("location", value)}
                                />
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
})
