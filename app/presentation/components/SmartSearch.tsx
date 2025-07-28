"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Platform,
    Dimensions,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"

const { width } = Dimensions.get("window")
const isSmallScreen = width < 380

interface SmartSearchProps {
    onSearch: (query: string, filters: SearchFilters) => void
    placeholder?: string
    showFilters?: boolean
}

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

export default function SmartSearch({
    onSearch,
    placeholder = "Buscar pets...",
    showFilters = true,
}: SmartSearchProps) {
    const { isDarkTheme, colors } = useThemeContext()
    const [query, setQuery] = useState("")
    const [filters, setFilters] = useState<SearchFilters>({})
    const [showFilterPanel, setShowFilterPanel] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])

    const filterPanelAnim = useRef(new Animated.Value(0)).current
    const searchInputRef = useRef<TextInput>(null)

    const petTypes = ["dog", "cat", "bird", "rabbit", "other"]
    const sizes = ["small", "medium", "large", "extra-large"]
    const ageRanges = ["Filhote (0-1 ano)", "Jovem (1-3 anos)", "Adulto (3-7 anos)", "Idoso (7+ anos)"]

    const searchSuggestions = [
        "Cães pequenos",
        "Gatos castrados",
        "Pets vacinados",
        "Filhotes disponíveis",
        "Pets com necessidades especiais",
        "Adoção próxima a mim",
    ]

    useEffect(() => {
        // Load recent searches from storage
        // In a real app, you'd load from AsyncStorage
        setRecentSearches(["Labrador", "Gato persa", "Filhote"])
    }, [])

    useEffect(() => {
        // Update suggestions based on query
        if (query.length > 0) {
            const filtered = searchSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
            setSuggestions(filtered)
        } else {
            setSuggestions([])
        }
    }, [query])

    const toggleFilterPanel = () => {
        const toValue = showFilterPanel ? 0 : 1
        setShowFilterPanel(!showFilterPanel)

        Animated.spring(filterPanelAnim, {
            toValue,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
        }).start()
    }

    const handleSearch = () => {
        if (query.trim()) {
            // Add to recent searches
            const newRecentSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
            setRecentSearches(newRecentSearches)

            onSearch(query, filters)
            searchInputRef.current?.blur()
        }
    }

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onSearch(query, newFilters)
    }

    const clearFilters = () => {
        setFilters({})
        onSearch(query, {})
    }

    const getActiveFiltersCount = () => {
        return Object.values(filters).filter((value) => value !== undefined && value !== "" && value !== null).length
    }

    const renderFilterChip = (label: string, value: string, isActive: boolean, onPress: () => void) => (
        <TouchableOpacity
            key={value}
            style={[
                styles.filterChip,
                {
                    backgroundColor: isActive ? colors.primary : isDarkTheme ? "#374151" : "white",
                    borderColor: isActive ? colors.primary : isDarkTheme ? "#4B5563" : "#E5E7EB",
                },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.filterChipText,
                    {
                        color: isActive ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    )

    const renderBooleanFilter = (label: string, key: keyof SearchFilters) => (
        <View style={styles.booleanFilter}>
            <Text style={[styles.filterLabel, { color: isDarkTheme ? "white" : "#374151" }]}>{label}</Text>
            <View style={styles.booleanOptions}>
                {renderFilterChip("Sim", "true", filters[key] === true, () =>
                    handleFilterChange(key, filters[key] === true ? undefined : true),
                )}
                {renderFilterChip("Não", "false", filters[key] === false, () =>
                    handleFilterChange(key, filters[key] === false ? undefined : false),
                )}
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: isDarkTheme ? "#374151" : "white" }]}>
                <Feather name="search" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                <TextInput
                    ref={searchInputRef}
                    style={[styles.searchInput, { color: isDarkTheme ? "white" : "#374151" }]}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />

                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
                        <Feather name="x" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                    </TouchableOpacity>
                )}

                {showFilters && (
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: getActiveFiltersCount() > 0 ? colors.primary : "transparent",
                            },
                        ]}
                        onPress={toggleFilterPanel}
                    >
                        <Feather name="filter" size={18} color={getActiveFiltersCount() > 0 ? "white" : colors.primary} />
                        {getActiveFiltersCount() > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Suggestions */}
            {(suggestions.length > 0 || recentSearches.length > 0) && query.length === 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: isDarkTheme ? "#374151" : "white" }]}>
                    {recentSearches.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={[styles.suggestionTitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                Buscas recentes
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.suggestionChip, { backgroundColor: isDarkTheme ? "#4B5563" : "#F3F4F6" }]}
                                        onPress={() => {
                                            setQuery(search)
                                            onSearch(search, filters)
                                        }}
                                    >
                                        <Feather name="clock" size={12} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                        <Text style={[styles.suggestionText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                                            {search}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            )}

            {/* Filter Panel */}
            {showFilters && (
                <Animated.View
                    style={[
                        styles.filterPanel,
                        {
                            backgroundColor: isDarkTheme ? "#1F2937" : "white",
                            maxHeight: filterPanelAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 400],
                            }),
                            opacity: filterPanelAnim,
                        },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.filterHeader}>
                            <Text style={[styles.filterTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Filtros de Busca</Text>
                            {getActiveFiltersCount() > 0 && (
                                <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
                                    <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Limpar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Type Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Tipo de Pet</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.filterChips}>
                                    {petTypes.map((type) =>
                                        renderFilterChip(
                                            type === "dog"
                                                ? "Cão"
                                                : type === "cat"
                                                    ? "Gato"
                                                    : type === "bird"
                                                        ? "Pássaro"
                                                        : type === "rabbit"
                                                            ? "Coelho"
                                                            : "Outro",
                                            type,
                                            filters.type === type,
                                            () => handleFilterChange("type", filters.type === type ? undefined : type),
                                        ),
                                    )}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Size Filter */}
                        <View style={styles.filterGroup}>
                            <Text style={[styles.filterLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Porte</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.filterChips}>
                                    {sizes.map((size) =>
                                        renderFilterChip(
                                            size === "small"
                                                ? "Pequeno"
                                                : size === "medium"
                                                    ? "Médio"
                                                    : size === "large"
                                                        ? "Grande"
                                                        : "Extra Grande",
                                            size,
                                            filters.size === size,
                                            () => handleFilterChange("size", filters.size === size ? undefined : size),
                                        ),
                                    )}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Boolean Filters */}
                        {renderBooleanFilter("Vacinado", "vaccinated")}
                        {renderBooleanFilter("Castrado", "neutered")}
                        {renderBooleanFilter("Necessidades Especiais", "specialNeeds")}
                    </ScrollView>
                </Animated.View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    clearButton: {
        padding: 4,
    },
    filterButton: {
        position: "relative",
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    filterBadgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    suggestionsContainer: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
    },
    suggestionSection: {
        marginBottom: 12,
    },
    suggestionTitle: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    suggestionChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        gap: 6,
    },
    suggestionText: {
        fontSize: 13,
    },
    filterPanel: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    clearFiltersButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    clearFiltersText: {
        fontSize: 14,
        fontWeight: "600",
    },
    filterGroup: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    filterChips: {
        flexDirection: "row",
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "500",
    },
    booleanFilter: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    booleanOptions: {
        flexDirection: "row",
        gap: 8,
    },
})
