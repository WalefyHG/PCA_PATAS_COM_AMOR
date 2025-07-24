"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useOng } from "@/app/presentation/contexts/OngContext"
import HeaderLayout from "@/app/utils/HeaderLayout"

interface NavBarProps {
    title: string
    showBackButton?: boolean
    onBackPress?: () => void
    rightComponent?: React.ReactNode
    showProfileSwitcher?: boolean
}

const NavBar: React.FC<NavBarProps> = ({
    title,
    showBackButton = false,
    onBackPress,
    rightComponent,
    showProfileSwitcher = true,
}) => {
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()
    const { isOngMode, activeOng } = useOng()

    const styles = StyleSheet.create({
        container: {
            paddingTop: 50,
            paddingBottom: 16,
            paddingHorizontal: 20,
        },
        content: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        leftSection: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
        },
        titleSection: {
            flex: 1,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFFFFF",
        },
        subtitle: {
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: 2,
        },
        rightSection: {
            flexDirection: "row",
            alignItems: "center",
        },
        modeIndicator: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginRight: 12,
        },
        modeText: {
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "500",
            marginLeft: 4,
        },
    })

    return (
        <LinearGradient
            colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    {showBackButton && (
                        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                            <Feather name="arrow-left" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>{title}</Text>
                        {isOngMode && activeOng && <Text style={styles.subtitle}>Gerenciando como {activeOng.name}</Text>}
                    </View>
                </View>

                <View style={styles.rightSection}>
                    {isOngMode && (
                        <View style={styles.modeIndicator}>
                            <Feather name="heart" size={12} color="#FFFFFF" />
                            <Text style={styles.modeText}>ONG</Text>
                        </View>
                    )}

                    {showProfileSwitcher && <HeaderLayout size="small" />}

                    {rightComponent}
                </View>
            </View>
        </LinearGradient>
    )
}

export default NavBar
