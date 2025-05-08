"use client"

import { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { db, auth } from "../../config/firebase"
import { getDoc, doc } from "firebase/firestore"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

interface User {
  uid: string
  first_name?: string
  last_name?: string
  displayName?: string
  email?: string
  photoURL?: string
  bio?: string
  pets?: number
  donations?: number
  adoptions?: number
}

export default function Profile() {
  const { paperTheme, isDarkTheme, colors } = useThemeContext()
  const router = useNavigation()
  const route = useRoute<{ key: string; name: string; params: { id?: string } }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))

  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"
  const isWeb = Platform.OS === "web"

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = route.params?.id || auth.currentUser?.uid

        if (!userId) {
          setLoading(false)
          return
        }

        const userDoc = await getDoc(doc(db, "users", userId))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            uid: userId,
            ...userData,
            // Dados fictícios para demonstração
            bio: userData.bio || "Amante de animais e voluntário em abrigos de pets.",
            pets: userData.pets || 2,
            donations: userData.donations || 5,
            adoptions: userData.adoptions || 1,
          })
        } else {
          console.log("No such document!")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)

        // Start animations when data is loaded
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
      }
    }

    fetchUserData()
  }, [route.params])

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
        <View className="flex-row items-center space-x-2">
          <Animated.View
            className="w-4 h-4 rounded-full bg-primary-500"
            style={{
              backgroundColor: colors.primary,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
          />
          <Animated.View
            className="w-4 h-4 rounded-full bg-secondary-500"
            style={{
              backgroundColor: colors.secondary,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
          />
          <Animated.View
            className="w-4 h-4 rounded-full bg-primary-500"
            style={{
              backgroundColor: colors.primary,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            }}
          />
        </View>
        <Text className={`mt-4 text-lg font-medium ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
          Carregando...
        </Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View className={`flex-1 items-center justify-center p-4 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
        <Feather name="user-x" size={64} color={colors.error} />
        <Text className={`mt-4 text-xl font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>
          Usuário não encontrado
        </Text>
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.goBack()}
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header with gradient background */}
        <LinearGradient
          colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-12 pb-20 rounded-b-3xl"
        >
        </LinearGradient>

        {/* Profile Image - Positioned to overlap the gradient */}
        <View className="items-center -mt-16 mb-4">
          <View
            className="p-1 rounded-full"
            style={{
              backgroundColor: isDarkTheme ? colors.background.dark : colors.background.light,
              ...styles.profileImageContainer,
            }}
          >
            <Image
              source={{
                uri:
                  user.photoURL ||
                  "https://ui-avatars.com/api/?name=" +
                  (user.first_name || user.displayName || "User") +
                  "&background=random",
              }}
              className="w-32 h-32 rounded-full"
            />
          </View>
          <Text
            className="mt-4 text-2xl font-bold"
            style={{
              color: colors.primary,
              ...Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              }),
            }}
          >
            {user.first_name || user.displayName || "Usuário"}
            {user.last_name ? ` ${user.last_name}` : ""}
          </Text>
          <Text
            className={`mt-2 text-center px-8 text-sm leading-5 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            {user.bio}
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between px-4 mt-6 mb-8">
          <StatCard icon="heart" value={user.pets} label="Pets" color={colors.secondary} isDark={isDarkTheme} />
          <StatCard icon="gift" value={user.donations} label="Doações" color={colors.primary} isDark={isDarkTheme} />
          <StatCard icon="home" value={user.adoptions} label="Adoções" color={colors.info} isDark={isDarkTheme} />
        </View>

        {/* Contact Information */}
        <View className="mx-4 mt-4 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text
              className={`mx-4 text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              Informações de Contato
            </Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <View
            className={`p-4 rounded-xl mb-4 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
            style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Feather name="mail" size={18} color={colors.primary} />
              </View>
              <View>
                <Text className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>Email</Text>
                <Text
                  className={`text-base font-medium ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                  style={Platform.select({
                    ios: { fontFamily: "San Francisco" },
                    android: { fontFamily: "Roboto" },
                  })}
                >
                  {user.email || "Email não disponível"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <View className="px-4 mb-10">
          <TouchableOpacity
            className="py-4 rounded-xl flex-row items-center justify-center"
            style={{
              backgroundColor: colors.primary,
              ...styles.editButton,
            }}
            onPress={() => router.navigate("Settings" as never)}
          >
            <Feather name="edit-2" size={18} color="white" />
            <Text
              className="ml-2 text-white font-semibold text-base"
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  )
}

interface StatCardProps {
  icon: string
  value?: number
  label: string
  color: string
  isDark: boolean
}

function StatCard({ icon, value = 0, label, color, isDark }: StatCardProps) {
  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"

  return (
    <View
      className={`px-4 py-5 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-white"}`}
      style={[{ width: "31%" }, isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow]}
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
  )
}

const styles = StyleSheet.create({
  profileImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
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
  editButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
})
