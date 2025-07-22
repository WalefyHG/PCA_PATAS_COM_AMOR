"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"

interface PickerItem {
    label: string
    value: string
    description?: string
}

interface CustomPickerProps {
    items: PickerItem[]
    selectedValue: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    searchable?: boolean
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
    items,
    selectedValue,
    onValueChange,
    placeholder = "Selecione uma opção",
    disabled = false,
    searchable = false,
}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [searchText, setSearchText] = useState("")
    const { isDarkTheme, colors } = useThemeContext()

    const selectedItem = items.find((item) => item.value === selectedValue)

    const filteredItems = searchable
        ? items.filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase()))
        : items

    const handleSelect = (value: string) => {
        onValueChange(value)
        setModalVisible(false)
        setSearchText("")
    }

    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        picker: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderWidth: 2,
            borderColor: selectedValue ? colors.primary : isDarkTheme ? "#374151" : "#E5E7EB",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 56,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        },
        pickerDisabled: {
            opacity: 0.6,
        },
        pickerText: {
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            flex: 1,
            fontWeight: "500",
        },
        placeholderText: {
            fontSize: 16,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            flex: 1,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderRadius: 20,
            padding: 0,
            width: "90%",
            maxHeight: "80%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        modalHeader: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            textAlign: "center",
            marginBottom: 16,
        },
        searchContainer: {
            backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB",
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        searchInput: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
        },
        listContainer: {
            maxHeight: 400,
        },
        item: {
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDarkTheme ? "#374151" : "#F3F4F6",
        },
        itemContent: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        itemText: {
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            flex: 1,
        },
        itemDescription: {
            fontSize: 14,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            marginTop: 4,
            lineHeight: 18,
        },
        selectedItem: {
            backgroundColor: isDarkTheme ? "#374151" : "#F0F9FF",
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
        },
        selectedItemText: {
            color: colors.primary,
            fontWeight: "600",
        },
        checkIcon: {
            marginLeft: 12,
        },
        closeButtonContainer: {
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        closeButton: {
            backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
        },
        closeButtonText: {
            fontSize: 16,
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            fontWeight: "600",
        },
        emptyState: {
            padding: 40,
            alignItems: "center",
        },
        emptyStateText: {
            fontSize: 16,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            marginTop: 12,
        },
    })

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.picker, disabled && styles.pickerDisabled]}
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1 }}>
                    <Text style={selectedItem ? styles.pickerText : styles.placeholderText}>
                        {selectedItem ? selectedItem.label : placeholder}
                    </Text>
                    {selectedItem?.description && (
                        <Text
                            style={{
                                fontSize: 14,
                                color: isDarkTheme ? "#9CA3AF" : "#6B7280",
                                marginTop: 2,
                            }}
                            numberOfLines={1}
                        >
                            {selectedItem.description}
                        </Text>
                    )}
                </View>
                <Feather
                    name="chevron-down"
                    size={20}
                    color={selectedValue ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecione uma ONG</Text>

                            {searchable && (
                                <View style={styles.searchContainer}>
                                    <Feather name="search" size={18} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar ONGs..."
                                        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                    />
                                    {searchText.length > 0 && (
                                        <TouchableOpacity onPress={() => setSearchText("")}>
                                            <Feather name="x" size={18} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.listContainer}>
                            {filteredItems.length > 0 ? (
                                <FlatList
                                    data={filteredItems}
                                    keyExtractor={(item) => item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.item, item.value === selectedValue && styles.selectedItem]}
                                            onPress={() => handleSelect(item.value)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.itemContent}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.itemText, item.value === selectedValue && styles.selectedItemText]}>
                                                        {item.label}
                                                    </Text>
                                                    {item.description && (
                                                        <Text style={styles.itemDescription} numberOfLines={2}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                {item.value === selectedValue && (
                                                    <Feather name="check" size={20} color={colors.primary} style={styles.checkIcon} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Feather name="search" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                    <Text style={styles.emptyStateText}>
                                        {searchText ? `Nenhuma ONG encontrada para "${searchText}"` : "Nenhuma ONG disponível"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                                <Text style={styles.closeButtonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
