"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Text, View, ScrollView, Platform, SafeAreaView, StatusBar, Animated, StyleSheet, TouchableOpacity, Image, RefreshControl } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { db, auth } from "../../../data/datasources/firebase/firebase"
import { getDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useThemeContext } from "../../contexts/ThemeContext"
import NavigationCard from "../../components/NavigationCards"
import * as petRepository from "@/app/repositories/FirebasePetRepository"
import * as blogRepository from "@/app/repositories/FirebaseBlogRepository"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"
import NavBar from "../../components/NavBar"
import { Feather } from "@expo/vector-icons"
import { BlogPost } from "@/app/domain/entities/Blog"
import { Pet } from "@/app/domain/entities/Pet"
import { useAuth } from "../../contexts/AuthContext"

interface User {
  uid: string
  first_name?: string
  displayName?: string
  photoURL?: string
  name?: string

}
export default function Home() {
  const { isDarkTheme, colors } = useThemeContext()
  const navigation = useNavigation<any>()
  const [user, setUser] = useState<User | null>(null)
  const isWeb = Platform.OS === "web"

  const [refreshing, setRefreshing] = useState(false)
  const [recentPets, setRecentPets] = useState<Pet[]>([])
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const fadeAnim = useRef(new Animated.Value(0)).current

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
            setUser({ uid: currentUser.uid, first_name: userData.first_name, displayName: userData.displayName, photoURL: userData.photoURL, name: userData.name })
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


  const loadData = async () => {
    try {
      const [pets, posts] = await Promise.all([petRepository.getPets("", "", 3), blogRepository.getBlogPosts("", 3)])
      setRecentPets(pets)
      setRecentPosts(posts)
    } catch (error) {
      console.error("Error loading home data:", error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, []),
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName)
  }

  const handleViewAllPets = () => {
    navigation.navigate("Adopt" as never)
  }

  const handleViewAllNews = () => {
    navigation.navigate("News" as never)
  }

  const handlePetPress = (pet: Pet) => {
    navigation.navigate("AdoptionDetails" as never, { pet } as never)
  }

  const handlePostPress = (post: BlogPost) => {
    navigation.navigate("NewsDetails" as never, { post } as never)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB",
    },
    content: {
      flex: 1,
    },
    welcomeSection: {
      padding: 20,
    },
    welcomeCard: {
      backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    welcomeHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    profilePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    welcomeText: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
    },
    userName: {
      fontSize: 16,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
    },
    modeIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    modeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 4,
    },
    welcomeDescription: {
      fontSize: 14,
      color: isDarkTheme ? "#D1D5DB" : "#374151",
      lineHeight: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDarkTheme ? "#FFFFFF" : "#1F2937",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    viewAllText: {
      fontSize: 14,
      color: colors.primary,
      marginRight: 4,
    },
    horizontalList: {
      paddingLeft: 20,
    },
    petCard: {
      width: 200,
      backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      marginRight: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    petImage: {
      width: "100%",
      height: 120,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    petInfo: {
      padding: 12,
    },
    petName: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkTheme ? "#FFFFFF" : "#1F2937",
      marginBottom: 4,
    },
    petDetails: {
      fontSize: 12,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
    },
    postCard: {
      width: 280,
      backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
      borderRadius: 12,
      marginRight: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    postImage: {
      width: "100%",
      height: 100,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    postInfo: {
      padding: 12,
    },
    postTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: isDarkTheme ? "#FFFFFF" : "#1F2937",
      marginBottom: 4,
    },
    postDate: {
      fontSize: 12,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
    },
    emptyState: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
    },
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkTheme ? '#1a202c' : '#f8fafc' }}>
      <StatusBar
        barStyle={isDarkTheme ? "light-content" : "dark-content"}
        backgroundColor={isDarkTheme ? colors.background.dark : colors.background.light}
      />
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.select({ ios: 64, android: 40, web: 80 }),
          paddingBottom: 32,
          paddingHorizontal: 16
        }}
      >
        <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
          <HeaderLayout title="Profile" />
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Feather name={"user"} size={24} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.welcomeText}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={styles.greeting}>{getGreeting()},</Text>
                  <Text style={styles.userName}>{user?.displayName}</Text>
                </View>
                <Text style={styles.welcomeDescription}>
                  "Encontre seu novo melhor amigo e faça a diferença na vida de um animal."
                </Text>
              </View>
            </View>
          </View>

          {/* Card de Navegação */}
          <View style={{
            flexDirection: isWeb ? 'row' : 'row',
            flexWrap: isWeb ? 'wrap' : 'wrap',
            justifyContent: isWeb ? 'center' : 'space-between',
            paddingHorizontal: isWeb ? 20 : 16,
            marginBottom: 16,
          }}>
            <NavigationCard
              title="Adote"
              icon="heart"
              onPress={() => navigateToScreen("Adopt")}
              platform={Platform.OS} />
            <NavigationCard
              title="Blog"
              icon="book-open"
              onPress={() => navigateToScreen("News")}
              platform={Platform.OS} />
            <NavigationCard
              title="Perfil"
              icon="user"
              onPress={() => navigateToScreen("Profile")}
              platform={Platform.OS} />
            <NavigationCard
              title="Configurações"
              icon="settings"
              onPress={() => navigateToScreen("Settings")}
              platform={Platform.OS} />
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pets Recentes</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllPets}>
                <Text style={styles.viewAllText}>Ver todos</Text>
                <Feather name="arrow-right" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {recentPets.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {recentPets.map((pet) => (
                  <TouchableOpacity key={pet.id} style={styles.petCard} onPress={() => handlePetPress(pet)}>
                    <Image
                      source={{ uri: pet.images?.[0] ?? "https://via.placeholder.com/200x120.png?text=Pet" }}
                      style={styles.petImage} />
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petDetails}>
                        {pet.species} • {pet.age} • {pet.size}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Feather name="heart" size={48} color={isDarkTheme ? "#374151" : "#D1D5DB"} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>Nenhum pet disponível no momento</Text>
              </View>
            )}
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notícias Recentes</Text>
              <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllNews}>
                <Text style={styles.viewAllText}>Ver todas</Text>
                <Feather name="arrow-right" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {recentPosts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {recentPosts.map((post) => (
                  <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => handlePostPress(post)}>
                    <Image
                      source={{ uri: post.image || "/placeholder.svg?height=100&width=280" }}
                      style={styles.postImage} />
                    <View style={styles.postInfo}>
                      <Text style={styles.postTitle}>{post.title}</Text>
                      <Text style={styles.postDate}>{post.createdAt?.toLocaleDateString("pt-BR")}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="file-text"
                  size={48}
                  color={isDarkTheme ? "#374151" : "#D1D5DB"}
                  style={styles.emptyIcon} />
                <Text style={styles.emptyText}>Nenhuma notícia disponível no momento</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
