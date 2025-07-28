"use client"

import React from "react"
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"

interface ErrorModalProps {
    visible: boolean
    title?: string
    message: string
    onClose: () => void
    type?: "error" | "success" | "warning" | "info"
    confirmText?: string
    showIcon?: boolean
}

const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isTablet = width >= 768

export const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    title,
    message,
    onClose,
    type = "error",
    confirmText = "OK",
    showIcon = true,
}) => {
    const { isDarkTheme, colors } = useThemeContext()
    const [scaleAnim] = React.useState(new Animated.Value(0))
    const [opacityAnim] = React.useState(new Animated.Value(0))

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [visible])

    const getTypeConfig = () => {
        switch (type) {
            case "success":
                return {
                    icon: "check-circle",
                    color: "#10B981",
                    gradientColors: ["#10B981", "#059669"],
                    backgroundColor: "#D1FAE5",
                    borderColor: "#10B981",
                }
            case "warning":
                return {
                    icon: "alert-triangle",
                    color: "#F59E0B",
                    gradientColors: ["#F59E0B", "#D97706"],
                    backgroundColor: "#FEF3C7",
                    borderColor: "#F59E0B",
                }
            case "info":
                return {
                    icon: "info",
                    color: "#3B82F6",
                    gradientColors: ["#3B82F6", "#2563EB"],
                    backgroundColor: "#DBEAFE",
                    borderColor: "#3B82F6",
                }
            default: // error
                return {
                    icon: "alert-circle",
                    color: "#EF4444",
                    gradientColors: ["#EF4444", "#DC2626"],
                    backgroundColor: "#FEE2E2",
                    borderColor: "#EF4444",
                }
        }
    }

    const typeConfig = getTypeConfig()

    const getDefaultTitle = () => {
        switch (type) {
            case "success":
                return "Sucesso"
            case "warning":
                return "Atenção"
            case "info":
                return "Informação"
            default:
                return "Erro"
        }
    }

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: isSmallScreen ? 16 : 20,
        },
        modalContainer: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderRadius: isTablet ? 20 : 16,
            width: "100%",
            maxWidth: isTablet ? 400 : 320,
            maxHeight: height * 0.8,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                },
                android: {
                    elevation: 15,
                },
                web: {
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                },
            }),
        },
        header: {
            alignItems: "center",
            paddingTop: isTablet ? 32 : 24,
            paddingHorizontal: isTablet ? 24 : 20,
            paddingBottom: isTablet ? 20 : 16,
        },
        iconContainer: {
            width: isTablet ? 80 : 64,
            height: isTablet ? 80 : 64,
            borderRadius: isTablet ? 40 : 32,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isTablet ? 20 : 16,
            backgroundColor: typeConfig.backgroundColor,
            borderWidth: 2,
            borderColor: typeConfig.borderColor,
        },
        title: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: "700",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            textAlign: "center",
            marginBottom: isTablet ? 12 : 8,
            ...Platform.select({
                ios: { fontFamily: "System" },
                android: { fontFamily: "Roboto" },
            }),
        },
        content: {
            paddingHorizontal: isTablet ? 24 : 20,
            paddingBottom: isTablet ? 24 : 20,
        },
        message: {
            fontSize: isTablet ? 16 : 14,
            lineHeight: isTablet ? 24 : 20,
            color: isDarkTheme ? "#D1D5DB" : "#6B7280",
            textAlign: "center",
            marginBottom: isTablet ? 24 : 20,
            ...Platform.select({
                ios: { fontFamily: "System" },
                android: { fontFamily: "Roboto" },
            }),
        },
        buttonContainer: {
            paddingHorizontal: isTablet ? 24 : 20,
            paddingBottom: isTablet ? 24 : 20,
        },
        button: {
            borderRadius: isTablet ? 14 : 12,
            overflow: "hidden",
            ...Platform.select({
                ios: {
                    shadowColor: typeConfig.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                },
                android: {
                    elevation: 6,
                },
                web: {
                    boxShadow: `0 4px 14px 0 ${typeConfig.color}40`,
                },
            }),
        },
        buttonGradient: {
            paddingVertical: isTablet ? 16 : 14,
            paddingHorizontal: isTablet ? 24 : 20,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonText: {
            color: "#FFFFFF",
            fontSize: isTablet ? 18 : 16,
            fontWeight: "600",
            ...Platform.select({
                ios: { fontFamily: "System" },
                android: { fontFamily: "Roboto" },
            }),
        },
        closeButton: {
            position: "absolute",
            top: isTablet ? 16 : 12,
            right: isTablet ? 16 : 12,
            width: isTablet ? 36 : 32,
            height: isTablet ? 36 : 32,
            borderRadius: isTablet ? 18 : 16,
            backgroundColor: isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            alignItems: "center",
            justifyContent: "center",
        },
    })

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Feather
                            name="x"
                            size={isTablet ? 20 : 18}
                            color={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                        />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        {showIcon && (
                            <View style={styles.iconContainer}>
                                <Feather
                                    name={typeConfig.icon as any}
                                    size={isTablet ? 36 : 28}
                                    color={typeConfig.color}
                                />
                            </View>
                        )}

                        <Text style={styles.title}>
                            {title || getDefaultTitle()}
                        </Text>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    {/* Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <LinearGradient
                                colors={[typeConfig.gradientColors[0], typeConfig.gradientColors[1]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>{confirmText}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    )
}

export default ErrorModal
