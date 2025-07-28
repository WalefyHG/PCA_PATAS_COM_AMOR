import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Animated, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { TeamMember } from '../screens/users/About'



// Componentes auxiliares reutilizáveis


interface StatCardProps {
    value: string
    label: string
    icon: string
    color: string
    isDark: boolean
    delay?: number
}

function StatCard({ value, label, icon, color, isDark, delay = 0 }: StatCardProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [scaleAnim] = useState(new Animated.Value(0.9))
    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Delayed animation for each stat card
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
        }, delay)

        return () => clearTimeout(timeout)
    }, [])
    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                width: "31%",
            }}
        >
            <View
                className={`px-2 py-4 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={[isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow]}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Feather name={icon as any} size={20} color={color} />
                </View>
                <Text className="text-xl font-bold" style={{ color }}>
                    {value}
                </Text>
                <Text
                    className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    {label}
                </Text>
            </View>
        </Animated.View>
    )
}


function InfoCard({ title, icon, content, colors, isDark }: {
    title: string
    icon: string
    content: string
    colors: any
    isDark: boolean
}) {
    return (
        <View style={[
            styles.cardContainer,
            {
                backgroundColor: isDark ? '#1f2937' : 'white',
                marginBottom: 24
            }
        ]}>
            <View style={styles.cardHeader}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: `${colors.primary}20` }
                ]}>
                    <Feather name={icon as any} size={20} color={colors.primary} />
                </View>
                <Text style={[
                    styles.sectionTitle,
                    { color: isDark ? 'white' : '#111827' }
                ]}>
                    {title}
                </Text>
            </View>
            <Text style={[
                styles.cardContent,
                { color: isDark ? '#d1d5db' : '#4b5563' }
            ]}>
                {content}
            </Text>
        </View>
    )
}

function TeamMemberCard({ member, index, colors, isDark, fadeAnim, slideAnim }: {
    member: TeamMember
    index: number
    colors: any
    isDark: boolean
    fadeAnim: Animated.Value
    slideAnim: Animated.Value
}) {
    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }],
                marginBottom: 16
            }}
        >
            <View style={[
                styles.cardContainer,
                {
                    backgroundColor: isDark ? '#1f2937' : 'white',
                    flexDirection: 'row',
                    padding: 16
                }
            ]}>
                <Image
                    source={{ uri: member.photo }}
                    style={[
                        styles.memberImage,
                        { borderColor: colors.primary }
                    ]}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[
                        styles.memberName,
                        { color: isDark ? 'white' : '#111827' }
                    ]}>
                        {member.name}
                    </Text>
                    <Text style={[
                        styles.memberRole,
                        { color: colors.primary }
                    ]}>
                        {member.role}
                    </Text>
                    <Text style={[
                        styles.memberBio,
                        { color: isDark ? '#d1d5db' : '#4b5563' }
                    ]}>
                        {member.bio}
                    </Text>
                </View>
            </View>
        </Animated.View>
    )
}

function ContactItem({ icon, text, colors, isDark }: {
    icon: string
    text: string
    colors: any
    isDark: boolean
}) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12
        }}>
            <Feather name={icon as any} size={16} color={colors.primary} />
            <Text style={[
                styles.contactText,
                { color: isDark ? '#d1d5db' : '#4b5563' }
            ]}>
                {text}
            </Text>
        </View>
    )
}

function SocialButton({ icon, onPress, color }: {
    icon: string
    onPress: () => void
    color: string
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.socialButton,
                { backgroundColor: `${color}20` }
            ]}
        >
            <Feather name={icon as any} size={22} color={color} />
        </TouchableOpacity>
    )
}

// Estilos
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
    supportButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    // Removed duplicate memberImage definition
    cardContainer: {
        borderRadius: 12,
        padding: 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }
        })
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    cardContent: {
        fontSize: 14,
        lineHeight: 22,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    memberImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    memberRole: {
        fontSize: 14,
        marginBottom: 8,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    memberBio: {
        fontSize: 13,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    contactText: {
        fontSize: 14,
        marginLeft: 8,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    supportButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
        ...Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
        }),
    }
})

export { StatCard, InfoCard, TeamMemberCard, ContactItem, SocialButton }