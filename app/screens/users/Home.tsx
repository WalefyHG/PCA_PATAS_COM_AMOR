"use client"

import { useEffect, useState } from "react"
import { Text, View, ScrollView, Platform, SafeAreaView, StatusBar, Animated } from "react-native"
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
  const { isDarkTheme, colors } = useThemeContext()
  const isWeb = Platform.OS === "web"

  const [user, setUser] = useState<User | null>(null)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({ uid: currentUser.uid, first_name: userData.first_name, displayName: userData.displayName })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkTheme ? '#1a202c' : '#f8fafc' }}>
      <StatusBar
        barStyle={isDarkTheme ? "light-content" : "dark-content"}
        backgroundColor={isDarkTheme ? colors.background.dark : colors.background.light}
      />
      <ScrollView style={{ flex: 1, backgroundColor: isDarkTheme ? '#1a202c' : '#f8fafc' }}>
        <Animated.View style={{
          opacity: fadeAnim,
          flex: 1,
          padding: 16,
          paddingTop: Platform.select({
            ios: 48,
            android: 24,
            web: 32
          })
        }}>
          <View style={{
            marginTop: Platform.select({ ios: 0, default: 16 }),
            marginBottom: 32,
            alignItems: 'center'
          }}>
            <Text
              style={{
                fontSize: isWeb ? 36 : 30,
                fontWeight: 'bold',
                marginBottom: 12,
                color: colors.primary,
                ...Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                }),
              }}
            >
              {user ? `Olá, ${user.first_name || user.displayName || "Usuário"}!` : "Bem-vindo ao Patas com Amor"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 24,
                color: isDarkTheme ? '#d1d5db' : '#4b5563',
                ...Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                }),
              }}
            >
              O que você deseja fazer hoje?
            </Text>
          </View>

          <View style={{
            flexDirection: isWeb ? 'row' : 'column',
            flexWrap: isWeb ? 'wrap' : 'nowrap',
            justifyContent: isWeb ? 'center' : 'space-between',
            paddingHorizontal: 8
          }}>
            <NavigationCard
              title="Adote"
              icon="heart"
              onPress={() => navigateToScreen("Adopt")}
              platform={Platform.OS}
            />
            <NavigationCard
              title="Blog"
              icon="book-open"
              onPress={() => navigateToScreen("Blog")}
              platform={Platform.OS}
            />
            <NavigationCard
              title="Perfil"
              icon="user"
              onPress={() => navigateToScreen("Profile")}
              platform={Platform.OS}
            />
            <NavigationCard
              title="Configurações"
              icon="settings"
              onPress={() => navigateToScreen("Settings")}
              platform={Platform.OS}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}