"use client"

import { useState, useEffect } from "react"
import { TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import NotificationService from "../utils/NotificationsServices"

interface FavoriteButtonProps {
    petId: string
    petType: string
    petName: string
    size?: number
    style?: any
}

export default function FavoriteButton({ petId, petType, petName, size = 24, style }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false)
    const [loading, setLoading] = useState(false)
    const scaleAnim = new Animated.Value(1)
    const notificationService = NotificationService.getInstance()

    useEffect(() => {
        checkFavoriteStatus()
    }, [petId])

    const checkFavoriteStatus = async () => {
        try {
            const favorited = await notificationService.isPetFavorited(petId)
            setIsFavorited(favorited)
        } catch (error) {
            console.error("Erro ao verificar status de favorito:", error)
        }
    }

    const toggleFavorite = async () => {
        if (loading) return

        setLoading(true)

        // Animação de clique
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()

        try {
            if (isFavorited) {
                await notificationService.removeFromFavorites(petId)
                setIsFavorited(false)
            } else {
                await notificationService.addToFavorites(petId, petType, petName)
                setIsFavorited(true)
            }
        } catch (error) {
            console.error("Erro ao alterar favorito:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={[styles.button, style]} onPress={toggleFavorite} testID="favorite-button" accessibilityRole="button" accessibilityHint="" disabled={loading}>
                <Feather
                    name={isFavorited ? "heart" : "heart"}
                    size={size}
                    color={isFavorited ? "#EF4444" : "#9CA3AF"}
                    fill={isFavorited ? "#EF4444" : "transparent"}
                />
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
})