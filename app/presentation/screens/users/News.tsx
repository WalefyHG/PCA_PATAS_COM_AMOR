"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../contexts/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "@/app/utils/HeaderLayout"
import { getBlogPosts } from "@/app/repositories/FirebaseBlogRepository"

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

  const [posts, setPosts] = useState<BlogPost[]>()

  useEffect(() => {
    // Simulate fetching posts from an API
    const fetchPosts = async () => {
      const response = await getBlogPosts(activeCategory)
      console.log("Fetched posts:", response)
      const mapped = (response as any[]).map(post => ({
        ...post,
        date: post.date?.toDate?.().toLocaleDateString?.("pt-BR") || "Data inválida"
      }))
      setPosts(mapped)
    }

    fetchPosts()
  }, [activeCategory])

  const filteredPosts = activeCategory === "Todos"
    ? (posts ?? [])
    : (posts ?? []).filter(post => post.category === activeCategory)

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
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 }}>
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
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              alignContent: 'center',
              paddingHorizontal: 8,
              marginTop: 24,
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
  const router = useNavigation<any>()


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

  const handlePress = () => {
    router.navigate("NewsDetails", { postId: post.id })
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: 24
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
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