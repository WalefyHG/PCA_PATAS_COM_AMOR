"use client"

import { useState, useEffect } from "react"
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { auth, isUserAdmin } from "../../config/firebase"
import { signOut } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { SettingActionItem, SettingLinkItem, SettingsSection, SettingToggleItem } from "./SettingsUtils"
import HeaderLayout from "@/app/utils/HeaderLayout"

export default function Settings() {
  const { toggleTheme, isDarkTheme, colors } = useThemeContext()
  const navigation = useNavigation<any>()
  const isWeb = Platform.OS === "web"
  const [isAdmin, setIsAdmin] = useState(false)

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    locationServices: false
  })

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  useEffect(() => {
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
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.")
    }
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isUserAdmin(auth.currentUser?.uid || "")
        setIsAdmin(adminStatus)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    if (auth.currentUser) {
      checkAdminStatus()
    }
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }}>
      {/* Header */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.select({ ios: 60, android: 40, web: 80 }),
          paddingBottom: 40,
          paddingHorizontal: isWeb ? '20%' : 24
        }}
      >
        <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
          <HeaderLayout title="Configurações" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16
          }}>
            <Feather name="settings" size={24} color="white" />
          </View>
          <View>
            <Text style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              ...Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              }),
            }}>
              Configurações
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 14,
              ...Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              }),
            }}>
              Gerencie suas preferências
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: isWeb ? 24 : 16,
          paddingHorizontal: isWeb ? '20%' : 16,
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
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
                title="Painel Admin"
                onPress={() => Platform.OS === 'web' ? navigation.navigate("AdminConsoleWeb") : navigation.navigate("AdminConsole")}
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
              value={settings.notifications}
              onToggle={() => toggleSetting('notifications')}
              colors={colors}
              isDark={isDarkTheme}
            />
            <SettingToggleItem
              icon="mail"
              title="Atualizações por Email"
              value={settings.emailUpdates}
              onToggle={() => toggleSetting('emailUpdates')}
              colors={colors}
              isDark={isDarkTheme}
            />
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection title="Privacidade" icon="lock">
            <SettingToggleItem
              icon="map-pin"
              title="Serviços de Localização"
              value={settings.locationServices}
              onToggle={() => toggleSetting('locationServices')}
              colors={colors}
              isDark={isDarkTheme}
            />
          </SettingsSection>

          {/* Account Section */}
          <SettingsSection title="Conta" icon="user">
            <SettingLinkItem
              icon="user"
              title="Editar Perfil"
              onPress={() => navigation.navigate("EditProfile")}
              colors={colors}
              isDark={isDarkTheme}
            />
            <SettingLinkItem
              icon="lock"
              title="Alterar Senha"
              onPress={() => navigation.navigate("ChangePassword")}
              colors={colors}
              isDark={isDarkTheme}
            />
            <SettingActionItem
              icon="log-out"
              title="Sair da Conta"
              onPress={() => Alert.alert(
                "Sair",
                "Tem certeza que deseja sair?",
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Sair", onPress: handleLogout }
                ]
              )}
              color="#EF4444"
              isDark={isDarkTheme} colors={undefined} />
          </SettingsSection>

          {/* App Version */}
          <Text style={{
            textAlign: 'center',
            marginTop: 32,
            color: isDarkTheme ? '#6b7280' : '#9ca3af',
            fontSize: 12,
            ...Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            }),
          }}>
            Versão 1.0.0 · Patas com Amor
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  )
}