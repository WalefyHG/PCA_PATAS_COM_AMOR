"use client"

import { useEffect, useState } from "react"
import { Text, View, StyleSheet, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { db, auth } from "../../config/firebase"
import { getDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useThemeContext } from "../../utils/ThemeContext"
import NavigationCard from "../../components/NavigationCards"

interface User {
  uid: string
  first_name?: string
  displayName?: string
}

export default function Home() {
  const navigation = useNavigation<any>()
  const { paperTheme } = useThemeContext()

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({ uid: currentUser.uid, first_name: userData.first_name, displayName: userData.displayName })
          } else {
            console.log("No such document!")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        console.log("No user is signed in.")
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: paperTheme.colors.onBackground }]}>
            {user ? `Olá, ${user.first_name || user.displayName || "Usuário"}!` : "Bem-vindo ao Patas com Amor"}
          </Text>
          <Text style={[styles.subtitle, { color: paperTheme.colors.onBackground }]}>
            O que você deseja fazer hoje?
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <NavigationCard title="Adote" icon="heart" onPress={() => navigateToScreen("Adopt")} />
          <NavigationCard title="Blog" icon="book-open" onPress={() => navigateToScreen("Blog")} />
          <NavigationCard title="Perfil" icon="user" onPress={() => navigateToScreen("Profile")} />
          <NavigationCard title="Configurações" icon="settings" onPress={() => navigateToScreen("Settings")} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
})
