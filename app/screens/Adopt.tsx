"use client"

import { useState, useEffect } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

interface Pet {
    id: string
    name: string
    age: string
    type: string
    breed: string
    description: string
    image: string
}

export default function Adopt() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const [pets] = useState<Pet[]>([
        {
            id: "1",
            name: "Max",
            age: "2 anos",
            type: "Cachorro",
            breed: "Labrador",
            description: "Max é um cachorro amigável e brincalhão que adora crianças.",
            image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        {
            id: "2",
            name: "Luna",
            age: "1 ano",
            type: "Gato",
            breed: "Siamês",
            description: "Luna é uma gata dócil e carinhosa que adora dormir no colo.",
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        {
            id: "3",
            name: "Bob",
            age: "3 anos",
            type: "Cachorro",
            breed: "Vira-lata",
            description: "Bob é um cachorro leal e protetor, ótimo para famílias.",
            image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
        {
            id: "4",
            name: "Mia",
            age: "6 meses",
            type: "Gato",
            breed: "Persa",
            description: "Mia é uma gatinha brincalhona e curiosa, perfeita para apartamentos.",
            image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        },
    ])

    useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header with gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pt-16 pb-8 px-4"
            >
                <View className="items-center">
                    <Feather name="heart" size={40} color="white" />
                    <Text className="text-white text-2xl font-bold mt-2">Adote um Amigo</Text>
                    <Text className="text-white/80 text-base mt-1 text-center">
                        Encontre um novo companheiro para sua família
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-4 pt-4 pb-8"
                >
                    {pets.map((pet, index) => (
                        <PetCard key={pet.id} pet={pet} index={index} isDark={isDarkTheme} colors={colors} />
                    ))}
                </Animated.View>
            </ScrollView>
        </View>
    )
}

interface PetCardProps {
    pet: Pet
    index: number
    isDark: boolean
    colors: any
}

function PetCard({ pet, index, isDark, colors }: PetCardProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [scaleAnim] = useState(new Animated.Value(0.95))
    const [heartAnim] = useState(new Animated.Value(1))
    const [liked, setLiked] = useState(false)

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each card
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 150) // Stagger based on index

        return () => clearTimeout(timeout)
    }, [])

    const handleAdopt = () => {
        // Handle adoption logic
    }

    const handleLike = () => {
        setLiked(!liked)
        Animated.sequence([
            Animated.timing(heartAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(heartAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start()
    }

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            }}
            className="mb-6"
        >
            <View
                className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="relative">
                    <Image source={{ uri: pet.image }} className="w-full h-48 object-cover" />
                    <View className="absolute top-3 right-3">
                        <TouchableOpacity
                            onPress={handleLike}
                            className={`w-10 h-10 rounded-full items-center justify-center ${liked ? "bg-red-500" : isDark ? "bg-gray-800/70" : "bg-white/70"
                                }`}
                        >
                            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                                <Feather name={liked ? "heart" : "heart"} size={20} color={liked ? "white" : colors.secondary} />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    <View
                        className="absolute bottom-0 left-0 right-0 px-4 py-2"
                        style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)" }}
                    >
                        <View className="flex-row items-center">
                            <View
                                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                                style={{ backgroundColor: pet.type === "Cachorro" ? colors.primary + "40" : colors.secondary + "40" }}
                            >
                                <Feather
                                    name={pet.type === "Cachorro" ? "github" : "gitlab"}
                                    size={14}
                                    color={pet.type === "Cachorro" ? colors.primary : colors.secondary}
                                />
                            </View>
                            <Text
                                className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {pet.type} • {pet.breed} • {pet.age}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="p-4">
                    <Text
                        className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}
                        style={Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        })}
                    >
                        {pet.name}
                    </Text>

                    <Text
                        className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        style={Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        })}
                    >
                        {pet.description}
                    </Text>

                    <TouchableOpacity
                        onPress={handleAdopt}
                        className="py-3 rounded-xl flex-row items-center justify-center"
                        style={{
                            backgroundColor: colors.primary,
                            ...styles.adoptButton,
                        }}
                    >
                        <Text
                            className="text-white font-semibold mr-2"
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Quero Adotar
                        </Text>
                        <Feather name="heart" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    androidShadow: {
        elevation: 4,
    },
    webShadow: {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    adoptButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
})

