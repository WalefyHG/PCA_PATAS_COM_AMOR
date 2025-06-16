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
    Dimensions,
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

    // Responsive dimensions
    const [screenData, setScreenData] = useState(Dimensions.get("window"))
    const isTablet = screenData.width >= 768
    const isWeb = Platform.OS === "web"
    const isLargeScreen = screenData.width >= 1024
    const isMobile = screenData.width < 768

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

    useEffect(() => {
        const onChange = (result: any) => {
            setScreenData(result.window)
        }

        const subscription = Dimensions.addEventListener("change", onChange)
        return () => subscription?.remove()
    }, [])

    useEffect(() => {
        // Fetch post data based on postId
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

    const handleScroll = (event: any) => {
        // Atualiza o valor do scrollY para Android
        if (Platform.OS === "web") {
            const offsetY = event.nativeEvent.target.scrollTop
            scrollY.setValue(offsetY)
        }
        if (Platform.OS === "android") {
            const offsetY = event.nativeEvent.contentOffset.y
            scrollY.setValue(offsetY)
        } else {
            // Para iOS, usamos o Animated.event
            Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: true,
            })(event)
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
                        className={`font-bold mt-6 mb-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                        style={[
                            Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            }),
                            { fontSize: isLargeScreen ? 28 : isTablet ? 24 : 20 },
                        ]}
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
                                style={[
                                    Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                    { fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16 },
                                ]}
                            >
                                {listTitle}
                            </Text>
                        )}
                        {items.map((item, itemIndex) => (
                            <View key={itemIndex} className="flex-row mb-1 ml-2">
                                <Text className={`mr-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}>•</Text>
                                <Text
                                    className={`flex-1 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                    style={[
                                        Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        }),
                                        { fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16 },
                                    ]}
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
                    style={[
                        Platform.select({
                            ios: { fontFamily: "San Francisco" },
                            android: { fontFamily: "Roboto" },
                        }),
                        {
                            fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16,
                            lineHeight: isLargeScreen ? 32 : isTablet ? 28 : 24,
                        },
                    ]}
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
                    style={{
                        paddingTop: 64,
                        paddingBottom: 16,
                        paddingHorizontal: isLargeScreen ? 32 : 16,
                    }}
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                width: isTablet ? 48 : 40,
                                height: isTablet ? 48 : 40,
                                borderRadius: isTablet ? 24 : 20,
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="arrow-left" size={isTablet ? 24 : 20} color="white" />
                        </TouchableOpacity>
                        <Text
                            className="text-white font-bold"
                            numberOfLines={1}
                            style={{
                                fontSize: isTablet ? 20 : 16,
                                ...Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                }),
                                maxWidth: "60%",
                            }}
                        >
                            {post.title}
                        </Text>
                        <TouchableOpacity
                            onPress={handleShare}
                            style={{
                                width: isTablet ? 48 : 40,
                                height: isTablet ? 48 : 40,
                                borderRadius: isTablet ? 24 : 20,
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="share-2" size={isTablet ? 24 : 20} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <View
                style={{
                    position: "absolute",
                    right: 0,
                    top: 20,
                    flexDirection: "row",
                    alignSelf: "flex-end",
                    alignItems: "center",
                    zIndex: 11,
                }}
            >
                <HeaderLayout title="Blog" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    maxWidth: isWeb ? 1200 : "100%",
                    alignSelf: "center",
                    width: "100%",
                }}
            >
                {/* Header Image */}
                <Animated.View
                    style={{
                        opacity: imageOpacity,
                        transform: [{ translateY: imageTranslateY }],
                    }}
                >
                    <View className="relative">
                        <Image
                            source={{ uri: post.image }}
                            className="w-full object-cover"
                            style={{
                                height: isLargeScreen ? 450 : isWeb ? 400 : isTablet ? 350 : 280,
                            }}
                        />
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}
                        />
                        <View
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                                padding: isLargeScreen ? 32 : isTablet ? 24 : 16,
                            }}
                        >
                            <View className="flex-row items-center mb-2">
                                <View
                                    className="rounded-full"
                                    style={{
                                        backgroundColor: `${colors.primary}CC`,
                                        paddingHorizontal: isTablet ? 16 : 12,
                                        paddingVertical: isTablet ? 8 : 4,
                                    }}
                                >
                                    <Text
                                        className="text-white font-medium"
                                        style={{
                                            fontSize: isTablet ? 14 : 12,
                                        }}
                                    >
                                        {post.category}
                                    </Text>
                                </View>
                                <Text
                                    className="text-white ml-2"
                                    style={{
                                        fontSize: isTablet ? 14 : 12,
                                    }}
                                >
                                    {post.readTime} de leitura
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                position: "absolute",
                                top: 48,
                                left: isLargeScreen ? 24 : 16,
                                width: isTablet ? 48 : 40,
                                height: isTablet ? 48 : 40,
                                borderRadius: isTablet ? 24 : 20,
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Feather name="arrow-left" size={isTablet ? 24 : 20} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                        {
                            paddingHorizontal: isLargeScreen ? 48 : isTablet ? 32 : 16,
                            paddingTop: isTablet ? 32 : 24,
                            paddingBottom: isTablet ? 80 : 60,
                        }
                    ]}
                    className="pt-6 pb-20"
                >
                    {/* Title and Author */}
                    <Text
                        className={`font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                        style={[
                            Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            }),
                            {
                                fontSize: isLargeScreen ? 36 : isTablet ? 32 : 24,
                                marginBottom: isTablet ? 24 : 16,
                                lineHeight: isLargeScreen ? 44 : isTablet ? 40 : 32,
                            },
                        ]}
                    >
                        {post.title}
                    </Text>

                    {/* Author Section - Redesigned with Fixed Action Buttons */}
                    <View
                        className={`rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={[
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                            {
                                padding: isLargeScreen ? 24 : isTablet ? 20 : 16,
                                marginBottom: isTablet ? 32 : 24,
                                borderRadius: isTablet ? 16 : 12,
                            },
                        ]}
                    >
                        <View
                            style={{ flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}
                        >
                            {/* Author Info */}
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginBottom: isMobile ? 16 : 0 }}>
                                <Image
                                    source={{ uri: post.authorAvatar }}
                                    className="rounded-full"
                                    style={{
                                        width: isLargeScreen ? 56 : isTablet ? 48 : 40,
                                        height: isLargeScreen ? 56 : isTablet ? 48 : 40,
                                    }}
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text
                                        className={`font-semibold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                        numberOfLines={1}
                                        style={[
                                            Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            }),
                                            {
                                                fontSize: isLargeScreen ? 18 : isTablet ? 16 : 14,
                                                marginBottom: 2,
                                            },
                                        ]}
                                    >
                                        {post.author}
                                    </Text>
                                    <Text
                                        className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                        numberOfLines={1}
                                        style={[
                                            Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            }),
                                            { fontSize: isLargeScreen ? 14 : isTablet ? 13 : 12 },
                                        ]}
                                    >
                                        Publicado em {post.date}
                                    </Text>
                                    {post.readTime && (
                                        <Text
                                            className={`${isDarkTheme ? "text-gray-500" : "text-gray-400"} mt-1`}
                                            numberOfLines={1}
                                            style={[
                                                Platform.select({
                                                    ios: { fontFamily: "San Francisco" },
                                                    android: { fontFamily: "Roboto" },
                                                }),
                                                { fontSize: isLargeScreen ? 13 : isTablet ? 12 : 11 },
                                            ]}
                                        >
                                            {post.readTime} de leitura
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: isMobile ? "flex-start" : "flex-end",
                                    minWidth: isTablet ? 110 : 100,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={handleSave}
                                    style={{
                                        backgroundColor: isSaved
                                            ? `${colors.primary}15`
                                            : isDarkTheme
                                                ? "rgba(255,255,255,0.05)"
                                                : "rgba(0,0,0,0.05)",
                                        width: isLargeScreen ? 48 : isTablet ? 44 : 40,
                                        height: isLargeScreen ? 48 : isTablet ? 44 : 40,
                                        borderRadius: isLargeScreen ? 24 : isTablet ? 22 : 20,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 12,
                                    }}
                                >
                                    <Feather
                                        name={isSaved ? "bookmark" : "bookmark"}
                                        size={isLargeScreen ? 24 : isTablet ? 22 : 20}
                                        color={isSaved ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleShare}
                                    style={{
                                        backgroundColor: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                        width: isLargeScreen ? 48 : isTablet ? 44 : 40,
                                        height: isLargeScreen ? 48 : isTablet ? 44 : 40,
                                        borderRadius: isLargeScreen ? 24 : isTablet ? 22 : 20,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Feather
                                        name="share-2"
                                        size={isLargeScreen ? 24 : isTablet ? 22 : 20}
                                        color={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Engagement */}
                    <View
                        className={`rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={[
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                            {
                                padding: isLargeScreen ? 32 : isTablet ? 24 : 16,
                                marginBottom: isTablet ? 32 : 24,
                                borderRadius: isTablet ? 20 : 12,
                            },
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: isMobile ? "column" : "row",
                                justifyContent: "space-between",
                                alignItems: isMobile ? "flex-start" : "center",
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleLike}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: isMobile ? 16 : 0,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: isLiked ? `${colors.secondary}20` : "transparent",
                                        width: isLargeScreen ? 56 : isTablet ? 48 : 40,
                                        height: isLargeScreen ? 56 : isTablet ? 48 : 40,
                                        borderRadius: isLargeScreen ? 28 : isTablet ? 24 : 20,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: isTablet ? 16 : 12,
                                    }}
                                >
                                    <Feather
                                        name={isLiked ? "heart" : "heart"}
                                        size={isLargeScreen ? 28 : isTablet ? 24 : 20}
                                        color={isLiked ? colors.secondary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    />
                                </View>
                                <Text
                                    className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                    style={[
                                        Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        }),
                                        { fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16 },
                                    ]}
                                >
                                    {post.likes + (isLiked ? 1 : 0)} curtidas
                                </Text>
                            </TouchableOpacity>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Feather
                                    name="message-circle"
                                    size={isLargeScreen ? 28 : isTablet ? 24 : 20}
                                    color={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    style={{ marginRight: isTablet ? 16 : 12 }}
                                />
                                <Text
                                    className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                    style={[
                                        Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        }),
                                        { fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16 },
                                    ]}
                                >
                                    {comments.length} comentários
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View
                        className={`rounded-xl mb-6 ${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                        style={[
                            isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                            {
                                padding: isLargeScreen ? 32 : isTablet ? 24 : 16,
                                marginBottom: isTablet ? 32 : 24,
                                borderRadius: isTablet ? 20 : 12,
                            },
                        ]}
                    >
                        <Text
                            className={`font-bold mb-4 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={[
                                Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                }),
                                {
                                    fontSize: isLargeScreen ? 28 : isTablet ? 24 : 20,
                                    marginBottom: isTablet ? 24 : 16,
                                },
                            ]}
                        >
                            Comentários
                        </Text>

                        {/* Comment Input */}
                        <View
                            className={`items-center mb-6 rounded-xl ${isDarkTheme ? "bg-gray-700" : "bg-gray-100"}`}
                            style={{
                                marginBottom: isTablet ? 32 : 24,
                                borderRadius: isTablet ? 16 : 12,
                                overflow: "hidden",
                            }}
                        >
                            <TextInput
                                className={`w-full ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                placeholder="Adicione um comentário..."
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                style={[
                                    Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                    {
                                        padding: isLargeScreen ? 24 : isTablet ? 20 : 16,
                                        fontSize: isLargeScreen ? 20 : isTablet ? 18 : 16,
                                        minHeight: isTablet ? 120 : 100,
                                        textAlignVertical: "top",
                                    },
                                ]}
                            />

                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    width: "100%",
                                    padding: isLargeScreen ? 16 : isTablet ? 12 : 8,
                                    backgroundColor: isDarkTheme ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
                                }}
                            >
                                <TouchableOpacity
                                    onPress={handleSubmitComment}
                                    disabled={isSubmittingComment || !commentText.trim()}
                                    style={{
                                        backgroundColor: colors.primary,
                                        paddingVertical: isLargeScreen ? 16 : isTablet ? 12 : 10,
                                        paddingHorizontal: isLargeScreen ? 32 : isTablet ? 24 : 20,
                                        borderRadius: isTablet ? 12 : 8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: isSubmittingComment || !commentText.trim() ? 0.5 : 1,
                                    }}
                                >
                                    {isSubmittingComment ? (
                                        <Feather
                                            name="loader"
                                            size={isLargeScreen ? 24 : isTablet ? 20 : 18}
                                            color="white"
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <>
                                            <Feather
                                                name="send"
                                                size={isLargeScreen ? 24 : isTablet ? 20 : 18}
                                                color="white"
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text
                                                style={{
                                                    color: "white",
                                                    fontWeight: "600",
                                                    fontSize: isLargeScreen ? 18 : isTablet ? 16 : 14,
                                                    ...Platform.select({
                                                        ios: { fontFamily: "San Francisco" },
                                                        android: { fontFamily: "Roboto" },
                                                    }),
                                                }}
                                            >
                                                Comentar
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Comments List */}
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <View
                                    key={comment.id}
                                    className={`mb-4 rounded-xl ${isDarkTheme ? "bg-gray-700" : "bg-gray-100"}`}
                                    style={[
                                        {
                                            padding: isLargeScreen ? 20 : isTablet ? 16 : 14,
                                            marginBottom: isTablet ? 16 : 12,
                                            borderRadius: isTablet ? 16 : 12,
                                        },
                                        index !== comments.length - 1 && {
                                            marginBottom: isTablet ? 16 : 12,
                                        },
                                    ]}
                                >
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-row items-start flex-1 mr-3">
                                            <Image
                                                source={{ uri: comment.authorAvatar }}
                                                className="rounded-full"
                                                style={{
                                                    width: isLargeScreen ? 40 : isTablet ? 36 : 32,
                                                    height: isLargeScreen ? 40 : isTablet ? 36 : 32,
                                                }}
                                            />
                                            <View className="ml-3 flex-1">
                                                <Text
                                                    className={`font-medium ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                                    numberOfLines={1}
                                                    style={[
                                                        Platform.select({
                                                            ios: { fontFamily: "San Francisco" },
                                                            android: { fontFamily: "Roboto" },
                                                        }),
                                                        {
                                                            fontSize: isLargeScreen ? 16 : isTablet ? 15 : 14,
                                                            marginBottom: 2,
                                                        },
                                                    ]}
                                                >
                                                    {comment.author}
                                                </Text>
                                                <Text
                                                    className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                                    numberOfLines={1}
                                                    style={[
                                                        Platform.select({
                                                            ios: { fontFamily: "San Francisco" },
                                                            android: { fontFamily: "Roboto" },
                                                        }),
                                                        { fontSize: isLargeScreen ? 13 : isTablet ? 12 : 11 },
                                                    ]}
                                                >
                                                    {comment.date}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={{
                                                width: isLargeScreen ? 36 : isTablet ? 32 : 28,
                                                height: isLargeScreen ? 36 : isTablet ? 32 : 28,
                                                borderRadius: isLargeScreen ? 18 : isTablet ? 16 : 14,
                                                backgroundColor: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Feather
                                                name="more-horizontal"
                                                size={isLargeScreen ? 20 : isTablet ? 18 : 16}
                                                color={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text
                                        className={`mb-4 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
                                        style={[
                                            Platform.select({
                                                ios: { fontFamily: "San Francisco" },
                                                android: { fontFamily: "Roboto" },
                                            }),
                                            {
                                                fontSize: isLargeScreen ? 16 : isTablet ? 15 : 14,
                                                lineHeight: isLargeScreen ? 24 : isTablet ? 22 : 20,
                                                marginBottom: isTablet ? 16 : 12,
                                            },
                                        ]}
                                    >
                                        {comment.content}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            className="flex-row items-center mr-4"
                                            style={{
                                                backgroundColor: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                                paddingVertical: isTablet ? 8 : 6,
                                                paddingHorizontal: isTablet ? 12 : 10,
                                                borderRadius: 16,
                                                marginRight: 12,
                                            }}
                                        >
                                            <Feather
                                                name="heart"
                                                size={isLargeScreen ? 16 : isTablet ? 15 : 14}
                                                color={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text
                                                className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                                style={[
                                                    Platform.select({
                                                        ios: { fontFamily: "San Francisco" },
                                                        android: { fontFamily: "Roboto" },
                                                    }),
                                                    { fontSize: isLargeScreen ? 14 : isTablet ? 13 : 12 },
                                                ]}
                                            >
                                                {comment.likes}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                                                paddingVertical: isTablet ? 8 : 6,
                                                paddingHorizontal: isTablet ? 12 : 10,
                                                borderRadius: 16,
                                            }}
                                        >
                                            <Text
                                                className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                                style={[
                                                    Platform.select({
                                                        ios: { fontFamily: "San Francisco" },
                                                        android: { fontFamily: "Roboto" },
                                                    }),
                                                    { fontSize: isLargeScreen ? 14 : isTablet ? 13 : 12 },
                                                ]}
                                            >
                                                Responder
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="items-center justify-center py-8">
                                <Feather
                                    name="message-circle"
                                    size={isLargeScreen ? 48 : isTablet ? 40 : 32}
                                    color={isDarkTheme ? "#4B5563" : "#D1D5DB"}
                                    style={{ marginBottom: 16 }}
                                />
                                <Text
                                    className={`text-center ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                    style={[
                                        Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        }),
                                        { fontSize: isLargeScreen ? 18 : isTablet ? 16 : 14 },
                                    ]}
                                >
                                    Nenhum comentário ainda. Seja o primeiro a comentar!
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
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
