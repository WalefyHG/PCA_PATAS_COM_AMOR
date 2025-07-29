"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import AccountSwitcher from "../../components/AccountSwitcher"
import { signOut } from "firebase/auth"
import { auth } from "../../../data/datasources/firebase/firebase"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Settings() {
  const { isDarkTheme, colors, toggleTheme } = useThemeContext()
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start()

    // Load settings
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem("notifications_enabled")
      const sound = await AsyncStorage.getItem("sound_enabled")
      const vibration = await AsyncStorage.getItem("vibration_enabled")

      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications))
      if (sound !== null) setSoundEnabled(JSON.parse(sound))
      if (vibration !== null) setVibrationEnabled(JSON.parse(vibration))
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth)
            // Clear any stored data
            await AsyncStorage.clear()
          } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Erro", "Não foi possível sair da conta.")
          }
        },
      },
    ])
  }

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    showArrow = true,
  }: {
    icon: string
    title: string
    subtitle?: string
    onPress?: () => void
    rightComponent?: React.ReactNode
    showArrow?: boolean
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}20` }]}>
        <Feather name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>{subtitle}</Text>
        )}
      </View>
      {rightComponent ||
        (showArrow && <Feather name="chevron-right" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />)}
    </TouchableOpacity>
  )

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>{title}</Text>
  )

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
      {/* Header */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>Gerencie suas preferências e conta</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Account Switcher Section */}
          <SectionHeader title="CONTAS" />
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
            <AccountSwitcher />
          </View>

          {/* Account Management */}
          <SectionHeader title="GERENCIAR CONTA" />
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
            <SettingItem
              icon="user"
              title="Editar Perfil"
              subtitle="Altere suas informações pessoais"
              onPress={() => navigation.navigate("AddUsers", { userId: user?.uid })}
            />
            <SettingItem
              icon="bell"
              title="Notificações"
              subtitle="Configure suas preferências de notificação"
              onPress={() => navigation.navigate("NotificationsPreferences")}
            />
            <SettingItem
              icon="shield"
              title="Privacidade e Segurança"
              subtitle="Gerencie suas configurações de privacidade"
              onPress={() => navigation.navigate("PermissionsManager")}
            />
          </View>

          {/* App Preferences */}
          <SectionHeader title="PREFERÊNCIAS DO APP" />
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
            <SettingItem
              icon="moon"
              title="Tema Escuro"
              subtitle="Ative o modo escuro para economizar bateria"
              rightComponent={
                <Switch
                  value={isDarkTheme}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#D1D5DB", true: colors.primary }}
                  thumbColor={isDarkTheme ? "#FFFFFF" : "#F3F4F6"}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="bell"
              title="Notificações Push"
              subtitle="Receba notificações sobre pets e doações"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    setNotificationsEnabled(value)
                    saveSettings("notifications_enabled", value)
                  }}
                  trackColor={{ false: "#D1D5DB", true: colors.primary }}
                  thumbColor={notificationsEnabled ? "#FFFFFF" : "#F3F4F6"}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="volume-2"
              title="Sons"
              subtitle="Reproduzir sons para notificações"
              rightComponent={
                <Switch
                  value={soundEnabled}
                  onValueChange={(value) => {
                    setSoundEnabled(value)
                    saveSettings("sound_enabled", value)
                  }}
                  trackColor={{ false: "#D1D5DB", true: colors.primary }}
                  thumbColor={soundEnabled ? "#FFFFFF" : "#F3F4F6"}
                />
              }
              showArrow={false}
            />
            <SettingItem
              icon="smartphone"
              title="Vibração"
              subtitle="Vibrar para notificações importantes"
              rightComponent={
                <Switch
                  value={vibrationEnabled}
                  onValueChange={(value) => {
                    setVibrationEnabled(value)
                    saveSettings("vibration_enabled", value)
                  }}
                  trackColor={{ false: "#D1D5DB", true: colors.primary }}
                  thumbColor={vibrationEnabled ? "#FFFFFF" : "#F3F4F6"}
                />
              }
              showArrow={false}
            />
          </View>

          {/* Content Management */}
          <SectionHeader title="GERENCIAR CONTEÚDO" />
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
            <SettingItem
              icon="heart"
              title="Minhas ONGs"
              subtitle="Gerencie suas organizações cadastradas"
              onPress={() => navigation.navigate("OngList")}
            />
            <SettingItem
              icon="activity"
              title="Minhas Clínicas"
              subtitle="Gerencie suas clínicas veterinárias"
              onPress={() => navigation.navigate("ClinicsList")}
            />
            <SettingItem
              icon="message-circle"
              title="Meus Chats"
              subtitle="Visualize suas conversas sobre adoções"
              onPress={() => navigation.navigate("ChatList")}
            />
            <SettingItem
              icon="file-text"
              title="Minhas Postagens"
              subtitle="Gerencie seus posts no blog"
              onPress={() => navigation.navigate("AddBlogPost")}
            />
          </View>

          {/* Support */}
          <SectionHeader title="SUPORTE" />
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
            <SettingItem
              icon="help-circle"
              title="Central de Ajuda"
              subtitle="Encontre respostas para suas dúvidas"
              onPress={() => {
                // Implementar navegação para ajuda
                Alert.alert("Em breve", "Central de ajuda será implementada em breve.")
              }}
            />
            <SettingItem
              icon="mail"
              title="Contato"
              subtitle="Entre em contato com nossa equipe"
              onPress={() => {
                // Implementar contato
                Alert.alert("Contato", "Entre em contato através do email: suporte@petadopt.com")
              }}
            />
            <SettingItem
              icon="star"
              title="Avaliar App"
              subtitle="Deixe sua avaliação na loja de apps"
              onPress={() => {
                // Implementar avaliação
                Alert.alert("Obrigado!", "Sua avaliação é muito importante para nós.")
              }}
            />
          </View>

          {/* Admin Tools (if admin) */}
          {user?.role === "admin" && (
            <>
              <SectionHeader title="FERRAMENTAS ADMIN" />
              <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF" }]}>
                <SettingItem
                  icon="settings"
                  title="Console Admin"
                  subtitle="Acesse ferramentas administrativas"
                  onPress={() => navigation.navigate(Platform.OS === "web" ? "AdminConsoleWeb" : "AdminConsole")}
                />
              </View>
            </>
          )}

          {/* Logout */}
          <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF", marginBottom: 40 }]}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={[styles.settingIcon, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="log-out" size={20} color="#EF4444" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: "#EF4444" }]}>Sair da Conta</Text>
                <Text style={[styles.settingSubtitle, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                  Desconectar de sua conta atual
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 32,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
})
