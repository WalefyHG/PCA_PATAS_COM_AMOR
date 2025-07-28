"use client"

import { useEffect, useState } from "react"
import { Text, View, ScrollView, Platform, SafeAreaView, StatusBar, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { db, auth } from "../../../data/datasources/firebase/firebase"
import { getDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useThemeContext } from "../../contexts/ThemeContext"
import { useAccount } from "../../contexts/AccountContext"
import NavigationCard from "../../components/NavigationCards"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"
import { ongRepository } from "../../../repositories/FirebaseOngRepository"
import { clinicRepository } from "../../../repositories/FirebaseClinicRepository"
import type { Ong } from "../../../domain/entities/Ongs"
import type { Clinic } from "../../../domain/entities/Clinic"

interface User {
  uid: string
  first_name?: string
  displayName?: string
}

export default function Home() {
  const navigation = useNavigation<any>()
  const { isDarkTheme, colors } = useThemeContext()
  const { currentAccount } = useAccount()
  const isWeb = Platform.OS === "web"

  const [profileData, setProfileData] = useState<User | Ong | Clinic | null>(null)
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentAccount) {
        try {
          let data = null

          switch (currentAccount.type) {
            case "user":
              const userDoc = await getDoc(doc(db, "users", currentAccount.profileId))
              if (userDoc.exists()) {
                const userData = userDoc.data()
                data = {
                  uid: currentAccount.profileId,
                  first_name: userData.first_name,
                  displayName: userData.displayName,
                }
              }
              break

            case "ong":
              data = await ongRepository.getOngById(currentAccount.profileId)
              break

            case "clinic":
              data = await clinicRepository.getClinicById(currentAccount.profileId)
              break
          }

          setProfileData(data)
        } catch (error) {
          console.error("Error fetching profile data:", error)
        }
      } else {
        setProfileData(null)
      }
    })

    return () => unsubscribe()
  }, [currentAccount])

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName)
  }

  const getWelcomeMessage = () => {
    if (!profileData) return "Bem-vindo ao Patas com Amor"

    switch (currentAccount.type) {
      case "user":
        const userData = profileData as User
        return `Olá, ${userData.first_name || userData.displayName || "Usuário"}!`

      case "ong":
        const ongData = profileData as Ong
        return `Bem-vindo, ${ongData.name}!`

      case "clinic":
        const clinicData = profileData as Clinic
        return `Bem-vindo, ${clinicData.name}!`

      default:
        return "Bem-vindo ao Patas com Amor"
    }
  }

  const getSubtitle = () => {
    switch (currentAccount.type) {
      case "user":
        return "O que você deseja fazer hoje?"

      case "ong":
        return "Gerencie seus pets e ajude mais animais a encontrarem um lar"

      case "clinic":
        return "Ofereça seus serviços veterinários e cuide da saúde dos pets"

      default:
        return "O que você deseja fazer hoje?"
    }
  }

  const getNavigationCards = () => {
    const baseCards = [
      {
        title: "Adote",
        icon: "heart",
        screen: "Adopt",
      },
      {
        title: "Blog",
        icon: "book-open",
        screen: "News",
      },
      {
        title: "Perfil",
        icon: "user",
        screen: "Profile",
      },
      {
        title: "Configurações",
        icon: "settings",
        screen: "Settings",
      },
    ]

    // Adicionar cards específicos baseados no tipo de conta
    if (currentAccount.type === "ong" || currentAccount.type === "clinic") {
      baseCards.splice(2, 0, {
        title: "Meus Pets",
        icon: "heart",
        screen: "MyPets",
      })
    }

    if (currentAccount.type === "clinic") {
      baseCards.splice(1, 0, {
        title: "Clínicas",
        icon: "activity",
        screen: "ClinicsList",
      })
    }

    if (currentAccount.type === "ong") {
      baseCards.splice(1, 0, {
        title: "ONGs",
        icon: "heart",
        screen: "OngsList",
      })
    }

    return baseCards
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkTheme ? "#1a202c" : "#f8fafc" }}>
      <StatusBar
        barStyle={isDarkTheme ? "light-content" : "dark-content"}
        backgroundColor={isDarkTheme ? colors.background?.dark : colors.background?.light}
      />
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.select({ ios: 64, android: 40, web: 80 }),
          paddingBottom: 32,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 20,
            flexDirection: "row",
            alignSelf: "flex-end",
            alignItems: "center",
          }}
        >
          <HeaderLayout title="Home" />
        </View>

        <Text
          style={{
            textAlign: "center",
            fontSize: isWeb ? 36 : 30,
            fontWeight: "bold",
            marginBottom: 12,
            color: "#FFFFFF",
            ...Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            }),
          }}
        >
          {getWelcomeMessage()}
        </Text>

        <Text
          style={{
            fontSize: 16,
            marginBottom: 24,
            textAlign: "center",
            color: "#FFFFFF",
            ...Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            }),
          }}
        >
          {getSubtitle()}
        </Text>

        {/* Account type indicator */}
        {currentAccount.type !== "user" && (
          <View
            style={{
              alignSelf: "center",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {currentAccount.type === "ong" ? "🏠 Conta ONG" : "🏥 Conta Clínica"}
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: isDarkTheme ? "#1a202c" : "#f8fafc" }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            flex: 1,
            padding: 16,
            paddingTop: Platform.select({
              ios: 48,
              android: 24,
              web: 32,
            }),
          }}
        >
          <View
            style={{
              flexDirection: isWeb ? "row" : "row",
              flexWrap: isWeb ? "wrap" : "wrap",
              justifyContent: isWeb ? "center" : "space-between",
              paddingHorizontal: 8,
            }}
          >
            {getNavigationCards().map((card, index) => (
              <NavigationCard
                key={index}
                title={card.title}
                icon={card.icon}
                onPress={() => navigateToScreen(card.screen)}
                platform={Platform.OS}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}
