"use client"

import { useState, useEffect } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { isWeb } from "@gluestack-ui/nativewind-utils/IsWeb"
import HeaderLayout from "../utils/HeaderLayout"
import { use } from "i18next"
import { getPets, Pet } from "../config/firebase"

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
});

export default function Adopt() {
    const { isDarkTheme, colors } = useThemeContext()
    const router = useNavigation();
    const isWeb = Platform.OS === "web"

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const [pets, setPets] = useState<Pet[]>()


    useEffect(() => {
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

    useEffect(() => {
        const fetchData = async () => {
            const fetchPets = await getPets();
            if (fetchPets) {
                setPets(fetchPets);
            }
        };
        fetchData();
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#1a202c' : '#f8fafc' }}>
            {/* Header with gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    paddingTop: Platform.select({ ios: 64, android: 40, web: 80 }),
                    paddingBottom: 32,
                    paddingHorizontal: 16
                }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Feather name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="w-10" />
                </View>
                <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
                    <HeaderLayout title="Profile" />
                </View>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Feather name="heart" size={40} color="white" />
                    <Text style={{
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                        marginTop: 8,
                        ...Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        }),
                    }}>
                        Adote um Amigo
                    </Text>
                    <Text style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 16,
                        marginTop: 4,
                        textAlign: 'center',
                        ...Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        }),
                    }}>
                        Encontre um novo companheiro para sua família
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        flexDirection: isWeb ? 'row' : 'column',
                        flexWrap: isWeb ? 'wrap' : 'nowrap',
                        justifyContent: isWeb ? 'center' : 'flex-start',
                        padding: 16
                    }}
                >
                    {pets?.map((pet, index) => (
                        <View
                            key={pet.id}
                            style={{
                                width: isWeb ? 300 : '100%',
                                maxWidth: isWeb ? 300 : 500,
                                marginBottom: 24,
                                marginHorizontal: isWeb ? 8 : 0,
                                alignSelf: isWeb ? 'flex-start' : 'center'
                            }}
                        >
                            <PetCard pet={pet} index={index} isDark={isDarkTheme} colors={colors} />
                        </View>
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
    const router = useNavigation<any>();
    const [liked, setLiked] = useState(false)

    useEffect(() => {
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
        }, index * 150)

        return () => clearTimeout(timeout)
    }, [])

    const handleAdopt = () => {
        router.navigate("AdoptDetails", { petId: pet?.id })
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
        >
            <View
                style={[
                    {
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: isDark ? '#2d3748' : 'white',
                    },
                    Platform.select({
                        ios: styles.iosShadow,
                        android: styles.iosShadow, // Use iOS shadow as fallback for Android
                        ...(isWeb ? styles.webShadow : {}),
                    })
                ]}
            >
                <View style={{ position: 'relative' }}>
                    <Image
                        source={{ uri: pet.images[0] }}
                        style={{ width: '100%', height: 200 }}
                        resizeMode="cover"
                    />
                    <View style={{ position: 'absolute', top: 12, right: 12 }}>
                        <TouchableOpacity
                            onPress={handleLike}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: liked
                                    ? '#ef4444'
                                    : isDark
                                        ? 'rgba(45, 55, 72, 0.7)'
                                        : 'rgba(255, 255, 255, 0.7)'
                            }}
                        >
                            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                                <Feather
                                    name={liked ? "heart" : "heart"}
                                    size={20}
                                    color={liked ? "white" : colors.secondary}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    backgroundColor: pet.type === "Cachorro"
                                        ? `${colors.primary}40`
                                        : `${colors.secondary}40`
                                }}
                            >
                                <Feather
                                    name={pet.type === "Cachorro" ? "github" : "gitlab"}
                                    size={14}
                                    color={pet.type === "Cachorro" ? colors.primary : colors.secondary}
                                />
                            </View>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '500',
                                    color: isDark ? 'white' : '#1a202c',
                                    ...Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                }}
                            >
                                {pet.type} • {pet.breed} • {pet.age}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ padding: 16 }}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            marginBottom: 8,
                            color: isDark ? 'white' : '#1a202c',
                            ...Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            }),
                        }}
                    >
                        {pet.name}
                    </Text>

                    <Text
                        style={{
                            fontSize: 14,
                            marginBottom: 16,
                            color: isDark ? '#cbd5e0' : '#4a5568',
                            ...Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            }),
                        }}
                    >
                        {pet.description}
                    </Text>

                    <TouchableOpacity
                        onPress={handleAdopt}
                        style={{
                            paddingVertical: 12,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.primary,
                            ...styles.adoptButton,
                        }}
                    >
                        <Text
                            style={{
                                color: 'white',
                                fontWeight: '600',
                                marginRight: 8,
                                ...Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                }),
                            }}
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