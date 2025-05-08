"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, Platform, Animated, StyleSheet } from "react-native"
import { useThemeContext } from "../../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

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

  // Animated values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))
  const scrollY = useRef(new Animated.Value(0)).current

  // Header animation values
  const headerHeight = 220 // Approximate header height
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

  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"
  const isWeb = Platform.OS === "web"

  const [activeCategory, setActiveCategory] = useState("Todos")
  const categories = ["Todos", "Cuidados", "Alimentação", "Adoção", "Comportamento"]

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

  const filteredPosts = activeCategory === "Todos" ? posts : posts.filter((post) => post.category === activeCategory)

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

  return (
    <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Collapsible Header with gradient */}
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
          className="pt-16 pb-8 px-4"
        >

          <Text className="text-white/80 text-base mt-4 text-center px-8">
            Dicas e informações para o bem-estar do seu pet
          </Text>

          {/* Categories Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-6"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                className={`px-4 py-2 mx-2 rounded-full ${activeCategory === category ? "bg-white" : "bg-white/20"}`}
              >
                <Text
                  className={`font-medium ${activeCategory === category ? (isDarkTheme ? "text-gray-900" : "text-gray-900") : "text-white"
                    }`}
                  style={Platform.select({
                    ios: { fontFamily: "San Francisco" },
                    android: { fontFamily: "Roboto" },
                  })}
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-4 pt-4 pb-20"
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
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.secondary,
          ...styles.fabShadow,
        }}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )
}

interface BlogPostCardProps {
  post: BlogPost
  index: number
  isDark: boolean
  colors: any
  onPress: () => void
}

function BlogPostCard({ post, index, isDark, colors, onPress }: BlogPostCardProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))

  const isIOS = Platform.OS === "ios"
  const isAndroid = Platform.OS === "android"

  useEffect(() => {
    // Staggered animation for each card
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]).start()
    }, index * 100) // Stagger based on index

    return () => clearTimeout(timeout)
  }, [])

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        className={`mb-6 rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
      >
        <View className="relative">
          <Image source={{ uri: post.image }} className="w-full h-48 object-cover" />
          {post.category && (
            <View
              className="absolute top-3 left-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: `${colors.primary}CC` }}
            >
              <Text className="text-white text-xs font-medium">{post.category}</Text>
            </View>
          )}
        </View>

        <View className="p-4">
          <Text
            className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            {post.title}
          </Text>

          <Text
            className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            numberOfLines={2}
            style={Platform.select({
              ios: { fontFamily: "San Francisco" },
              android: { fontFamily: "Roboto" },
            })}
          >
            {post.excerpt}
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="w-6 h-6 rounded-full bg-gray-300 mr-2"
                style={{ backgroundColor: `${colors.secondary}40` }}
              />
              <Text
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                style={Platform.select({
                  ios: { fontFamily: "San Francisco" },
                  android: { fontFamily: "Roboto" },
                })}
              >
                {post.author} • {post.date}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="flex-row items-center mr-3">
                <Feather name="heart" size={14} color={colors.secondary} />
                <Text className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.likes}</Text>
              </View>

              <View className="flex-row items-center">
                <Feather name="message-circle" size={14} color={colors.primary} />
                <Text className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.comments}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
  fabShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
})
