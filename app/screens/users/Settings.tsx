"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { auth } from "../../config/firebase"
import { signOut } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"

export default function Settings() {
  const { paperTheme, toggleTheme } = useThemeContext()
  const navigation = useNavigation()

  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [locationServices, setLocationServices] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigation.reset({
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

  return (
    <ScrollView style={{ backgroundColor: paperTheme.colors.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>Configurações</Text>

        <View style={[styles.section, { borderColor: paperTheme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onBackground }]}>Aparência</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="moon" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.settingText, { color: paperTheme.colors.onBackground }]}>Modo Escuro</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { borderColor: paperTheme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onBackground }]}>Notificações</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.settingText, { color: paperTheme.colors.onBackground }]}>Notificações Push</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: paperTheme.colors.primaryContainer }}
              thumbColor={notifications ? paperTheme.colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="mail" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.settingText, { color: paperTheme.colors.onBackground }]}>
                Atualizações por Email
              </Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: "#767577", true: paperTheme.colors.primaryContainer }}
              thumbColor={emailUpdates ? paperTheme.colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={[styles.section, { borderColor: paperTheme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onBackground }]}>Privacidade</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="map-pin" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.settingText, { color: paperTheme.colors.onBackground }]}>
                Serviços de Localização
              </Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: "#767577", true: paperTheme.colors.primaryContainer }}
              thumbColor={locationServices ? paperTheme.colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={[styles.section, { borderColor: paperTheme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onBackground }]}>Conta</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Feather name="user" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.menuItemText, { color: paperTheme.colors.onBackground }]}>Editar Perfil</Text>
            </View>
            <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Feather name="lock" size={20} color={paperTheme.colors.primary} />
              <Text style={[styles.menuItemText, { color: paperTheme.colors.onBackground }]}>Alterar Senha</Text>
            </View>
            <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={confirmLogout}>
            <View style={styles.menuItemContent}>
              <Feather name="log-out" size={20} color="#FF3B30" />
              <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>Sair</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: paperTheme.colors.onSurfaceVariant }]}>Versão 1.0.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 32,
  },
})
