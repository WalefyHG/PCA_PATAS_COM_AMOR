"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import FloatingActionButton from "../../components/FloatingButton"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  image: string
  likes: number
  comments: number
}

export default function Blog() {
  const { paperTheme } = useThemeContext()
  const navigation = useNavigation<any>()

  const [posts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "Como cuidar de filhotes recém-nascidos",
      excerpt: "Aprenda os cuidados essenciais para filhotes de cães e gatos nas primeiras semanas de vida.",
      author: "Dra. Ana Silva",
      date: "15/04/2023",
      image:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 124,
      comments: 32,
    },
    {
      id: "2",
      title: "Alimentação saudável para pets idosos",
      excerpt: "Descubra como adaptar a dieta do seu animal de estimação conforme ele envelhece.",
      author: "Dr. Carlos Mendes",
      date: "03/05/2023",
      image:
        "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 98,
      comments: 17,
    },
    {
      id: "3",
      title: "Benefícios da adoção responsável",
      excerpt: "Entenda por que adotar um animal abandonado pode transformar não só a vida dele, mas também a sua.",
      author: "Patrícia Oliveira",
      date: "22/05/2023",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 215,
      comments: 45,
    },
    {
      id: "4",
      title: "Dicas para socializar seu pet",
      excerpt: "Aprenda técnicas para ajudar seu animal a se relacionar melhor com outros pets e pessoas.",
      author: "João Pereira",
      date: "10/06/2023",
      image:
        "https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 87,
      comments: 23,
    },
  ])

  return (
    <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
      <ScrollView>

        <View style={styles.container}>
          <Text style={[styles.subtitle, { color: paperTheme.colors.onBackground }]}>
            Dicas e informações para o bem-estar do seu pet
          </Text>

          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[
                styles.postCard,
                { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
              ]}
            >
              <Image source={{ uri: post.image }} style={styles.postImage} />
              <View style={styles.postInfo}>
                <Text style={[styles.postTitle, { color: paperTheme.colors.onSurface }]}>{post.title}</Text>
                <Text style={[styles.postExcerpt, { color: paperTheme.colors.onSurfaceVariant }]} numberOfLines={2}>
                  {post.excerpt}
                </Text>
                <View style={styles.postMeta}>
                  <Text style={[styles.postAuthor, { color: paperTheme.colors.onSurfaceVariant }]}>
                    Por {post.author} • {post.date}
                  </Text>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <Feather name="heart" size={14} color={paperTheme.colors.primary} />
                      <Text style={[styles.statText, { color: paperTheme.colors.onSurfaceVariant }]}>{post.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Feather name="message-circle" size={14} color={paperTheme.colors.primary} />
                      <Text style={[styles.statText, { color: paperTheme.colors.onSurfaceVariant }]}>
                        {post.comments}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Botão de adicionar post */}
      <FloatingActionButton
        onPress={() => navigation.navigate("AddBlogPost")}
        icon="plus"
        label="Novo post"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40, // Para manter o título centralizado
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  postImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  postInfo: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postAuthor: {
    fontSize: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
})
