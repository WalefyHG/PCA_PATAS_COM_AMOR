"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { db, auth } from "../../config/firebase"
import { getDoc, doc } from "firebase/firestore"
import { useNavigation, useRoute } from "@react-navigation/native"

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
  const { paperTheme } = useThemeContext()
  const router = useNavigation()
  const route = useRoute<{ key: string; name: string; params: { id?: string } }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
            // Dados fictícios para demonstração
            bio: userData.bio || "Amante de animais e voluntário em abrigos de pets.",
            pets: userData.pets || 2,
            donations: userData.donations || 5,
            adoptions: userData.adoptions || 1,
          })
        } else {
          console.log("No such document!")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [route.params])

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: paperTheme.colors.onBackground }}>Carregando...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: paperTheme.colors.onBackground }}>Usuário não encontrado</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: paperTheme.colors.primary, marginTop: 16 }]}
          onPress={() => router.goBack()}
        >
          <Text style={{ color: paperTheme.colors.onPrimary }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={{ backgroundColor: paperTheme.colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{
              uri:
                user.photoURL ||
                "https://ui-avatars.com/api/?name=" +
                (user.first_name || user.displayName || "User") +
                "&background=random",
            }}
            style={styles.profileImage}
          />
          <Text style={[styles.userName, { color: paperTheme.colors.onBackground }]}>
            {user.first_name || user.displayName || "Usuário"}
            {user.last_name ? ` ${user.last_name}` : ""}
          </Text>
          <Text style={[styles.userBio, { color: paperTheme.colors.onBackground }]}>{user.bio}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: paperTheme.colors.surface }]}>
            <Feather name="heart" size={24} color={paperTheme.colors.primary} />
            <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>{user.pets}</Text>
            <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Pets</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: paperTheme.colors.surface }]}>
            <Feather name="gift" size={24} color={paperTheme.colors.primary} />
            <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>{user.donations}</Text>
            <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Doações</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: paperTheme.colors.surface }]}>
            <Feather name="home" size={24} color={paperTheme.colors.primary} />
            <Text style={[styles.statValue, { color: paperTheme.colors.onSurface }]}>{user.adoptions}</Text>
            <Text style={[styles.statLabel, { color: paperTheme.colors.onSurfaceVariant }]}>Adoções</Text>
          </View>
        </View>

        <View style={[styles.section, { borderColor: paperTheme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: paperTheme.colors.onBackground }]}>Informações de Contato</Text>

          <View style={styles.infoItem}>
            <Feather name="mail" size={18} color={paperTheme.colors.primary} />
            <Text style={[styles.infoText, { color: paperTheme.colors.onBackground }]}>
              {user.email || "Email não disponível"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: paperTheme.colors.primary }]}
          onPress={() => router.navigate('Settings' as never)}
        >
          <Feather name="edit-2" size={16} color={paperTheme.colors.onPrimary} />
          <Text style={[styles.editButtonText, { color: paperTheme.colors.onPrimary }]}>Editar Perfil</Text>
        </TouchableOpacity>
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
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: 100,
  },
})
