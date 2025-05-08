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
  const { paperTheme, isDarkTheme, colors } = useThemeContext()
  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"
  const isWeb = Platform.OS === "web"

  const [user, setUser] = useState<User | null>(null)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    // Fade in animation
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

  // Platform-specific styles
  const containerPadding = isIOS ? "pt-12" : isAndroid ? "pt-6" : "pt-8"
  const headerMargin = isIOS ? "mt-0" : "mt-4"
  const scrollViewStyle = `flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`

  return (
    <SafeAreaView className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
      <StatusBar
        barStyle={isDarkTheme ? "light-content" : "dark-content"}
        backgroundColor={isDarkTheme ? colors.background.dark : colors.background.light}
      />
      <ScrollView className={scrollViewStyle}>
        <Animated.View style={{ opacity: fadeAnim }} className={`flex-1 p-4 ${containerPadding}`}>
          <View className={`${headerMargin} mb-8 items-center`}>
            <Text
              className={`text-3xl font-bold mb-3 ${isDarkTheme ? "text-white" : "text-gray-900"} ${isWeb ? "text-4xl" : ""}`}
              style={{
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
              className={`text-base mb-6 ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              O que você deseja fazer hoje?
            </Text>
          </View>

          <View className={`flex-row flex-wrap ${isWeb ? "justify-center" : "justify-between"} px-2`}>
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
