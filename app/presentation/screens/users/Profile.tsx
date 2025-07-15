"use client"

import { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../contexts/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { db, auth } from "../../../data/datasources/firebase/firebase"
import { getDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"

interface User {
  uid: string
  first_name?: string
  last_name?: string
  displayName?: string
  email?: string
  photoURL?: string
  bio?: string
  pets?: number
  donations?: number
  adoptions?: number
}

export default function Profile() {
  const { isDarkTheme, colors } = useThemeContext()
  const navigation = useNavigation<any>()
  const route = useRoute<{ key: string; name: string; params: { id?: string } }>()
  const isWeb = Platform.OS === "web"

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))

  // Aguarda a inicialização do Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Só executa quando o auth estiver pronto
    if (!authReady) return

    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Aguarda um pouco mais para garantir que o currentUser está disponível
        let userId = route.params?.id

        if (!userId) {
          // Se não tem ID na rota, usa o usuário atual
          // Aguarda um pouco para garantir que currentUser está disponível
          let attempts = 0
          while (!auth.currentUser && attempts < 10) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            attempts++
          }
          userId = auth.currentUser?.uid
        }

        if (!userId) {
          console.log("No user ID available")
          setLoading(false)
          return
        }

        console.log("Fetching user data for ID:", userId)

        const userDoc = await getDoc(doc(db, "users", userId))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log("User data fetched:", userData)

          setUser({
            uid: userId,
            ...userData,
            bio: userData.bio || "Amante de animais e voluntário em abrigos de pets.",
            pets: userData.pets || 2,
            donations: userData.donations || 5,
            adoptions: userData.adoptions || 1,
          })
        } else {
          console.log("User document does not exist")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)

        // Inicia as animações
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
      }
    }

    fetchUserData()
  }, [authReady, route.params])

  if (loading || !authReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#111827" : "#f9fafb" }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12, padding: 24, alignItems: "center" }}
        >
          <View style={styles.loadingDots}>
            {[colors.primary, colors.secondary, colors.primary].map((color, index) => (
              <Animated.View key={index} style={[styles.loadingDot, { backgroundColor: "white", opacity: 0.8 }]} />
            ))}
          </View>
          <Text style={[styles.loadingText, { color: "white" }]}>Carregando perfil...</Text>
        </LinearGradient>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDarkTheme ? "#111827" : "#f9fafb" }]}>
        <Feather name="user-x" size={64} color={isDarkTheme ? "#6b7280" : "#9ca3af"} />
        <Text style={[styles.errorText, { color: isDarkTheme ? "white" : "#1f2937" }]}>Usuário não encontrado</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? "#111827" : "#f9fafb" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 16, position: "relative" }}
        >

          {/* HeaderLayout posicionado absolutamente na direita */}
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 20,
              flexDirection: "row",
              alignSelf: "flex-end",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <HeaderLayout title="Perfil" />
          </View>
        </LinearGradient>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
        >
          {/* Profile Image */}
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri:
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.displayName || "User")}&background=random`,
                }}
                style={styles.profileImage}
              />
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDarkTheme ? "white" : "#1f2937" }]}>
              {user.first_name || user.displayName || "Usuário"}
              {user.last_name ? ` ${user.last_name}` : ""}
            </Text>
            <Text style={[styles.profileBio, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>{user.bio}</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <StatCard icon="heart" value={user.pets} label="Pets" color={colors.secondary} isDark={isDarkTheme} />
              <StatCard
                icon="gift"
                value={user.donations}
                label="Doações"
                color={colors.primary}
                isDark={isDarkTheme}
              />
              <StatCard icon="home" value={user.adoptions} label="Adoções" color="#10b981" isDark={isDarkTheme} />
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.divider, { backgroundColor: isDarkTheme ? "#374151" : "#e5e7eb" }]} />
              <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                Informações de Contato
              </Text>
              <View style={[styles.divider, { backgroundColor: isDarkTheme ? "#374151" : "#e5e7eb" }]} />
            </View>

            <View style={[styles.card, { backgroundColor: isDarkTheme ? "#1f2937" : "white" }]}>
              <View style={styles.contactItem}>
                <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Feather name="mail" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>Email</Text>
                  <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                    {user.email || "Email não disponível"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("AddUsers", { userId: user.uid })}
          >
            <Feather name="edit-3" size={20} color="white" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

interface StatCardProps {
  icon: string
  value?: number
  label: string
  color: string
  isDark: boolean
}

function StatCard({ icon, value = 0, label, color, isDark }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? "#1f2937" : "white" }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? "white" : "#1f2937" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? "#9ca3af" : "#6b7280" }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "600",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  profileImageWrapper: {
    alignItems: "center",
    marginTop: -60,
  },
  profileImageContainer: {
    padding: 4,
    borderRadius: 64,
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 24,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  profileBio: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  statsContainer: {
    marginVertical: 24,
    gap: 16,
    paddingHorizontal: 0,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
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
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  section: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  card: {
    borderRadius: 12,
    padding: 16,
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
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 12,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "500",
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
})
