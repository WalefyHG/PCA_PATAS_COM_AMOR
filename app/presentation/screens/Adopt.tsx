"use client"

import { useState, useCallback } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    Platform,
    Alert,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAccount } from "../contexts/AccountContext"
import { getPets, type Pet } from "../../repositories/FirebasePetRepository"
import SmartSearch from "../components/SmartSearch"
import FavoriteButton from "../components/FavoriteButton"

const { width } = Dimensions.get("window")
const isSmallScreen = width < 380
const isMediumScreen = width >= 380 && width < 768
const isLargeScreen = width >= 768

interface SearchFilters {
    type?: string
    size?: string
    age?: string
    location?: string
    status?: string
    vaccinated?: boolean
    neutered?: boolean
    specialNeeds?: boolean
}

export default function EnhancedAdopt() {
    const { isDarkTheme, colors } = useThemeContext()
    const { currentAccount } = useAccount()
    const navigation = useNavigation<any>()

    const [pets, setPets] = useState<Pet[]>([])
    const [filteredPets, setFilteredPets] = useState<Pet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilters, setActiveFilters] = useState<SearchFilters>({})

    const loadPets = async () => {
        try {
            const petsData = await getPets()
            setPets(petsData)
            setFilteredPets(petsData)
        } catch (error) {
            console.error("Erro ao carregar pets:", error)
            Alert.alert("Erro", "Não foi possível carregar os pets.")
        } finally {
            setIsLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadPets()
        setRefreshing(false)
    }

    useFocusEffect(
        useCallback(() => {
            loadPets()
        }, []),
    )

    const handleSearch = (query: string, filters: SearchFilters) => {
        setSearchQuery(query)
        setActiveFilters(filters)

        let filtered = pets

        // Text search
        if (query.trim()) {
            filtered = filtered.filter(
                (pet) =>
                    pet.name.toLowerCase().includes(query.toLowerCase()) ||
                    pet.breed.toLowerCase().includes(query.toLowerCase()) ||
                    pet.description.toLowerCase().includes(query.toLowerCase()) ||
                    pet.location.toLowerCase().includes(query.toLowerCase()),
            )
        }

        // Apply filters
        if (filters.type) {
            filtered = filtered.filter((pet) => pet.type === filters.type)
        }
        if (filters.size) {
            filtered = filtered.filter((pet) => pet.size === filters.size)
        }
        if (filters.status) {
            filtered = filtered.filter((pet) => pet.status === filters.status)
        }
        if (filters.vaccinated !== undefined) {
            filtered = filtered.filter((pet) => pet.vaccinated === filters.vaccinated)
        }
        if (filters.neutered !== undefined) {
            filtered = filtered.filter((pet) => pet.neutered === filters.neutered)
        }
        if (filters.specialNeeds !== undefined) {
            filtered = filtered.filter((pet) => pet.specialNeeds === filters.specialNeeds)
        }

        setFilteredPets(filtered)
    }

    const getTypeDisplayName = (type: string) => {
        const names = {
            dog: "🐕 Cão",
            cat: "🐱 Gato",
            bird: "🐦 Pássaro",
            rabbit: "🐰 Coelho",
            other: "🐾 Outro",
        }
        return names[type as keyof typeof names] || type
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "#10B981"
            case "pending":
                return "#F59E0B"
            case "adopted":
                return "#EF4444"
            default:
                return colors.primary
        }
    }

    const renderPetCard = (pet: Pet) => (
        <TouchableOpacity
            key={pet.id}
            style={[
                styles.petCard,
                {
                    backgroundColor: isDarkTheme ? "#1F2937" : "white",
                    width: isLargeScreen ? "48%" : isMediumScreen ? "48%" : "100%",
                },
            ]}
            onPress={() => navigation.navigate("AdoptionDetails", { petId: pet.id })}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: pet.images[0] || "/placeholder.svg?height=200&width=300" }} style={styles.petImage} />

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.status) }]}>
                    <Text style={styles.statusText}>
                        {pet.status === "available" ? "Disponível" : pet.status === "pending" ? "Pendente" : "Adotado"}
                    </Text>
                </View>

                {/* Favorite Button */}
                <View style={styles.favoriteButton}>
                    <FavoriteButton petId={pet.id!} petType={pet.type} petName={pet.name} />
                </View>

                {/* Image Count */}
                {pet.images.length > 1 && (
                    <View style={styles.imageCount}>
                        <Feather name="image" size={12} color="white" />
                        <Text style={styles.imageCountText}>{pet.images.length}</Text>
                    </View>
                )}
            </View>

            <View style={styles.petInfo}>
                <View style={styles.petHeader}>
                    <Text style={[styles.petName, { color: isDarkTheme ? "white" : "#374151" }]}>{pet.name}</Text>
                    <Text style={[styles.petAge, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>{pet.age}</Text>
                </View>

                <View style={styles.petDetails}>
                    <Text style={[styles.petBreed, { color: colors.primary }]}>
                        {getTypeDisplayName(pet.type)} • {pet.breed}
                    </Text>
                    <Text style={[styles.petSize, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                        Porte {getSizeDisplayName(pet.size)}
                    </Text>
                </View>

                <Text style={[styles.petDescription, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]} numberOfLines={2}>
                    {pet.description}
                </Text>

                <View style={styles.petLocation}>
                    <Feather name="map-pin" size={14} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                    <Text style={[styles.locationText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]} numberOfLines={1}>
                        {pet.location}
                    </Text>
                </View>

                {/* Health Info */}
                <View style={styles.healthInfo}>
                    {pet.vaccinated && (
                        <View style={[styles.healthBadge, { backgroundColor: "#10B981" }]}>
                            <Feather name="shield" size={10} color="white" />
                            <Text style={styles.healthBadgeText}>Vacinado</Text>
                        </View>
                    )}
                    {pet.neutered && (
                        <View style={[styles.healthBadge, { backgroundColor: "#3B82F6" }]}>
                            <Feather name="heart" size={10} color="white" />
                            <Text style={styles.healthBadgeText}>Castrado</Text>
                        </View>
                    )}
                    {pet.specialNeeds && (
                        <View style={[styles.healthBadge, { backgroundColor: "#F59E0B" }]}>
                            <Feather name="star" size={10} color="white" />
                            <Text style={styles.healthBadgeText}>Especial</Text>
                        </View>
                    )}
                </View>

                {/* Creator Info */}
                <View style={styles.creatorInfo}>
                    <View style={[styles.creatorAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.creatorInitial}>{pet.createdByName?.charAt(0).toUpperCase() || "?"}</Text>
                    </View>
                    <Text style={[styles.creatorName, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                        Por {pet.createdByName || "Usuário"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Feather name="search" size={64} color={isDarkTheme ? "#4B5563" : "#D1D5DB"} />
            <Text style={[styles.emptyTitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                {searchQuery || Object.keys(activeFilters).length > 0 ? "Nenhum pet encontrado" : "Nenhum pet disponível"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDarkTheme ? "#6B7280" : "#9CA3AF" }]}>
                {searchQuery || Object.keys(activeFilters).length > 0
                    ? "Tente ajustar sua busca ou filtros"
                    : "Seja o primeiro a cadastrar um pet!"}
            </Text>
            {!searchQuery && Object.keys(activeFilters).length === 0 && (
                <TouchableOpacity
                    style={[styles.addFirstPetButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("AddPet")}
                >
                    <Feather name="plus" size={20} color="white" />
                    <Text style={styles.addFirstPetText}>Cadastrar Pet</Text>
                </TouchableOpacity>
            )}
        </View>
    )

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: isDarkTheme ? "white" : "#374151" }]}>Carregando pets...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
            {/* Enhanced Header */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Adoção</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredPets.length} {filteredPets.length === 1 ? "pet disponível" : "pets disponíveis"}
                        </Text>
                    </View>

                    {currentAccount && (
                        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddPet")}>
                            <Feather name="plus" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Smart Search */}
                <View style={styles.searchContainer}>
                    <SmartSearch
                        onSearch={handleSearch}
                        placeholder="Buscar pets por nome, raça, localização..."
                        showFilters={true}
                    />
                </View>

                {/* Results */}
                {filteredPets.length > 0 ? (
                    <View
                        style={[
                            styles.petsGrid,
                            {
                                flexDirection: isLargeScreen || isMediumScreen ? "row" : "column",
                                flexWrap: isLargeScreen || isMediumScreen ? "wrap" : "nowrap",
                                justifyContent: isLargeScreen || isMediumScreen ? "space-between" : "flex-start",
                            },
                        ]}
                    >
                        {filteredPets.map(renderPetCard)}
                    </View>
                ) : (
                    renderEmptyState()
                )}
            </ScrollView>
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "500",
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 64 : Platform.OS === "android" ? 48 : 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        color: "white",
        fontSize: 24,
        fontWeight: "700",
    },
    headerSubtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        marginTop: 2,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    petsGrid: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 16,
    },
    petCard: {
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    imageContainer: {
        position: "relative",
        height: 200,
    },
    petImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    statusBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "white",
        fontSize: 11,
        fontWeight: "600",
    },
    favoriteButton: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    imageCount: {
        position: "absolute",
        bottom: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    imageCountText: {
        color: "white",
        fontSize: 11,
        fontWeight: "600",
    },
    petInfo: {
        padding: 16,
    },
    petHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    petName: {
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
    },
    petAge: {
        fontSize: 14,
        fontWeight: "500",
    },
    petDetails: {
        marginBottom: 8,
    },
    petBreed: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    petSize: {
        fontSize: 12,
        fontWeight: "500",
    },
    petDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    petLocation: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 6,
    },
    locationText: {
        fontSize: 12,
        flex: 1,
    },
    healthInfo: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 12,
    },
    healthBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    healthBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    creatorInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    creatorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    creatorInitial: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    creatorName: {
        fontSize: 12,
        fontWeight: "500",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    addFirstPetButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    addFirstPetText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
})
