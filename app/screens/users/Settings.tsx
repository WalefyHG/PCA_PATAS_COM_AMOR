"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { auth } from "../../config/firebase"
import { signOut } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

export default function Settings() {
  const { paperTheme, toggleTheme, isDarkTheme, colors } = useThemeContext()
  const router = useNavigation<any>()

  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [locationServices, setLocationServices] = useState(false)

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"
  const isWeb = Platform.OS === "web"

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.reset({
        index: 0,
        routes: [{ name: "Login" as never }],
      })
    } catch (error) {
      console.error("Error signing out: ", error)
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.")
    }
  }

  const confirmLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: handleLogout, style: "destructive" },
    ])
  }

  const isAdmin = true // Replace with actual admin check logic

  return (
    <ScrollView className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
      <View className="relative">
        {/* Header with gradient */}
        <LinearGradient
          colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-16 pb-8 px-4"
        >
        </LinearGradient>

        {/* Settings Content */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-4 pt-4 pb-8"
        >
          {/* Appearance Section */}
          <SettingsSection title="Aparência" icon="sun">
            <SettingToggleItem
              icon="moon"
              title="Modo Escuro"
              value={isDarkTheme}
              onToggle={toggleTheme}
              colors={colors}
              isDark={isDarkTheme}
            />
          </SettingsSection>

          {/* Admin Section */}
          {isAdmin && (
            <SettingsSection title="Administração" icon="shield">
              <SettingLinkItem
                icon="shield"
                title="Admin Console"
                onPress={() => router.navigate("AdminConsole")}
                colors={colors}
                isDark={isDarkTheme}
              />
            </SettingsSection>
          )}

          {/* Notifications Section */}
          <SettingsSection title="Notificações" icon="bell">
            <SettingToggleItem
              icon="bell"
              title="Notificações Push"
              value={notifications}
              onToggle={setNotifications}
              colors={colors}
              isDark={isDarkTheme}
            />
            <SettingToggleItem
              icon="mail"
              title="Atualizações por Email"
              value={emailUpdates}
              onToggle={setEmailUpdates}
              colors={colors}
              isDark={isDarkTheme}
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection title="Privacidade" icon="lock">
            <SettingToggleItem
              icon="map-pin"
              title="Serviços de Localização"
              value={locationServices}
              onToggle={setLocationServices}
              colors={colors}
              isDark={isDarkTheme}
            />
          </SettingsSection>

          {/* Account Section */}
          <SettingsSection title="Conta" icon="user">
            <SettingLinkItem
              icon="user"
              title="Editar Perfil"
              onPress={() => router.navigate("EditProfile")}
              colors={colors}
              isDark={isDarkTheme}
            />
            <SettingLinkItem
              icon="lock"
              title="Alterar Senha"
              onPress={() => router.navigate("ChangePassword")}
              colors={colors}
              isDark={isDarkTheme}
            />
            <TouchableOpacity
              className={`flex-row items-center py-4 mt-2 rounded-xl ${isDarkTheme ? "bg-red-900/20" : "bg-red-50"}`}
              onPress={confirmLogout}
            >
              <View className="flex-row items-center flex-1 pl-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                >
                  <Feather name="log-out" size={20} color="#EF4444" />
                </View>
                <Text className="ml-3 text-red-500 font-semibold">Sair</Text>
              </View>
            </TouchableOpacity>
          </SettingsSection>

          {/* App Version */}
          <Text
            className={`text-center text-sm mt-8 mb-6 ${isDarkTheme ? "text-gray-500" : "text-gray-400"}`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Versão 1.0.0
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  )
}

interface SettingsSectionProps {
  title: string
  icon?: string
  children: React.ReactNode
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  const { isDarkTheme, colors } = useThemeContext()

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-4">
        {icon && (
          <View
            className="w-6 h-6 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Feather name={icon as any} size={14} color={colors.primary} />
          </View>
        )}
        <Text
          className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
          style={Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
          })}
        >
          {title}
        </Text>
      </View>
      <View
        className={`rounded-xl overflow-hidden ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
        style={
          Platform.OS === "ios" ? styles.iosShadow : Platform.OS === "android" ? styles.androidShadow : styles.webShadow
        }
      >
        {children}
      </View>
    </View>
  )
}

interface SettingToggleItemProps {
  icon: string
  title: string
  value: boolean
  onToggle: (value: boolean) => void
  colors: any
  isDark: boolean
}

function SettingToggleItem({ icon, title, value, onToggle, colors, isDark }: SettingToggleItemProps) {
  return (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100 last:border-b-0">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Feather name={icon as any} size={18} color={colors.primary} />
        </View>
        <Text
          className={`ml-3 ${isDark ? "text-white" : "text-gray-800"}`}
          style={Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
          })}
        >
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#767577", true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  )
}

interface SettingLinkItemProps {
  icon: string
  title: string
  onPress: () => void
  colors: any
  isDark: boolean
}

function SettingLinkItem({ icon, title, onPress, colors, isDark }: SettingLinkItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100 last:border-b-0"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Feather name={icon as any} size={18} color={colors.primary} />
        </View>
        <Text
          className={`ml-3 ${isDark ? "text-white" : "text-gray-800"}`}
          style={Platform.select({
            ios: { fontFamily: "San Francisco" },
            android: { fontFamily: "Roboto" },
          })}
        >
          {title}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  androidShadow: {
    elevation: 3,
  },
  webShadow: {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
})
