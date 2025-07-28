import React from "react"
import { TouchableOpacity, StyleSheet, View, Text, ViewStyle } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"

interface FloatingActionButtonProps {
    onPress: () => void
    icon?: keyof typeof Feather.glyphMap
    label?: string
    style?: ViewStyle
    size?: number
}

export default function FloatingActionButton({
    onPress,
    icon = "plus",
    label,
    style,
    size = 56,
}: FloatingActionButtonProps) {
    const { paperTheme } = useThemeContext()

    return (
        <View style={styles.container}>
            {label && (
                <View
                    style={[
                        styles.labelContainer,
                        {
                            backgroundColor: paperTheme.colors.surfaceVariant,
                            right: size + 16,
                        },
                    ]}
                >
                    <Text style={[styles.label, { color: paperTheme.colors.onSurfaceVariant }]}>{label}</Text>
                </View>
            )}
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: paperTheme.colors.primary,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    style,
                ]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <Feather name={icon} size={size / 2} color={paperTheme.colors.onPrimary} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        right: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1,
    },
    labelContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        position: "absolute",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
    },
})
