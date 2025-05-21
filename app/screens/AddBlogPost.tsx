"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator,
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { createBlogPost, updateBlogPost, getBlogPostById, uploadImage, isUserAdmin, BlogPost } from "../config/firebase"
import { auth } from "../config/firebase"

export default function AddBlogPost() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { postId } = route.params || {}
    const isEditing = !!postId

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [category, setCategory] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(isEditing)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isAdmin, setIsAdmin] = useState(false)
    const [status, setStatus] = useState<"published" | "draft">("draft")

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const categories = ["Cuidados", "Alimentação", "Adoção", "Comportamento", "Saúde", "Dicas"]

    useEffect(() => {
        // Verificar se o usuário é admin
        const checkAdminStatus = async () => {
            if (auth.currentUser) {
                const adminStatus = await isUserAdmin(auth.currentUser.uid)
                setIsAdmin(adminStatus)

                if (!adminStatus) {
                    Alert.alert(
                        "Acesso Restrito",
                        "Apenas administradores podem criar ou editar posts.",
                        [{ text: "OK", onPress: () => navigation.goBack() }]
                    )
                }
            } else {
                Alert.alert(
                    "Não Autenticado",
                    "Você precisa estar logado para acessar esta página.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                )
            }
        }

        checkAdminStatus()

        // Se estiver editando, carregar dados do post
        if (isEditing) {
            const fetchPost = async () => {
                try {
                    const post = await getBlogPostById(postId)
                    if (post) {
                        setTitle(post.title)
                        setContent(post.content)
                        setExcerpt(post.excerpt)
                        setCategory(post.category || "")
                        setImage(post.image)
                        setStatus(post.status)
                    } else {
                        Alert.alert("Erro", "Post não encontrado.")
                        navigation.goBack()
                    }
                } catch (error) {
                    console.error("Error fetching post:", error)
                    Alert.alert("Erro", "Não foi possível carregar o post.")
                } finally {
                    setIsLoading(false)
                }
            }

            fetchPost()
        }

        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 6,
                useNativeDriver: true,
            }),
        ]).start()
    }, [postId, navigation])

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua galeria de fotos.")
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        })

        if (!result.canceled) {
            setImage(result.assets[0].uri)
        }
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Erro", "Por favor, adicione um título para o post.")
            return
        }

        if (!content.trim()) {
            Alert.alert("Erro", "Por favor, adicione o conteúdo do post.")
            return
        }

        if (!excerpt.trim()) {
            Alert.alert("Erro", "Por favor, adicione um resumo para o post.")
            return
        }

        if (!category) {
            Alert.alert("Erro", "Por favor, selecione uma categoria para o post.")
            return
        }

        if (!image) {
            Alert.alert("Erro", "Por favor, adicione uma imagem para o post.")
            return
        }

        try {
            setIsSubmitting(true)

            // Verificar se o usuário está autenticado
            if (!auth.currentUser) {
                Alert.alert("Erro", "Você precisa estar logado para publicar um post.")
                return
            }

            // Calcular tempo de leitura (aproximadamente 200 palavras por minuto)
            const wordCount = content.split(/\s+/).length
            const readTime = Math.max(1, Math.ceil(wordCount / 200))

            let imageUrl = image

            // Se a imagem for local (não começa com http), fazer upload
            if (image && !image.startsWith('http')) {
                const imagePath = `blog_posts/${Date.now()}_${auth.currentUser.uid}`
                imageUrl = await uploadImage(image, imagePath, setUploadProgress)
            }

            const postData: BlogPost = {
                title,
                content,
                excerpt,
                category,
                image: imageUrl,
                author: auth.currentUser.displayName || "Usuário",
                authorId: auth.currentUser.uid,
                authorAvatar: auth.currentUser.photoURL || "",
                status,
                readTime: `${readTime} min`,
            }

            if (isEditing) {
                await updateBlogPost(postId, postData)
                Alert.alert("Sucesso", "Post atualizado com sucesso!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ])
            } else {
                await createBlogPost(postData)
                Alert.alert("Sucesso", "Post criado com sucesso!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ])
            }
        } catch (error) {
            console.error("Erro ao salvar post:", error)
            Alert.alert("Erro", "Ocorreu um erro ao salvar o post. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                    className={`mt-4 text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                    style={Platform.select({
                        ios: { fontFamily: "San Francisco" },
                        android: { fontFamily: "Roboto" },
                    })}
                >
                    Carregando post...
                </Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
                {/* Header with gradient */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="pt-16 pb-8 px-4"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">{isEditing ? "Editar Post" : "Novo Post"}</Text>
                        <View className="w-10" />
                    </View>
                </LinearGradient>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                        className="px-4 pt-4 pb-8"
                    >
                        <TouchableOpacity
                            className={`w-full h-56 rounded-xl mb-6 overflow-hidden ${isDarkTheme ? "bg-gray-800" : "bg-white"
                                } items-center justify-center`}
                            style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                            onPress={pickImage}
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" />
                            ) : (
                                <View className="items-center">
                                    <View
                                        className="w-16 h-16 rounded-full items-center justify-center mb-3"
                                        style={{ backgroundColor: `${colors.primary}15` }}
                                    >
                                        <Feather name="image" size={32} color={colors.primary} />
                                    </View>
                                    <Text
                                        className={`text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                        style={Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        })}
                                    >
                                        Toque para adicionar uma imagem
                                    </Text>
                                </View>
                            )}

                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-2">
                                    <View
                                        className="h-2 bg-primary-500 rounded-full"
                                        style={{ width: `${uploadProgress}%`, backgroundColor: colors.primary }}
                                    />
                                    <Text className="text-white text-xs text-center mt-1">{Math.round(uploadProgress)}%</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View className="mb-6">
                            <Text
                                className={`text-base font-medium mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                Categoria
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat)}
                                        className={`px-4 py-2 mr-2 rounded-full ${category === cat
                                            ? isDarkTheme
                                                ? "bg-primary-700"
                                                : "bg-primary-500"
                                            : isDarkTheme
                                                ? "bg-gray-800"
                                                : "bg-white"
                                            }`}
                                        style={
                                            category !== cat &&
                                            (isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow)
                                        }
                                    >
                                        <Text
                                            className={`${category === cat ? "text-white" : isDarkTheme ? "text-gray-300" : "text-gray-700"
                                                } font-medium`}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="mb-6">
                            <Text
                                className={`text-base font-medium mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                Título
                            </Text>
                            <TextInput
                                className={`p-4 rounded-xl ${isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
                                style={[
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                                    Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                ]}
                                placeholder="Digite o título do post"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                        </View>

                        <View className="mb-6">
                            <Text
                                className={`text-base font-medium mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                Resumo
                            </Text>
                            <TextInput
                                className={`p-4 rounded-xl ${isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
                                style={[
                                    { minHeight: 80, textAlignVertical: "top" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                                    Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                ]}
                                placeholder="Digite um breve resumo do post"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={excerpt}
                                onChangeText={setExcerpt}
                                multiline
                                numberOfLines={3}
                                maxLength={200}
                            />
                        </View>

                        <View className="mb-6">
                            <Text
                                className={`text-base font-medium mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                Conteúdo
                            </Text>
                            <TextInput
                                className={`p-4 rounded-xl ${isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
                                style={[
                                    { minHeight: 200, textAlignVertical: "top" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow,
                                    Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    }),
                                ]}
                                placeholder="Digite o conteúdo do post"
                                placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                numberOfLines={10}
                            />
                            <Text className={`text-xs mt-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                Dica: Você pode usar formatação markdown como ## Título para cabeçalhos e - Item para listas.
                            </Text>
                        </View>

                        <View className="mb-6">
                            <Text
                                className={`text-base font-medium mb-2 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                Status
                            </Text>
                            <View className="flex-row">
                                <TouchableOpacity
                                    onPress={() => setStatus("draft")}
                                    className={`flex-row items-center px-4 py-2 mr-4 rounded-full ${status === "draft"
                                        ? isDarkTheme
                                            ? "bg-gray-700"
                                            : "bg-gray-200"
                                        : "bg-transparent"
                                        }`}
                                >
                                    <Feather
                                        name="edit-3"
                                        size={16}
                                        color={status === "draft" ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        className="mr-2"
                                    />
                                    <Text
                                        className={`${status === "draft"
                                            ? isDarkTheme
                                                ? "text-white"
                                                : "text-gray-800"
                                            : isDarkTheme
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                            }`}
                                    >
                                        Rascunho
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setStatus("published")}
                                    className={`flex-row items-center px-4 py-2 rounded-full ${status === "published"
                                        ? isDarkTheme
                                            ? "bg-primary-700"
                                            : "bg-primary-100"
                                        : "bg-transparent"
                                        }`}
                                >
                                    <Feather
                                        name="check-circle"
                                        size={16}
                                        color={status === "published" ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        className="mr-2"
                                    />
                                    <Text
                                        className={`${status === "published"
                                            ? isDarkTheme
                                                ? "text-white"
                                                : "text-primary-700"
                                            : isDarkTheme
                                                ? "text-gray-400"
                                                : "text-gray-500"
                                            }`}
                                    >
                                        Publicado
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            className={`py-4 rounded-xl flex-row items-center justify-center mb-10 ${isSubmitting ? "opacity-70" : "opacity-100"
                                }`}
                            style={{
                                backgroundColor: isSubmitting ? (isDarkTheme ? "#4B5563" : "#D1D5DB") : colors.primary,
                                ...styles.submitButton,
                            }}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className="ml-2 text-white font-semibold">
                                        {isEditing ? "Atualizando..." : "Publicando..."}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center">
                                    <Feather name="send" size={20} color="white" />
                                    <Text className="ml-2 text-white font-semibold">
                                        {isEditing ? "Atualizar Post" : "Publicar Post"}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
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
    submitButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
})
