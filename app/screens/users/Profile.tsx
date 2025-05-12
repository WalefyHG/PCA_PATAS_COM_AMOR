"use client"

import { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { db, auth } from "../../config/firebase"
import { getDoc, doc } from "firebase/firestore"
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
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = route.params?.id || auth.currentUser?.uid
        if (!userId) {
          setLoading(false)
          return
        }

        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            uid: userId,
            ...userData,
            bio: userData.bio || "Amante de animais e voluntário em abrigos de pets.",
            pets: userData.pets || 2,
            donations: userData.donations || 5,
            adoptions: userData.adoptions || 1,
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
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
  }, [route.params])

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }]}>
        <View style={styles.loadingDots}>
          {[colors.primary, colors.secondary, colors.primary].map((color, index) => (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  backgroundColor: color,
                  opacity: fadeAnim,
                  transform: [{ scale: fadeAnim }],
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.loadingText, { color: isDarkTheme ? 'white' : '#111827' }]}>
          Carregando...
        </Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }]}>
        <Feather name="user-x" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: isDarkTheme ? 'white' : '#111827' }]}>
          Usuário não encontrado
        </Text>
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
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }}>
      {/* Header with gradient */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.select({ ios: 60, android: 40, web: 20 }),
          paddingBottom: 80,
          paddingHorizontal: isWeb ? '20%' : 0,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24
        }}
      >
        <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
          <HeaderLayout title="Profile" />
        </View>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Image */}
          <View style={styles.profileImageWrapper}>
            <View style={[
              styles.profileImageContainer,
              { backgroundColor: isDarkTheme ? '#1f2937' : 'white' },
            ]}>
              <Image
                source={{
                  uri: user.photoURL || `https://ui-avatars.com/api/?name=${user.first_name || user.displayName || "User"}&background=random`,
                }}
                style={styles.profileImage}
              />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: isWeb ? '20%' : 16,
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[
              styles.profileName,
              { color: colors.primary }
            ]}>
              {user.first_name || user.displayName || "Usuário"}
              {user.last_name ? ` ${user.last_name}` : ""}
            </Text>
            <Text style={[
              styles.profileBio,
              { color: isDarkTheme ? '#d1d5db' : '#4b5563' }
            ]}>
              {user.bio}
            </Text>
          </View>

          {/* Stats Section */}
          <View style={[
            styles.statsContainer,
            isWeb ? { flexDirection: 'row' } : { flexDirection: 'column' }
          ]}>
            <StatCard
              icon="heart"
              value={user.pets}
              label="Pets"
              color={colors.secondary}
              isDark={isDarkTheme}
            />
            <StatCard
              icon="gift"
              value={user.donations}
              label="Doações"
              color={colors.primary}
              isDark={isDarkTheme}
            />
            <StatCard
              icon="home"
              value={user.adoptions}
              label="Adoções"
              color={colors.info}
              isDark={isDarkTheme}
            />
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.divider} />
              <Text style={[
                styles.sectionTitle,
                { color: isDarkTheme ? 'white' : '#111827' }
              ]}>
                Informações de Contato
              </Text>
              <View style={styles.divider} />
            </View>

            <View style={[
              styles.card,
              { backgroundColor: isDarkTheme ? '#1f2937' : 'white' }
            ]}>
              <View style={styles.contactItem}>
                <View style={[
                  styles.contactIcon,
                  { backgroundColor: `${colors.primary}20` }
                ]}>
                  <Feather name="mail" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[
                    styles.contactLabel,
                    { color: isDarkTheme ? '#9ca3af' : '#6b7280' }
                  ]}>
                    Email
                  </Text>
                  <Text style={[
                    styles.contactValue,
                    { color: isDarkTheme ? 'white' : '#111827' }
                  ]}>
                    {user.email || "Email não disponível"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Feather name="edit-2" size={20} color="white" />
            <Text style={styles.editButtonText}>
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

interface StatCardProps {
  icon: string;
  value?: number;
  label: string;
  color: string;
  isDark: boolean;
}

function StatCard({ icon, value = 0, label, color, isDark }: StatCardProps) {
  return (
    <View style={[
      styles.statCard,
      { backgroundColor: isDark ? '#1f2937' : 'white' }
    ]}>
      <View style={[
        styles.statIcon,
        { backgroundColor: `${color}20` }
      ]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>
      <Text style={[
        styles.statLabel,
        { color: isDark ? '#9ca3af' : '#6b7280' }
      ]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loadingDot: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  errorText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: 20
  },
  profileImageContainer: {
    padding: 4,
    borderRadius: 64,
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      }
    })
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 24
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  statsContainer: {
    marginVertical: 24,
    gap: 16,
    paddingHorizontal: 16
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginVertical: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    })
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
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
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
      }
    })
  },
  editButtonText: {
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