"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useOng } from "@/app/presentation/contexts/OngContext"
import { useNavigation } from "@react-navigation/native"

interface ProfileSwitcherProps {
    showLabel?: boolean
    size?: "small" | "medium" | "large"
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ showLabel = true, size = "medium" }) => {
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()
    const { userOngs, activeOng, isOngMode, switchToOng, switchToPersonal, getCurrentProfile } = useOng()
    const navigation = useNavigation<any>()
    const [modalVisible, setModalVisible] = useState(false)

    const currentProfile = getCurrentProfile()

    const handleCreateOng = () => {
        setModalVisible(false)
        navigation.navigate("RegisterOng" as never)
    }

    const handleSwitchProfile = (type: "user" | "ong", ong?: any) => {
        if (type === "user") {
            switchToPersonal()
        } else if (ong) {
            switchToOng(ong)
        }
        setModalVisible(false)
    }

    const getAvatarSize = () => {
        switch (size) {
            case "small":
                return 32
            case "medium":
                return 40
            case "large":
                return 48
            default:
                return 40
        }
    }

    const getFontSize = () => {
        switch (size) {
            case "small":
                return 12
            case "medium":
                return 14
            case "large":
                return 16
            default:
                return 14
        }
    }

    const renderProfileItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.profileItem,
                {
                    backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                    borderColor: item.isActive ? colors.primary : "transparent",
                },
            ]}
            onPress={() => handleSwitchProfile(item.type, item.ong)}
        >
            <View style={styles.profileItemLeft}>
                {item.photoURL ? (
                    <Image source={{ uri: item.photoURL }} style={styles.profileAvatar} />
                ) : (
                    <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Feather name={item.type === "ong" ? "heart" : "user"} size={20} color="#FFFFFF" />
                    </View>
                )}
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>{item.name}</Text>
                    <Text style={[styles.profileType, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                        {item.type === "ong" ? "Organização" : "Pessoal"}
                    </Text>
                </View>
            </View>
            {item.isActive && <Feather name="check-circle" size={20} color={colors.primary} />}
        </TouchableOpacity>
    )

    const profileOptions = [
        {
            id: "user",
            name: user?.displayName || user?.email?.split("@")[0] || "Usuário",
            photoURL: user?.photoURL,
            type: "user",
            isActive: !isOngMode,
        },
        ...userOngs.map((ong) => ({
            id: ong.id,
            name: ong.name,
            photoURL: ong.logoUrl,
            type: "ong",
            ong,
            isActive: isOngMode && activeOng?.id === ong.id,
        })),
    ]

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
        },
        profileButton: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
        },
        avatar: {
            width: getAvatarSize(),
            height: getAvatarSize(),
            borderRadius: getAvatarSize() / 2,
            marginRight: showLabel ? 8 : 0,
        },
        avatarPlaceholder: {
            width: getAvatarSize(),
            height: getAvatarSize(),
            borderRadius: getAvatarSize() / 2,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            marginRight: showLabel ? 8 : 0,
        },
        profileText: {
            fontSize: getFontSize(),
            fontWeight: "500",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginRight: 4,
        },
        badge: {
            position: "absolute",
            bottom: -2,
            right: showLabel ? 20 : -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: isDarkTheme ? "#111827" : "#FFFFFF",
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalContent: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            width: "90%",
            maxWidth: 400,
            maxHeight: "80%",
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
        },
        closeButton: {
            padding: 4,
        },
        profileItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 2,
        },
        profileItemLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        profileAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        profileAvatarPlaceholder: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
        },
        profileInfo: {
            flex: 1,
        },
        profileName: {
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 2,
        },
        profileType: {
            fontSize: 12,
        },
        createOngButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.primary,
            marginTop: 12,
        },
        createOngButtonText: {
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "500",
            marginLeft: 8,
        },
    })

    return (
        <>
            <TouchableOpacity style={styles.container} onPress={() => setModalVisible(true)}>
                <View style={styles.profileButton}>
                    {currentProfile.photoURL ? (
                        <Image source={{ uri: currentProfile.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Feather
                                name={currentProfile.type === "ong" ? "heart" : "user"}
                                size={getAvatarSize() * 0.5}
                                color="#FFFFFF"
                            />
                        </View>
                    )}
                    {showLabel && (
                        <>
                            <Text style={styles.profileText} numberOfLines={1}>
                                {currentProfile.name}
                            </Text>
                            <Feather name="chevron-down" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                        </>
                    )}
                    {isOngMode && (
                        <View style={styles.badge}>
                            <Feather name="heart" size={8} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => { }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Alternar Perfil</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={profileOptions}
                            renderItem={renderProfileItem}
                            keyExtractor={(item) => item.id || ""}
                            showsVerticalScrollIndicator={false}
                        />

                        <TouchableOpacity style={styles.createOngButton} onPress={handleCreateOng}>
                            <Feather name="plus" size={16} color="#FFFFFF" />
                            <Text style={styles.createOngButtonText}>Criar Nova Organização</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    )
}

export default ProfileSwitcher
