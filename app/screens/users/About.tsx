"use client"

import { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet, Linking } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

interface TeamMember {
  id: string
  name: string
  role: string
  photo: string
  bio: string
}

export default function AboutUs() {
  const { isDarkTheme, colors } = useThemeContext()
  const router = useNavigation()

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"
  const isWeb = Platform.OS === "web"

  // Sample team members data
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Maria Silva",
      role: "Fundadora & CEO",
      photo: "https://ui-avatars.com/api/?name=Maria+Silva&background=random",
      bio: "Veterinária com mais de 10 anos de experiência e apaixonada por animais desde a infância.",
    },
    {
      id: "2",
      name: "João Santos",
      role: "Coordenador de Adoções",
      photo: "https://ui-avatars.com/api/?name=Joao+Santos&background=random",
      bio: "Especialista em comportamento animal e responsável por encontrar os lares perfeitos para nossos amigos.",
    },
    {
      id: "3",
      name: "Ana Oliveira",
      role: "Veterinária Chefe",
      photo: "https://ui-avatars.com/api/?name=Ana+Oliveira&background=random",
      bio: "Especializada em medicina de animais resgatados e reabilitação de pets traumatizados.",
    },
  ]

  useEffect(() => {
    // Start animations when component mounts
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
  }, [])

  const openSocialMedia = (platform: string) => {
    let url = ""
    switch (platform) {
      case "instagram":
        url = "https://instagram.com/patascomamor"
        break
      case "facebook":
        url = "https://facebook.com/patascomamor"
        break
      case "twitter":
        url = "https://twitter.com/patascomamor"
        break
    }
    Linking.openURL(url)
  }

  return (
    <ScrollView className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header with gradient */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-16 pb-20 px-4"
      >
        <View className="items-center mt-4">
          <Feather name="heart" size={40} color="white" />
          <Text className="text-white text-3xl font-bold mt-2">Patas com Amor</Text>
          <Text className="text-white/80 text-base mt-1">Conectando corações peludos a lares amorosos</Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="px-4 -mt-12"
      >
        {/* Mission Card */}
        <View
          className={`rounded-xl p-5 mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
          style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Feather name="target" size={20} color={colors.primary} />
            </View>
            <Text
              className={`text-xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              Nossa Missão
            </Text>
          </View>
          <Text
            className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"} leading-6`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Transformar a vida de animais abandonados, proporcionando cuidados, amor e a chance de encontrarem famílias
            que os amem para sempre. Acreditamos que todo animal merece um lar onde seja tratado com respeito e carinho.
          </Text>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between mb-8">
          <StatCard
            value="250+"
            label="Adoções"
            icon="home"
            color={colors.secondary}
            isDark={isDarkTheme}
            delay={100}
          />
          <StatCard
            value="500+"
            label="Resgates"
            icon="shield"
            color={colors.primary}
            isDark={isDarkTheme}
            delay={200}
          />
          <StatCard
            value="1000+"
            label="Doações"
            icon="heart"
            color={colors.info}
            isDark={isDarkTheme}
            delay={300}
          />
        </View>

        {/* Team Section */}
        <View className="mb-8">
          <Text
            className={`text-xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Nossa Equipe
          </Text>

          {teamMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }],
              }}
            >
              <View
                className={`flex-row p-4 rounded-xl mb-4 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
              >
                <Image
                  source={{ uri: member.photo }}
                  className="w-20 h-20 rounded-full"
                  style={styles.memberImage}
                />
                <View className="flex-1 ml-4 justify-center">
                  <Text
                    className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                      ios: { fontFamily: "San Francisco" },
                      android: { fontFamily: "Roboto" },
                    })}
                  >
                    {member.name}
                  </Text>
                  <Text
                    className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"} mb-1`}
                    style={{ color: colors.primary }}
                  >
                    {member.role}
                  </Text>
                  <Text
                    className={`text-sm ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                    numberOfLines={2}
                    style={Platform.select({
                      ios: { fontFamily: "San Francisco" },
                      android: { fontFamily: "Roboto" },
                    })}
                  >
                    {member.bio}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* History Section */}
        <View
          className={`rounded-xl p-5 mb-8 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
          style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${colors.secondary}20` }}
            >
              <Feather name="book-open" size={20} color={colors.secondary} />
            </View>
            <Text
              className={`text-xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              Nossa História
            </Text>
          </View>
          <Text
            className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"} leading-6 mb-3`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Fundada em 2018 por Maria Silva, a Patas com Amor nasceu da paixão por ajudar animais em situação de
            abandono. O que começou como um pequeno abrigo em São Paulo, hoje se tornou uma organização reconhecida
            nacionalmente.
          </Text>
          <Text
            className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"} leading-6`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Ao longo dos anos, expandimos nossas operações para incluir programas de castração, educação sobre posse
            responsável e parcerias com clínicas veterinárias para atendimento de animais resgatados.
          </Text>
        </View>

        {/* Contact Section */}
        <View
          className={`rounded-xl p-5 mb-8 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
          style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
        >
          <View className="flex-row items-center mb-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${colors.info}20` }}
            >
              <Feather name="mail" size={20} color={colors.info} />
            </View>
            <Text
              className={`text-xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
              style={Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              })}
            >
              Contato
            </Text>
          </View>

          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color={colors.primary} />
              <Text
                className={`ml-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                style={Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                })}
              >
                Av. Paulista, 1000 - São Paulo, SP
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Feather name="phone" size={16} color={colors.primary} />
              <Text
                className={`ml-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                style={Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                })}
              >
                (11) 99999-9999
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="mail" size={16} color={colors.primary} />
              <Text
                className={`ml-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                style={Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                })}
              >
                contato@patascomamor.org
              </Text>
            </View>
          </View>

          <View className="flex-row justify-center mt-4 space-x-4">
            <TouchableOpacity
              onPress={() => openSocialMedia("instagram")}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.secondary}20` }}
            >
              <Feather name="instagram" size={22} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openSocialMedia("facebook")}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Feather name="facebook" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openSocialMedia("twitter")}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.info}20` }}
            >
              <Feather name="twitter" size={22} color={colors.info} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Button */}
        <TouchableOpacity
          className="py-4 rounded-xl flex-row items-center justify-center mb-10"
          style={{
            backgroundColor: colors.secondary,
            ...styles.supportButton,
          }}
          onPress={() => router.navigate("Donate" as never)}
        >
          <Feather name="heart" size={20} color="white" />
          <Text
            className="ml-2 text-white font-semibold text-base"
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            Apoie Nossa Causa
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  )
}

interface StatCardProps {
  value: string
  label: string
  icon: string
  color: string
  isDark: boolean
  delay?: number
}

function StatCard({ value, label, icon, color, isDark, delay = 0 }: StatCardProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.9))
  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"

  useEffect(() => {
    // Delayed animation for each stat card
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    }, delay)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        width: "31%",
      }}
    >
      <View
        className={`px-2 py-4 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-white"}`}
        style={[isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow]}
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
    </Animated.View>
  )
}

const styles = StyleSheet.create({
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
  supportButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  memberImage: {
    borderWidth: 3,
    borderColor: "#6366F1",
  },
})

