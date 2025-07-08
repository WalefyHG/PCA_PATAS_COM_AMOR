import React, { useEffect, useRef, useState } from "react"
import { View, TouchableOpacity, StyleSheet, Text, Platform, Animated, Pressable, Image } from "react-native"
import Popover from "react-native-popover-view"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { auth } from "../data/datasources/firebase/firebase"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import { useThemeContext } from "../presentation/contexts/ThemeContext"

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
}

export default function HeaderUserMenu() {
    const router = useNavigation();
    const [user, setUser] = useState<User | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const avatarRef = useRef<any>(null)

    const { toggleTheme, isDarkTheme, colors, setTheme } = useThemeContext()

    // Animation values
    const [scaleAnim] = useState(new Animated.Value(1))
    const [rotateAnim] = useState(new Animated.Value(0))

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser)
        return unsubscribe
    }, [])

    const initials = getInitials(user?.displayName || user?.email || "U")

    const openPopover = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setIsVisible(false)
        await signOut(auth)
        setTheme(false)
        router.goBack()
    }

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            useNativeDriver: true,
            speed: 20,
        }).start()
    }

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
        }).start()
    }

    const handleThemeToggle = () => {
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start(() => {
            rotateAnim.setValue(0)
            toggleTheme()
        })
    }

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    })

    return (
        <View style={styles.container}>

            {/* Avatar Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    ref={avatarRef}
                    onPress={openPopover}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.avatarWrapper}
                >
                    <LinearGradient
                        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        {user?.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.avatarLabel}>
                                {initials || "U"}
                            </Text>
                        )
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* User Menu Popover */}
            <Popover
                isVisible={isVisible}
                from={avatarRef}
                onRequestClose={() => setIsVisible(false)}
                popoverStyle={[
                    styles.popoverContent,
                    { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" },
                    Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow,
                ]}
                animationConfig={{
                    duration: 200,
                    useNativeDriver: false,
                }}
            >
                <View>
                    <View className="flex-row items-center mb-2">
                        <LinearGradient
                            colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.menuAvatar}
                        >
                            <Text style={styles.menuAvatarLabel}>{initials}</Text>
                        </LinearGradient>
                        <View className="ml-3">
                            <Text
                                style={[styles.userName, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}
                                numberOfLines={1}
                            >
                                {user?.displayName || "Usuário"}
                            </Text>
                            <Text
                                style={[styles.userEmail, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}
                                numberOfLines={1}
                            >
                                {user?.email}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.separator, { backgroundColor: isDarkTheme ? "#374151" : "#E5E7EB" }]} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setIsVisible(false)
                            router.navigate({ name: "Profile", params: { id: user?.uid } } as never)
                        }}
                    >
                        <View
                            style={[
                                styles.menuIconContainer,
                                { backgroundColor: `${colors.primary}15` },
                            ]}
                        >
                            <Feather name="user" size={16} color={colors.primary} />
                        </View>
                        <Text style={[styles.menuText, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>Meu Perfil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setIsVisible(false)
                            router.navigate({ name: "Settings" } as never)
                        }}
                    >
                        <View
                            style={[
                                styles.menuIconContainer,
                                { backgroundColor: `${colors.secondary}15` },
                            ]}
                        >
                            <Feather name="settings" size={16} color={colors.secondary} />
                        </View>
                        <Text style={[styles.menuText, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>Configurações</Text>
                    </TouchableOpacity>

                    {/* Theme toogle button */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleThemeToggle}
                    >
                        <View
                            style={[
                                styles.menuIconContainer,
                                { backgroundColor: isDarkTheme ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)" },
                            ]}
                        >
                            <Feather
                                name={isDarkTheme ? "sun" : "moon"}
                                size={16}
                                color={isDarkTheme ? "#FFFFFF" : colors.secondaryLight}
                            />
                        </View>
                        <Text style={[styles.menuText, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>
                            {isDarkTheme ? "Modo Claro" : "Modo Escuro"}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: isDarkTheme ? "#374151" : "#E5E7EB" }]} />

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View
                            style={[
                                styles.menuIconContainer,
                                { backgroundColor: "rgba(239, 68, 68, 0.15)" },
                            ]}
                        >
                            <Feather name="log-out" size={16} color="#EF4444" />
                        </View>
                        <Text style={[styles.menuText, { color: "#EF4444" }]}>Sair</Text>
                    </TouchableOpacity>

                </View>
            </Popover>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    themeButton: {
        padding: 8,
        borderRadius: 12,
    },
    avatarWrapper: {
        zIndex: 10,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    avatarLabel: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#fff",
    },
    popoverContent: {
        padding: 16,
        minWidth: 240,
        borderRadius: 16,
    },
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    androidShadow: {
        elevation: 6,
    },
    menuAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    menuAvatarLabel: {
        fontWeight: "bold",
        fontSize: 12,
        color: "#fff",
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
        maxWidth: 160,
    },
    userEmail: {
        fontSize: 12,
        maxWidth: 160,
    },
    separator: {
        height: 1,
        marginVertical: 12,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    menuText: {
        fontSize: 14,
        fontWeight: "500",
    },
})
