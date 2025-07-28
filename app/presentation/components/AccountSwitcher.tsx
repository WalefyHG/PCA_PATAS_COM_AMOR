"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useAccount } from "../contexts/AccountContext"
import { useThemeContext } from "../contexts/ThemeContext"
import type { AccountProfile } from "@/app/domain/entities/Account"

export default function AccountSwitcher() {
    const { currentAccount, availableAccounts, switchAccount } = useAccount()
    const { isDarkTheme, colors } = useThemeContext()
    const [isModalVisible, setIsModalVisible] = useState(false)

    const getAccountIcon = (type: string) => {
        switch (type) {
            case "user":
                return "user"
            case "ong":
                return "heart"
            case "clinic":
                return "activity"
            default:
                return "user"
        }
    }

    const getAccountTypeLabel = (type: string) => {
        switch (type) {
            case "user":
                return "Pessoal"
            case "ong":
                return "ONG"
            case "clinic":
                return "Clínica"
            default:
                return "Conta"
        }
    }

    const handleAccountSwitch = (account: AccountProfile) => {
        switchAccount(account)
        setIsModalVisible(false)
    }

    if (availableAccounts.length <= 1) {
        return null // Não mostrar se há apenas uma conta
    }

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.switcherButton,
                    {
                        backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                        borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                    },
                ]}
                onPress={() => setIsModalVisible(true)}
            >
                <View style={styles.currentAccountInfo}>
                    {currentAccount.profileImage ? (
                        <Image source={{ uri: currentAccount.profileImage }} style={styles.accountImage} />
                    ) : (
                        <View style={[styles.accountIcon, { backgroundColor: colors.primary }]}>
                            <Feather name={getAccountIcon(currentAccount.type) as any} size={16} color="white" />
                        </View>
                    )}
                    <View style={styles.accountDetails}>
                        <Text style={[styles.accountName, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]} numberOfLines={1}>
                            {currentAccount.profileName}
                        </Text>
                        <Text style={[styles.accountType, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                            {getAccountTypeLabel(currentAccount.type)}
                        </Text>
                    </View>
                </View>
                <Feather name="chevron-down" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>

            <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>Trocar Conta</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                                <Feather name="x" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.accountsList}>
                            {availableAccounts.map((account) => (
                                <TouchableOpacity
                                    key={account.id}
                                    style={[
                                        styles.accountItem,
                                        {
                                            backgroundColor:
                                                account.id === currentAccount.id ? (isDarkTheme ? "#374151" : "#F3F4F6") : "transparent",
                                            borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
                                        },
                                    ]}
                                    onPress={() => handleAccountSwitch(account)}
                                >
                                    <View style={styles.accountItemContent}>
                                        {account.profileImage ? (
                                            <Image source={{ uri: account.profileImage }} style={styles.accountItemImage} />
                                        ) : (
                                            <View style={[styles.accountItemIcon, { backgroundColor: colors.primary }]}>
                                                <Feather name={getAccountIcon(account.type) as any} size={20} color="white" />
                                            </View>
                                        )}
                                        <View style={styles.accountItemDetails}>
                                            <Text style={[styles.accountItemName, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>
                                                {account.profileName}
                                            </Text>
                                            <Text style={[styles.accountItemType, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                                {getAccountTypeLabel(account.type)}
                                            </Text>
                                        </View>
                                    </View>
                                    {account.id === currentAccount.id && <Feather name="check" size={16} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    switcherButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    currentAccountInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    accountImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    accountIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    accountDetails: {
        flex: 1,
    },
    accountName: {
        fontSize: 14,
        fontWeight: "600",
    },
    accountType: {
        fontSize: 12,
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 16,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    accountsList: {
        maxHeight: 300,
    },
    accountItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    accountItemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    accountItemImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    accountItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    accountItemDetails: {
        flex: 1,
    },
    accountItemName: {
        fontSize: 16,
        fontWeight: "600",
    },
    accountItemType: {
        fontSize: 14,
        marginTop: 2,
    },
})
