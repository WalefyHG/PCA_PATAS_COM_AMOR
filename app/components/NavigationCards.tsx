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
    const { isDarkTheme, colors } = useThemeContext()
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

    const iconSize = isWeb ? 36 : 30

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
            style={[styles.animatedContainer, {
                transform: [{ scale: scaleAnim }],
                width: isWeb ? 256 : '48%', // Largura fixa para web, 48% para mobile
                marginBottom: 16,
                marginHorizontal: isWeb ? 8 : 0,
                alignSelf: 'center',
            }]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={{ width: '100%', height: '100%' }}
            >
                <LinearGradient
                    colors={getGradientColors() as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.cardGradient,
                        isWeb ? styles.webShadow : Platform.OS === 'ios' ? styles.iosShadow : styles.androidShadow,
                        { height: 128 }
                    ]}
                >
                    <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 12, borderRadius: 9999, marginBottom: 8 }}>
                            <Feather name={icon as any} size={iconSize} color="white" />
                        </View>
                        <Text
                            style={[
                                { color: 'white', fontWeight: 'bold', fontSize: 18 },
                                Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                }),
                            ]}
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
        width: '100%',
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