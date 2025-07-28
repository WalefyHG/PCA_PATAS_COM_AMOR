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
import { useAccount } from "../../contexts/AccountContext"
import { ongRepository } from "../../../repositories/FirebaseOngRepository"
import { clinicRepository } from "../../../repositories/FirebaseClinicRepository"
import type { Ong } from "../../../domain/entities/Ongs"
import type { Clinic } from "../../../domain/entities/Clinic"
import ModernLoading from "../../components/ModernLoading"

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
  const { currentAccount } = useAccount()
  const isWeb = Platform.OS === "web"

  const [profileData, setProfileData] = useState<User | Ong | Clinic | null>(null)
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
    if (!authReady || !currentAccount) return

    const fetchProfileData = async () => {
      try {
        setLoading(true)

        let data = null

        switch (currentAccount.type) {
          case "user":
            // Buscar dados do usuário
            const userDoc = await getDoc(doc(db, "users", currentAccount.profileId))
            if (userDoc.exists()) {
              data = {
                uid: currentAccount.profileId,
                ...userDoc.data(),
                bio: userDoc.data().bio || "Amante de animais e voluntário em abrigos de pets.",
                pets: userDoc.data().pets || 2,
                donations: userDoc.data().donations || 5,
                adoptions: userDoc.data().adoptions || 1,
              }
            }
            break

          case "ong":
            // Buscar dados da ONG
            data = await ongRepository.getOngById(currentAccount.profileId)
            break

          case "clinic":
            // Buscar dados da clínica
            data = await clinicRepository.getClinicById(currentAccount.profileId)
            break
        }

        setProfileData(data)
      } catch (error) {
        console.error("Error fetching profile data:", error)
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

    fetchProfileData()
  }, [authReady, currentAccount])

  const handleEdit = () => {
    switch (currentAccount.type) {
      case "user":
        navigation.navigate("AddUsers", { userId: currentAccount.profileId })
        break
      case "ong":
        navigation.navigate("RegisterOng", { ong: profileData })
        break
      case "clinic":
        navigation.navigate("RegisterClinic", { clinic: profileData })
        break
    }
  }

  const getProfileImage = () => {
    if (currentAccount.type === "user") {
      const userData = profileData as User
      return (
        userData?.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          userData?.first_name || userData?.displayName || "User",
        )}&background=random`
      )
    } else if (currentAccount.type === "ong") {
      const ongData = profileData as Ong
      return (
        ongData?.logoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(ongData?.name || "ONG")}&background=random`
      )
    } else if (currentAccount.type === "clinic") {
      const clinicData = profileData as Clinic
      return (
        clinicData?.logoUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(clinicData?.name || "Clinic")}&background=random`
      )
    }
    return `https://ui-avatars.com/api/?name=User&background=random`
  }

  const getProfileName = () => {
    if (currentAccount.type === "user") {
      const userData = profileData as User
      return `${userData?.first_name || userData?.displayName || "Usuário"}${userData?.last_name ? ` ${userData.last_name}` : ""}`
    } else if (currentAccount.type === "ong") {
      const ongData = profileData as Ong
      return ongData?.name || "ONG"
    } else if (currentAccount.type === "clinic") {
      const clinicData = profileData as Clinic
      return clinicData?.name || "Clínica"
    }
    return "Perfil"
  }

  const getProfileDescription = () => {
    if (currentAccount.type === "user") {
      const userData = profileData as User
      return userData?.bio || "Amante de animais e voluntário em abrigos de pets."
    } else if (currentAccount.type === "ong") {
      const ongData = profileData as Ong
      return ongData?.description || "Organização dedicada ao bem-estar animal."
    } else if (currentAccount.type === "clinic") {
      const clinicData = profileData as Clinic
      return clinicData?.description || "Clínica veterinária dedicada ao cuidado animal."
    }
    return "Descrição não disponível"
  }

  const getAccountTypeIcon = () => {
    switch (currentAccount.type) {
      case "user":
        return "user"
      case "ong":
        return "heart"
      case "clinic":
        return "activity"
      default:
        return "user"
    }
  }

  const getAccountTypeName = () => {
    switch (currentAccount.type) {
      case "user":
        return "Usuário"
      case "ong":
        return "ONG"
      case "clinic":
        return "Clínica Veterinária"
      default:
        return "Conta"
    }
  }

  const renderContactInfo = () => {
    if (currentAccount.type === "user") {
      const userData = profileData as User
      return (
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
                  {userData?.email || "Email não disponível"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )
    } else if (currentAccount.type === "ong") {
      const ongData = profileData as Ong
      return (
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
                  {ongData?.email}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="phone" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>Telefone</Text>
                <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                  {ongData?.phone}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="file-text" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>CNPJ</Text>
                <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>{ongData?.cnpj}</Text>
              </View>
            </View>
          </View>
        </View>
      )
    } else if (currentAccount.type === "clinic") {
      const clinicData = profileData as Clinic
      return (
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
                  {clinicData?.email}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="phone" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>Telefone</Text>
                <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                  {clinicData?.phone}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="map-pin" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>Endereço</Text>
                <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                  {clinicData?.address}
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="award" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactLabel, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>CRMV</Text>
                <Text style={[styles.contactValue, { color: isDarkTheme ? "white" : "#1f2937" }]}>
                  {clinicData?.crmv}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )
    }
  }

  const renderStats = () => {
    if (currentAccount.type === "user") {
      const userData = profileData as User
      return (
        <View style={styles.statsContainer}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <StatCard
              icon="heart"
              value={userData?.pets || 0}
              label="Pets"
              color={colors.secondary}
              isDark={isDarkTheme}
            />
            <StatCard
              icon="gift"
              value={userData?.donations || 0}
              label="Doações"
              color={colors.primary}
              isDark={isDarkTheme}
            />
            <StatCard
              icon="home"
              value={userData?.adoptions || 0}
              label="Adoções"
              color="#10b981"
              isDark={isDarkTheme}
            />
          </View>
        </View>
      )
    }
    return null
  }

  if (loading || !authReady) {
    return (
      <ModernLoading
        isDarkTheme={isDarkTheme}
        colors={colors}
        loading={loading}
        authReady={authReady}
      />
    )
  }

  if (!profileData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDarkTheme ? "#111827" : "#f9fafb" }]}>
        <Feather name="user-x" size={64} color={isDarkTheme ? "#6b7280" : "#9ca3af"} />
        <Text style={[styles.errorText, { color: isDarkTheme ? "white" : "#1f2937" }]}>Perfil não encontrado</Text>
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
              <Image source={{ uri: getProfileImage() }} style={styles.profileImage} />
              {/* Account type indicator */}
              <View style={[styles.accountTypeIndicator, { backgroundColor: colors.primary }]}>
                <Feather name={getAccountTypeIcon() as any} size={16} color="white" />
              </View>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDarkTheme ? "white" : "#1f2937" }]}>{getProfileName()}</Text>
            <Text style={[styles.accountType, { color: colors.primary }]}>{getAccountTypeName()}</Text>
            <Text style={[styles.profileBio, { color: isDarkTheme ? "#9ca3af" : "#6b7280" }]}>
              {getProfileDescription()}
            </Text>
          </View>

          {/* Stats Section (only for users) */}
          {renderStats()}

          {/* Contact Section */}
          {renderContactInfo()}

          {/* Edit Profile Button */}
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={handleEdit}>
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
    position: "relative",
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
  accountTypeIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
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
  accountType: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 8,
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
    marginBottom: 16,
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
