"use client"

import { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
    Animated,
    StyleSheet,
    Share,
    TextInput,
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import HeaderLayout from "../utils/HeaderLayout"
import { getBlogPostById } from "../config/firebase"

interface BlogPostDetail {
    id: string
    title: string
    content: string
    excerpt: string
    author: string
    authorAvatar: string
    date: string
    image: string
    likes: number
    comments: number
    category?: string
    readTime?: string
}

interface Comment {
    id: string
    author: string
    authorAvatar: string
    date: string
    content: string
    likes: number
}

export default function BlogPostDetail() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()
    const route = useRoute<any>()
    const { postId } = route.params || {}

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))
    const scrollY = useRef(new Animated.Value(0)).current

    // Header animation values
    const headerHeight = 300 // Approximate header height with image
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.5, headerHeight],
        outputRange: [0, 0.5, 1],
        extrapolate: "clamp",
    })

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.5, headerHeight],
        outputRange: [1, 0.5, 0],
        extrapolate: "clamp",
    })

    const imageTranslateY = scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, headerHeight * 0.5],
        extrapolate: "clamp",
    })

    const [post, setPost] = useState<BlogPostDetail | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [isLiked, setIsLiked] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"
    const isWeb = Platform.OS === "web"

    useEffect(() => {
        // Fetch post data based on postId
        // This is a mock implementation
        const fetchPost = async () => {
            const response = await getBlogPostById(postId)
            if (response && typeof response.id === "string") {
                setPost({
                    ...response,
                    id: response.id ?? "",
                    authorAvatar: response.authorAvatar ?? "https://ui-avatars.com/api/?name=Autor&background=random",
                    date: response.date
                        ? typeof response.date === "string"
                            ? response.date
                            : response.date instanceof Date
                                ? response.date.toLocaleDateString()
                                : response.date.toDate
                                    ? response.date.toDate().toLocaleDateString()
                                    : ""
                        : "",
                    likes: typeof response.likes === "number" ? response.likes : 0,
                    comments: typeof response.comments === "number" ? response.comments : 0,
                })
                setComments(Array.isArray(response.comments) ? response.comments : [])
            } else {
                console.error("Post not found or invalid id")
            }

        }

        fetchPost()

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
    }, [postId])

    const handleLike = () => {
        setIsLiked(!isLiked)
        // In a real app, you would update the like count in the database
    }

    const handleSave = () => {
        setIsSaved(!isSaved)
        // In a real app, you would save the post to the user's bookmarks
    }

    const handleShare = async () => {
        if (!post) return

        try {
            await Share.share({
                message: `${post.title} - ${post.excerpt}\n\nLeia mais no aplicativo Patas com Amor`,
                title: post.title,
            })
        } catch (error) {
            console.error("Error sharing post:", error)
        }
    }

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return

        setIsSubmittingComment(true)

        // In a real app, you would send the comment to the database
        // Simulating API call
        setTimeout(() => {
            const newComment: Comment = {
                id: `temp-${Date.now()}`,
                author: "Você",
                authorAvatar: "https://ui-avatars.com/api/?name=Você&background=random",
                date: new Date().toLocaleDateString(),
                content: commentText,
                likes: 0,
            }

            setComments([newComment, ...comments])
            setCommentText("")
            setIsSubmittingComment(false)
        }, 1000)
    }

    if (!post) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: fadeAnim }],
                    }}
                >
                    <Feather name="loader" size={40} color={colors.primary} className="animate-spin" />
                </Animated.View>
                <Text
                    className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    Carregando artigo...
                </Text>
            </View>
        )
    }

    const formatText = (text: string) => {
        // Simple markdown-like formatting
        const paragraphs = text.split("\n\n")
        return paragraphs.map((paragraph, index) => {
            // Handle headers
            if (paragraph.startsWith("## ")) {
                return (
                    <Text
                        key={index}
                        className={`text-xl font-bold mt-6 mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                        style={Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        })}
                    >
                        {paragraph.replace("## ", "")}
                    </Text>
                )
            }

            // Handle lists
            if (paragraph.includes("\n- ")) {
                const [listTitle, ...items] = paragraph.split("\n- ")
                return (
                    <View key={index} className="my-3">
                        {listTitle && (
                            <Text
                                className={`mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {listTitle}
                            </Text>
                        )}
                        {items.map((item, itemIndex) => (
                            <View key={itemIndex} className="flex-row mb-1 ml-2">
                                <Text className={`mr-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}>•</Text>
                                <Text
                                    className={`flex-1 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                )
            }

            // Regular paragraph
            return (
                <Text
                    key={index}
                    className={`mb-4 leading-6 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    {paragraph}
                </Text>
            )
        })
    }

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Floating Header */}
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    opacity: headerOpacity,
                }}
            >
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pt-16 pb-4 px-4"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-base font-bold" numberOfLines={1}>
                            {post.title}
                        </Text>
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Feather name="share-2" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <View style={{ position: "absolute", right: 0, top: 20, flexDirection: 'row', alignSelf: "flex-end", alignItems: 'center', zIndex: 11 }}>
                <HeaderLayout title="Adoção" />
            </View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
            >
                {/* Header Image */}
                <Animated.View
                    style={{
                        opacity: imageOpacity,
                        transform: [{ translateY: imageTranslateY }],
                    }}
                >
                    <View className="relative">
                        <Image source={{ uri: post.image }} className="w-full h-72 object-cover" />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100 }}
                        />
                        <View className="absolute bottom-0 left-0 right-0 p-4">
                            <View className="flex-row items-center mb-2">
                                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${colors.primary}CC` }}>
                                    <Text className="text-white text-xs font-medium">{post.category}</Text>
                                </View>
                                <Text className="text-white text-xs ml-2">{post.readTime} de leitura</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="px-4 pt-6 pb-20"
                >
                    {/* Title and Author */}
                    <Text
                        className={`text-2xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                        style={Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        })}
                    >
                        {post.title}
                    </Text>

                    <View className="flex-row items-center justify-between mb-6">
                        <View className="flex-row items-center">
                            <Image source={{ uri: post.authorAvatar }} className="w-10 h-10 rounded-full" />
                            <View className="ml-2">
                                <Text
                                    className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {post.author}
                                </Text>
                                <Text
                                    className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {post.date}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={handleSave}
                                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                                style={{ backgroundColor: isSaved ? `${colors.primary}20` : "transparent" }}
                            >
                                <Feather
                                    name={isSaved ? "bookmark" : "bookmark"}
                                    size={20}
                                    color={isSaved ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleShare}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: "transparent" }}
                            >
                                <Feather name="share-2" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View className="mb-8">{formatText(post.content)}</View>

                    {/* Engagement */}
                    <View
                        className="flex-row items-center justify-between py-4 border-t border-b mb-6"
                        style={{ borderColor: isDarkTheme ? "#374151" : "#E5E7EB" }}
                    >
                        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                                style={{ backgroundColor: isLiked ? `${colors.secondary}20` : "transparent" }}
                            >
                                <Feather
                                    name={isLiked ? "heart" : "heart"}
                                    size={20}
                                    color={isLiked ? colors.secondary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                />
                            </View>
                            <Text
                                className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {post.likes + (isLiked ? 1 : 0)} curtidas
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center">
                            <Feather name="message-circle" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} className="mr-2" />
                            <Text
                                className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {comments.length} comentários
                            </Text>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View className="mb-6">
                        <Text
                            className={`text-xl font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Comentários
                        </Text>

                        {/* Comment Input */}
                        <View
                            className={`flex-row items-center mb-6 p-3 rounded-xl ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                            style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                        >
                            <TextInput
                                className={`flex-1 mr-2 px-3 py-2 rounded-lg ${isDarkTheme ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                                    }`}
                                placeholder="Adicione um comentário..."
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            />
                            <TouchableOpacity
                                onPress={handleSubmitComment}
                                disabled={isSubmittingComment || !commentText.trim()}
                                className={`px-3 py-2 rounded-lg ${isSubmittingComment || !commentText.trim() ? "opacity-50" : "opacity-100"
                                    }`}
                                style={{ backgroundColor: colors.primary }}
                            >
                                {isSubmittingComment ? (
                                    <Feather name="loader" size={20} color="white" className="animate-spin" />
                                ) : (
                                    <Feather name="send" size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Comments List */}
                        {comments.map((comment, index) => (
                            <View
                                key={comment.id}
                                className={`p-4 mb-4 rounded-xl ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Image source={{ uri: comment.authorAvatar }} className="w-8 h-8 rounded-full" />
                                        <View className="ml-2">
                                            <Text
                                                className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                                style={Platform.select({
                                                    ios: { fontFamily: "San Francisco" },
                                                    android: { fontFamily: "Roboto" },
                                                })}
                                            >
                                                {comment.author}
                                            </Text>
                                            <Text
                                                className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                                style={Platform.select({
                                                    ios: { fontFamily: "San Francisco" },
                                                    android: { fontFamily: "Roboto" },
                                                })}
                                            >
                                                {comment.date}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity>
                                        <Feather name="more-horizontal" size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                    </TouchableOpacity>
                                </View>
                                <Text
                                    className={`mb-3 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    {comment.content}
                                </Text>
                                <View className="flex-row items-center">
                                    <TouchableOpacity className="flex-row items-center mr-4">
                                        <Feather name="heart" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
                                        <Text
                                            className={`ml-1 text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            {comment.likes}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text
                                            className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                            style={Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            })}
                                        >
                                            Responder
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </Animated.ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    androidShadow: {
        elevation: 3,
    },
    webShadow: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
})
