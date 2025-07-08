"use client"

import React, { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet, Linking } from "react-native"
import { useThemeContext } from "../../contexts/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StatCard } from "../../components/AboutUtils"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"

export interface TeamMember {
  id: string
  name: string
  role: string
  photo: string
  bio: string
}

export default function AboutUs() {
  const { isDarkTheme, colors } = useThemeContext()
  const navigation = useNavigation<any>()
  const isWeb = Platform.OS === "web"

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Maria Silva",
      role: "Fundadora & CEO",
      photo: "https://ui-avatars.com/api/?name=Maria+Silva&background=random",
      bio: "Veterinária com mais de 10 anos de experiência e apaixonada por animais desde a infância.",
    },
    // ... outros membros
  ]

  useEffect(() => {
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
    const urls = {
      instagram: "https://instagram.com/patascomamor",
      facebook: "https://facebook.com/patascomamor",
      twitter: "https://twitter.com/patascomamor"
    }
    Linking.openURL(urls[platform as keyof typeof urls] || urls.instagram)
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }}>
      {/* Header */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.select({ ios: 60, android: 40, web: 40 }),
          paddingBottom: 60,
          paddingHorizontal: isWeb ? '20%' : 24
        }}
      >
        <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
          <HeaderLayout title="Sobre" />
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}>
            <Feather name="heart" size={28} color="white" />
          </View>
          <Text style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 'bold',
            ...Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            }),
          }}>
            Patas com Amor
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 16,
            marginTop: 8,
            ...Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            }),
          }}>
            Conectando corações peludos a lares amorosos
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: isWeb ? 24 : 16,
          paddingHorizontal: isWeb ? '20%' : 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Mission Card */}
          <InfoCard
            title="Nossa Missão"
            icon="target"
            content="Transformar a vida de animais abandonados, proporcionando cuidados, amor e a chance de encontrarem famílias que os amem para sempre. Acreditamos que todo animal merece um lar onde seja tratado com respeito e carinho."
            colors={colors}
            isDark={isDarkTheme}
          />

          {/* Stats Section */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 32,
            gap: 16
          }}>
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
          <Text style={[
            styles.sectionTitle,
            { color: isDarkTheme ? 'white' : '#111827' }
          ]}>
            Nossa Equipe
          </Text>

          <View style={{ marginBottom: 32 }}>
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                colors={colors}
                isDark={isDarkTheme}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />
            ))}
          </View>

          {/* History Section */}
          <InfoCard
            title="Nossa História"
            icon="book-open"
            content="Fundada em 2018 por Maria Silva, a Patas com Amor nasceu da paixão por ajudar animais em situação de abandono. O que começou como um pequeno abrigo em São Paulo, hoje se tornou uma organização reconhecida nacionalmente. Ao longo dos anos, expandimos nossas operações para incluir programas de castração, educação sobre posse responsável e parcerias com clínicas veterinárias para atendimento de animais resgatados."
            colors={colors}
            isDark={isDarkTheme}
          />

          {/* Contact Section */}
          <View style={[
            styles.cardContainer,
            { backgroundColor: isDarkTheme ? '#1f2937' : 'white' }
          ]}>
            <View style={styles.cardHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: `${colors.info}20` }
              ]}>
                <Feather name="mail" size={20} color={colors.info} />
              </View>
              <Text style={[
                styles.sectionTitle,
                { color: isDarkTheme ? 'white' : '#111827' }
              ]}>
                Contato
              </Text>
            </View>

            <View style={{ marginVertical: 16 }}>
              <ContactItem
                icon="map-pin"
                text="Av. Paulista, 1000 - São Paulo, SP"
                colors={colors}
                isDark={isDarkTheme}
              />
              <ContactItem
                icon="phone"
                text="(11) 99999-9999"
                colors={colors}
                isDark={isDarkTheme}
              />
              <ContactItem
                icon="mail"
                text="contato@patascomamor.org"
                colors={colors}
                isDark={isDarkTheme}
              />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 16,
              marginTop: 8
            }}>
              <SocialButton
                icon="instagram"
                onPress={() => openSocialMedia("instagram")}
                color={colors.secondary}
              />
              <SocialButton
                icon="facebook"
                onPress={() => openSocialMedia("facebook")}
                color={colors.primary}
              />
              <SocialButton
                icon="twitter"
                onPress={() => openSocialMedia("twitter")}
                color={colors.info}
              />
            </View>
          </View>

          {/* Support Button */}
          <TouchableOpacity
            style={[
              styles.supportButton,
              { backgroundColor: colors.secondary }
            ]}
            onPress={() => navigation.navigate("Donate")}
          >
            <Feather name="heart" size={20} color="white" />
            <Text style={styles.supportButtonText}>
              Apoie Nossa Causa
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

// Componentes auxiliares reutilizáveis
function InfoCard({ title, icon, content, colors, isDark }: {
  title: string
  icon: string
  content: string
  colors: any
  isDark: boolean
}) {
  return (
    <View style={[
      styles.cardContainer,
      {
        backgroundColor: isDark ? '#1f2937' : 'white',
        marginBottom: 24
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${colors.primary}20` }
        ]}>
          <Feather name={icon as any} size={20} color={colors.primary} />
        </View>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? 'white' : '#111827' }
        ]}>
          {title}
        </Text>
      </View>
      <Text style={[
        styles.cardContent,
        { color: isDark ? '#d1d5db' : '#4b5563' }
      ]}>
        {content}
      </Text>
    </View>
  )
}

function TeamMemberCard({ member, index, colors, isDark, fadeAnim, slideAnim }: {
  member: TeamMember
  index: number
  colors: any
  isDark: boolean
  fadeAnim: Animated.Value
  slideAnim: Animated.Value
}) {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }],
        marginBottom: 16
      }}
    >
      <View style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#1f2937' : 'white',
          flexDirection: 'row',
          padding: 16
        }
      ]}>
        <Image
          source={{ uri: member.photo }}
          style={[
            styles.memberImage,
            { borderColor: colors.primary }
          ]}
        />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={[
            styles.memberName,
            { color: isDark ? 'white' : '#111827' }
          ]}>
            {member.name}
          </Text>
          <Text style={[
            styles.memberRole,
            { color: colors.primary }
          ]}>
            {member.role}
          </Text>
          <Text style={[
            styles.memberBio,
            { color: isDark ? '#d1d5db' : '#4b5563' }
          ]}>
            {member.bio}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

function ContactItem({ icon, text, colors, isDark }: {
  icon: string
  text: string
  colors: any
  isDark: boolean
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    }}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={[
        styles.contactText,
        { color: isDark ? '#d1d5db' : '#4b5563' }
      ]}>
        {text}
      </Text>
    </View>
  )
}

function SocialButton({ icon, onPress, color }: {
  icon: string
  onPress: () => void
  color: string
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.socialButton,
        { backgroundColor: `${color}20` }
      ]}
    >
      <Feather name={icon as any} size={22} color={color} />
    </TouchableOpacity>
  )
}

// Estilos
const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 22,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  memberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  memberRole: {
    fontSize: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  memberBio: {
    fontSize: 13,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      }
    })
  },
  supportButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  }
})