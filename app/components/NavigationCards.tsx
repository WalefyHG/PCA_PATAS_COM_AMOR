"use client"

import React from "react"
import { Text, TouchableOpacity, View, Platform, Animated, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../utils/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"

interface NavigationCardProps {
    title: string
    icon: string
    onPress: () => void
    platform: string
}

export default function NavigationCard({ title, icon, onPress, platform }: NavigationCardProps) {
    const { paperTheme, isDarkTheme, colors } = useThemeContext()
    const isIOS = platform === "ios"
    const isAndroid = platform === "android"
    const isWeb = platform === "web"

    // Animated value for press effect
    const [scaleAnim] = React.useState(new Animated.Value(1))

    // Handle press animations
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
            bounciness: 6,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 6,
        }).start()
    }

    // Platform-specific styles
    const cardWidth = isWeb ? "w-64" : "w-[48%]"
    const cardMargin = isWeb ? "mx-4" : ""
    const iconSize = isWeb ? 36 : 30

    // Gradient colors based on theme
    const gradientStart = isDarkTheme ? colors.primaryDark : colors.primaryLight

    const gradientEnd = isDarkTheme ? colors.secondaryDark : colors.secondaryLight

    // Card background based on icon type
    const getGradientColors = () => {
        switch (icon) {
            case "heart":
                return isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primaryLight, colors.secondaryLight]
            case "book-open":
                return isDarkTheme ? [colors.info, colors.primaryDark] : [colors.info, colors.primaryLight]
            case "user":
                return isDarkTheme ? [colors.secondaryDark, colors.primaryDark] : [colors.secondaryLight, colors.primaryLight]
            case "settings":
                return isDarkTheme ? [colors.primaryDark, colors.info] : [colors.primaryLight, colors.info]
            default:
                return isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primaryLight, colors.secondaryLight]
        }
    }

    return (
        <Animated.View
            style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}
            className={`${cardWidth} ${cardMargin} mb-4`}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                className="w-full h-full"
            >
                <LinearGradient
                    colors={getGradientColors() as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-32 rounded-2xl overflow-hidden"
                    style={[styles.cardGradient, isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow]}
                >
                    <View className="flex-1 p-4 items-center justify-center">
                        <View className="bg-white/20 p-3 rounded-full mb-2">
                            <Feather name={icon as any} size={iconSize} color="white" />
                        </View>
                        <Text
                            className="text-white font-bold text-lg"
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {title}
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    animatedContainer: {
        height: 128,
    },
    cardGradient: {
        borderRadius: 16,
    },
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    androidShadow: {
        elevation: 8,
    },
    webShadow: {
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
})
