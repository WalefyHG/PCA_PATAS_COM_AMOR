"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  image: string
  likes: number
  comments: number
  category?: string
}

export default function Blog() {
  const { isDarkTheme, colors } = useThemeContext()
  const navigation = useNavigation<any>()
  const isWeb = Platform.OS === "web"

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))
  const scrollY = useRef(new Animated.Value(0)).current

  // Header animation
  const headerHeight = 220
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  })

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: "clamp",
  })

  const categories = ["Todos", "Cuidados", "Alimentação", "Adoção", "Comportamento"]
  const [activeCategory, setActiveCategory] = useState("Todos")

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
      category: "Cuidados",
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
      category: "Alimentação",
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
      category: "Adoção",
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
      category: "Comportamento",
    },
    {
      id: "5",
      title: "Sinais de que seu pet precisa ir ao veterinário",
      excerpt: "Aprenda a identificar comportamentos que podem indicar problemas de saúde no seu animal.",
      author: "Dra. Mariana Costa",
      date: "28/06/2023",
      image:
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 142,
      comments: 38,
      category: "Cuidados",
    },
    {
      id: "6",
      title: "Brincadeiras que estimulam a inteligência do seu pet",
      excerpt: "Descubra jogos e atividades que ajudam no desenvolvimento cognitivo de cães e gatos.",
      author: "Ricardo Alves",
      date: "15/07/2023",
      image:
        "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      likes: 95,
      comments: 27,
      category: "Comportamento",
    },
  ])

  const filteredPosts = activeCategory === "Todos" ? posts : posts.filter(post => post.category === activeCategory)

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

  return (
    <View style={{ flex: 1, backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6' }}>
      {/* Collapsible Header */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <LinearGradient
          colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingTop: Platform.select({ ios: 60, android: 40, web: 20 }),
            paddingBottom: 32,
            paddingHorizontal: isWeb ? '20%' : 16
          }}
        >
          <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center' }}>
            <HeaderLayout title="Configurações" />
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
              <Feather name="book-open" size={28} color="white" />
            </View>
            <Text style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              ...Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              }),
            }}>
              Blog Pet
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              marginTop: 8,
              textAlign: 'center',
              ...Platform.select({
                ios: { fontFamily: "San Francisco" },
                android: { fontFamily: "Roboto" },
              }),
            }}>
              Dicas e informações para o bem-estar do seu pet
            </Text>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 8,
              marginTop: 24
            }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: activeCategory === category
                      ? 'white'
                      : 'rgba(255,255,255,0.2)'
                  }
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: activeCategory === category
                        ? (isDarkTheme ? '#111827' : '#111827')
                        : 'white'
                    }
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingHorizontal: isWeb ? '20%' : 16,
          paddingBottom: 40
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {filteredPosts.map((post, index) => (
            <BlogPostCard
              key={post.id}
              post={post}
              index={index}
              isDark={isDarkTheme}
              colors={colors}
              onPress={() => navigation.navigate("BlogPostDetail", { postId: post.id })}
            />
          ))}
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddBlogPost")}
        style={[
          styles.fab,
          {
            backgroundColor: colors.secondary,
            right: isWeb ? (window.innerWidth * 0.2 + 24) : 24
          }
        ]}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
  isDark: boolean;
  colors: { primary: string; secondary: string };
  onPress: () => void;
}

function BlogPostCard({ post, index, isDark, colors, onPress }: BlogPostCardProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.95))

  useEffect(() => {
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
    }, index * 100)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: 24
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.postCard,
          { backgroundColor: isDark ? '#1f2937' : 'white' }
        ]}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${colors.primary}CC` }
              ]}
            >
              <Text style={styles.categoryBadgeText}>{post.category}</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16 }}>
          <Text style={[
            styles.postTitle,
            { color: isDark ? 'white' : '#111827' }
          ]}>
            {post.title}
          </Text>

          <Text
            style={[
              styles.postExcerpt,
              { color: isDark ? '#d1d5db' : '#4b5563' }
            ]}
            numberOfLines={2}
          >
            {post.excerpt}
          </Text>

          <View style={styles.postFooter}>
            <View style={styles.authorInfo}>
              <View style={[
                styles.authorAvatar,
                { backgroundColor: `${colors.secondary}40` }
              ]} />
              <Text style={[
                styles.postMeta,
                { color: isDark ? '#9ca3af' : '#6b7280' }
              ]}>
                {post.author} • {post.date}
              </Text>
            </View>

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <Feather name="heart" size={14} color={colors.secondary} />
                <Text style={[
                  styles.statText,
                  { color: isDark ? '#9ca3af' : '#6b7280' }
                ]}>
                  {post.likes}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Feather name="message-circle" size={14} color={colors.primary} />
                <Text style={[
                  styles.statText,
                  { color: isDark ? '#9ca3af' : '#6b7280' }
                ]}>
                  {post.comments}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  postCard: {
    borderRadius: 12,
    overflow: 'hidden',
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
  postImage: {
    width: '100%',
    height: 200
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  postExcerpt: {
    fontSize: 14,
    marginBottom: 16,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8
  },
  postMeta: {
    fontSize: 12,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    ...Platform.select({
      ios: { fontFamily: "San Francisco" },
      android: { fontFamily: "Roboto" },
    }),
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      }
    })
  }
})