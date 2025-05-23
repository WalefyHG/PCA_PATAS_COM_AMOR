import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useThemeContext } from "../utils/ThemeContext";
import { createPet, getPetById, Pet, updatePet } from "@/app/config/firebase"

// Mock theme context - you can replace with your actual theme

export default function AddPet() {
    const { isDarkTheme, colors } = useThemeContext();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { petId } = route.params || {};
    const isEditing = !!petId;

    console.log("Pet ID:", petId);

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
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentRequirement, setCurrentRequirement] = useState("");
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));

    const isIOS = Platform.OS === "ios";
    const isAndroid = Platform.OS === "android";

    const petTypes = ["dog", "cat", "bird", "rabbit", "other"];
    const genders = ["male", "female", "unknown"];
    const sizes = ["small", "medium", "large", "extra-large"];
    const statuses = ["available", "pending", "adopted"];

    useEffect(() => {
        const loadPetData = async () => {
            if (isEditing && petId) {
                try {
                    const dataPet = await getPetById(petId);
                    if (dataPet) {
                        setPet(dataPet);
                    } else {
                        Alert.alert("Erro", "Não foi possível carregar os dados do pet.");
                    }
                } catch (error) {
                    console.error("Erro ao buscar pet:", error);
                    Alert.alert("Erro", "Erro ao carregar os dados do pet.");
                }
            }
        };

        loadPetData();
    }, [isEditing, petId]);

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
        ]).start();
    }, []);

    const handleInputChange = (field: keyof Pet, value: string | boolean | string[]) => {
        setPet((prevPet) => ({
            ...prevPet,
            [field]: value,
        }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua galeria de fotos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setPet(prevPet => ({
                ...prevPet,
                images: [...prevPet.images, ...newImages].slice(0, 5) // Limit to 5 images
            }));
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...pet.images];
        newImages.splice(index, 1);
        setPet(prevPet => ({
            ...prevPet,
            images: newImages
        }));
    };

    const handleAddRequirement = () => {
        if (currentRequirement.trim()) {
            const updatedRequirements = [...pet.requirements, currentRequirement.trim()];
            setPet((prevPet) => ({
                ...prevPet,
                requirements: updatedRequirements,
            }));
            setCurrentRequirement("");
        }
    };

    const handleRemoveRequirement = (index: number) => {
        const updatedRequirements = pet.requirements.filter((_, i) => i !== index);
        setPet((prevPet) => ({
            ...prevPet,
            requirements: updatedRequirements,
        }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!pet.name || !pet.type || !pet.breed || !pet.description || !pet.location) {
            Alert.alert("Erro de Validação", "Por favor, preencha todos os campos obrigatórios");
            return;
        }

        if (pet.images.length === 0) {
            Alert.alert("Imagem Obrigatória", "Por favor, adicione pelo menos uma imagem do pet");
            return;
        }

        try {
            setIsSubmitting(true);

            // Here you would implement your API call to save/update the pet
            // For now we'll just simulate a successful save
            setTimeout(async () => {
                const addNewPet = await createPet(pet);
                if (addNewPet) {
                    Alert.alert("Sucesso", "Pet salvo com sucesso!");
                    navigation.goBack();
                } else {
                    Alert.alert("Erro", "Houve um erro ao salvar o pet. Tente novamente.");
                }
                setIsSubmitting(false);
            }, 1000);

            if (isEditing) {
                const dataPet = await getPetById(petId);
                if (dataPet) {
                    setPet(dataPet);
                    await updatePet(dataPet.id!, dataPet);
                    Alert.alert("Sucesso", "Pet atualizado com sucesso!");
                    navigation.goBack();
                } else {
                    Alert.alert("Erro", "Houve um erro ao carregar os dados do pet. Tente novamente.");
                }
            }

        } catch (error) {
            console.error("Error saving pet:", error);
            Alert.alert("Erro", "Houve um erro ao salvar o pet. Tente novamente.");
            setIsSubmitting(false);
        }
    };

    const renderSelectButton = (options: string[], currentValue: string, onSelect: (value: string) => void, label: string) => (
        <View style={{ marginBottom: 24 }}>
            <Text
                style={[
                    styles.label,
                    { color: isDarkTheme ? "white" : "#374151" }
                ]}
            >
                {label}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onSelect(option)}
                        style={[
                            styles.selectButton,
                            {
                                backgroundColor: currentValue === option
                                    ? colors.primary
                                    : isDarkTheme ? "#374151" : "white",
                                marginRight: 8,
                            },
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {}
                        ]}
                    >
                        <Text
                            style={{
                                color: currentValue === option ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                                fontWeight: "600",
                                textTransform: "capitalize"
                            }}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderStatusBadges = () => (
        <View style={{ marginBottom: 24 }}>
            <Text
                style={[
                    styles.label,
                    { color: isDarkTheme ? "white" : "#374151" }
                ]}
            >
                Status de Adoção
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {statuses.map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => handleInputChange("status", status)}
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: pet.status === status
                                    ? colors.primary
                                    : isDarkTheme ? "#374151" : "white",
                                flex: 1,
                                marginHorizontal: 4,
                            },
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {}
                        ]}
                    >
                        <Feather
                            name={status === "available" ? "check" : status === "pending" ? "clock" : "heart"}
                            size={16}
                            color={pet.status === status ? "white" : colors.primary}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            style={{
                                color: pet.status === status ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                                fontWeight: "600",
                                textTransform: "capitalize"
                            }}
                        >
                            {status === "available" ? "Disponível" : status === "pending" ? "Pendente" : "Adotado"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

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
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {isEditing ? "Editar Pet" : "Adicionar Pet"}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}
                    >
                        {/* Image Upload Section */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Imagens do Pet
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.imageUploadContainer,
                                    { backgroundColor: isDarkTheme ? "#374151" : "white" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {}
                                ]}
                                onPress={pickImage}
                            >
                                {pet.images.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {pet.images.map((image, index) => (
                                            <View key={index} style={styles.imageContainer}>
                                                <Image source={{ uri: image }} style={styles.image} />
                                                <TouchableOpacity
                                                    style={styles.removeImageButton}
                                                    onPress={() => removeImage(index)}
                                                >
                                                    <Feather name="x" size={16} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        {pet.images.length < 5 && (
                                            <TouchableOpacity style={styles.addMoreImagesButton}>
                                                <Feather name="plus" size={32} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.emptyImageContainer}>
                                        <View style={[styles.imageIcon, { backgroundColor: `${colors.primary}15` }]}>
                                            <Feather name="image" size={32} color={colors.primary} />
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
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Nome do Pet *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
                                    ]}
                                    placeholder="Digite o nome do pet"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.name}
                                    onChangeText={(value) => handleInputChange("name", value)}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Idade *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
                                    ]}
                                    placeholder="ex: 2 anos"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.age}
                                    onChangeText={(value) => handleInputChange("age", value)}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Raça *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
                                    ]}
                                    placeholder="ex: Labrador Retriever"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.breed}
                                    onChangeText={(value) => handleInputChange("breed", value)}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Cor
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
                                    ]}
                                    placeholder="ex: Marrom e Branco"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.color}
                                    onChangeText={(value) => handleInputChange("color", value)}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Localização *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
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
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Descrição
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Descrição *
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
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
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    História
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
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
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
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
                                    <Feather name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </View>

                            {pet.requirements.length > 0 ? (
                                <View style={styles.requirementsList}>
                                    {pet.requirements.map((requirement, index) => (
                                        <View key={index} style={[styles.requirementItem, { backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6" }]}>
                                            <Text style={[styles.requirementText, { color: isDarkTheme ? "white" : "#374151" }]}>
                                                {requirement}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveRequirement(index)}
                                            >
                                                <Feather name="trash-2" size={16} color="#EF4444" />
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
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Saúde e Medicina
                            </Text>

                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Vacinado
                                </Text>
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
                                                color: isDarkTheme ? "white" : "#374151"
                                            }
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
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
                                    ]}
                                    placeholder="Número de telefone"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={pet.contactPhone || ""}
                                    onChangeText={(value) => handleInputChange("contactPhone", value)}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>
                                    Email de Contato
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151"
                                        }
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
                                    opacity: isSubmitting ? 0.7 : 1
                                }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View style={styles.submitButtonContent}>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text style={styles.submitButtonText}>
                                        {isEditing ? "Atualizando..." : "Salvando..."}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.submitButtonContent}>
                                    <Feather name="save" size={20} color="white" />
                                    <Text style={styles.submitButtonText}>
                                        {isEditing ? "Atualizar Pet" : "Salvar Pet"}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 64,
        paddingBottom: 32,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    textInput: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    textArea: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: 100,
    },
    selectButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    imageUploadContainer: {
        height: 224,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    emptyImageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    imageIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    imageUploadText: {
        fontSize: 16,
    },
    imageContainer: {
        position: "relative",
        marginRight: 8,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    addMoreImagesButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
        alignItems: "center",
        justifyContent: "center",
    },
    requirementInputContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    requirementInput: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginRight: 8,
    },
    addRequirementButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
        borderRadius: 8,
        marginBottom: 8,
    },
    requirementText: {
        flex: 1,
        fontSize: 14,
    },
    noRequirementsText: {
        fontSize: 14,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 8,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    submitButton: {
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    submitButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    androidShadow: {
        elevation: 3,
    },
});
