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
    Dimensions,
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import {
    createBlogPost,
    updateBlogPost,
    getBlogPostById,
    isUserAdmin,
    type BlogPost,
    uploadToCloudinary,
} from "../config/firebase"
import { auth } from "../config/firebase"

// Get screen dimensions for responsive sizing
const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isMediumScreen = width >= 380 && width < 768
const isLargeScreen = width >= 768
const isWebPlatform = Platform.OS === "web"

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
                    Alert.alert("Acesso Restrito", "Apenas administradores podem criar ou editar posts.", [
                        { text: "OK", onPress: () => navigation.goBack() },
                    ])
                }
            } else {
                Alert.alert("Não Autenticado", "Você precisa estar logado para acessar esta página.", [
                    { text: "OK", onPress: () => navigation.goBack() },
                ])
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

        if (Platform.OS === "web") {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.onchange = (event: any) => {
                const file = event.target.files[0]
                if (file) setImage(file)
            }
            input.click()
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            })

            if (!result.canceled) {
                setImage(result.assets[0].uri)
            }
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
            if (image) {
                imageUrl = await uploadToCloudinary(image)
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
                Alert.alert("Sucesso", "Post atualizado com sucesso!", [{ text: "OK", onPress: () => navigation.navigate("News") }])
            } else {
                await createBlogPost(postData)
                Alert.alert("Sucesso", "Post criado com sucesso!", [{ text: "OK", onPress: () => navigation.navigate("News") }])
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
            <View style={[styles.loadingContainer, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: isDarkTheme ? "white" : "#374151" }]}>Carregando post...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={[styles.container, { backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB" }]}>
                {/* Header with gradient */}
                <LinearGradient
                    colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Feather name="arrow-left" size={isSmallScreen ? 18 : 20} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEditing ? "Editar Post" : "Novo Post"}</Text>
                        <View style={{ width: isSmallScreen ? 36 : 40 }} />
                    </View>
                </LinearGradient>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={isWebPlatform && styles.webScrollContent}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Image Upload Section */}
                        <View style={styles.imageSection}>
                            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>Imagem do Post *</Text>
                            <TouchableOpacity
                                style={[
                                    styles.imageUploadContainer,
                                    { backgroundColor: isDarkTheme ? "#374151" : "white" },
                                    isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {},
                                ]}
                                onPress={pickImage}
                            >
                                {image ? (
                                    <Image
                                        source={{
                                            uri:
                                                Platform.OS === "web"
                                                    ? typeof image === "string"
                                                        ? image
                                                        : URL.createObjectURL(image)
                                                    : image,
                                        }}
                                        style={styles.uploadedImage}
                                    />
                                ) : (
                                    <View style={styles.emptyImageContainer}>
                                        <View style={[styles.imageIcon, { backgroundColor: `${colors.primary}15` }]}>
                                            <Feather name="image" size={isSmallScreen ? 28 : 32} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.imageUploadText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                            Toque para adicionar uma imagem
                                        </Text>
                                    </View>
                                )}

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <View style={styles.progressOverlay}>
                                        <View
                                            style={[styles.progressBar, { width: `${uploadProgress}%`, backgroundColor: colors.primary }]}
                                        />
                                        <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Category Selection */}
                        <View style={styles.categorySection}>
                            <Text style={[styles.label, { color: isDarkTheme ? "white" : "#374151" }]}>Categoria *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat)}
                                        style={[
                                            styles.categoryButton,
                                            {
                                                backgroundColor: category === cat ? colors.primary : isDarkTheme ? "#374151" : "white",
                                                marginRight: isSmallScreen ? 8 : 12,
                                                borderColor: category === cat ? colors.primary : "#E5E7EB",
                                            },
                                            category !== cat && (isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : {}),
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryButtonText,
                                                {
                                                    color: category === cat ? "white" : isDarkTheme ? "#D1D5DB" : "#374151",
                                                },
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Form Fields */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Informações do Post
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Título *</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                        },
                                    ]}
                                    placeholder="Digite o título do post"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                                <Text style={[styles.characterCount, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    {title.length}/100
                                </Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Resumo *</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                            minHeight: isSmallScreen ? 80 : 100,
                                        },
                                    ]}
                                    placeholder="Digite um breve resumo do post"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={excerpt}
                                    onChangeText={setExcerpt}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={200}
                                    textAlignVertical="top"
                                />
                                <Text style={[styles.characterCount, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    {excerpt.length}/200
                                </Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: isDarkTheme ? "white" : "#374151" }]}>Conteúdo *</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: isDarkTheme ? "#374151" : "#F9FAFB",
                                            color: isDarkTheme ? "white" : "#374151",
                                            minHeight: isSmallScreen ? 160 : 200,
                                        },
                                    ]}
                                    placeholder="Digite o conteúdo do post"
                                    placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    numberOfLines={10}
                                    textAlignVertical="top"
                                />
                                <Text style={[styles.helpText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                                    Dica: Você pode usar formatação markdown como ## Título para cabeçalhos e - Item para listas.
                                </Text>
                            </View>
                        </View>

                        {/* Status Selection */}
                        <View style={[styles.section, { backgroundColor: isDarkTheme ? "#1F2937" : "white" }]}>
                            <Text style={[styles.sectionTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                                Status da Publicação
                            </Text>

                            <View style={styles.statusContainer}>
                                <TouchableOpacity
                                    onPress={() => setStatus("draft")}
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor: status === "draft" ? (isDarkTheme ? "#374151" : "#F3F4F6") : "transparent",
                                            borderColor: status === "draft" ? colors.primary : "#E5E7EB",
                                        },
                                    ]}
                                >
                                    <Feather
                                        name="edit-3"
                                        size={isSmallScreen ? 14 : 16}
                                        color={status === "draft" ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            {
                                                color:
                                                    status === "draft"
                                                        ? isDarkTheme
                                                            ? "white"
                                                            : "#374151"
                                                        : isDarkTheme
                                                            ? "#9CA3AF"
                                                            : "#6B7280",
                                            },
                                        ]}
                                    >
                                        Rascunho
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setStatus("published")}
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor: status === "published" ? (isDarkTheme ? "#374151" : "#F0FDF4") : "transparent",
                                            borderColor: status === "published" ? colors.primary : "#E5E7EB",
                                        },
                                    ]}
                                >
                                    <Feather
                                        name="check-circle"
                                        size={isSmallScreen ? 14 : 16}
                                        color={status === "published" ? colors.primary : isDarkTheme ? "#9CA3AF" : "#6B7280"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            {
                                                color:
                                                    status === "published"
                                                        ? isDarkTheme
                                                            ? "white"
                                                            : "#374151"
                                                        : isDarkTheme
                                                            ? "#9CA3AF"
                                                            : "#6B7280",
                                            },
                                        ]}
                                    >
                                        Publicado
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: isSubmitting ? (isDarkTheme ? "#4B5563" : "#D1D5DB") : colors.primary,
                                    opacity: isSubmitting ? 0.7 : 1,
                                },
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <View style={styles.submitButtonContent}>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text style={styles.submitButtonText}>{isEditing ? "Atualizando..." : "Publicando..."}</Text>
                                </View>
                            ) : (
                                <View style={styles.submitButtonContent}>
                                    <Feather name="send" size={isSmallScreen ? 18 : 20} color="white" />
                                    <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Post" : "Publicar Post"}</Text>
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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "500",
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 64 : Platform.OS === "android" ? 48 : 24,
        paddingBottom: isSmallScreen ? 20 : 24,
        paddingHorizontal: isSmallScreen ? 16 : 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: isSmallScreen ? 36 : 40,
        height: isSmallScreen ? 36 : 40,
        borderRadius: isSmallScreen ? 18 : 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: "700",
    },
    content: {
        paddingHorizontal: isSmallScreen ? 16 : 20,
        paddingTop: isSmallScreen ? 16 : 20,
        paddingBottom: 40,
    },
    webScrollContent: {
        maxWidth: isLargeScreen ? 800 : 600,
        alignSelf: "center",
        width: "100%",
    },
    section: {
        borderRadius: 16,
        padding: isSmallScreen ? 16 : 20,
        marginBottom: isSmallScreen ? 20 : 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sectionTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: "700",
        marginBottom: isSmallScreen ? 12 : 16,
    },
    label: {
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    imageSection: {
        marginBottom: isSmallScreen ? 20 : 24,
    },
    imageUploadContainer: {
        height: isSmallScreen ? 180 : 200,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#D1D5DB",
        position: "relative",
    },
    emptyImageContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    imageIcon: {
        width: isSmallScreen ? 56 : 64,
        height: isSmallScreen ? 56 : 64,
        borderRadius: isSmallScreen ? 28 : 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    imageUploadText: {
        fontSize: isSmallScreen ? 14 : 16,
        textAlign: "center",
    },
    uploadedImage: {
        width: "100%",
        height: "100%",
    },
    progressOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingVertical: 8,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
    },
    progressText: {
        color: "white",
        fontSize: 12,
        textAlign: "center",
        marginTop: 4,
    },
    categorySection: {
        marginBottom: isSmallScreen ? 20 : 24,
    },
    categoryScrollView: {
        marginBottom: 8,
    },
    categoryButton: {
        paddingHorizontal: isSmallScreen ? 14 : 18,
        paddingVertical: isSmallScreen ? 10 : 12,
        borderRadius: 25,
        borderWidth: 2,
        minWidth: isSmallScreen ? 80 : 100,
        alignItems: "center",
    },
    categoryButtonText: {
        fontWeight: "600",
        fontSize: isSmallScreen ? 13 : 14,
    },
    inputContainer: {
        marginBottom: isSmallScreen ? 14 : 16,
    },
    inputLabel: {
        fontSize: isSmallScreen ? 13 : 14,
        fontWeight: "500",
        marginBottom: 6,
    },
    textInput: {
        borderRadius: 12,
        paddingVertical: Platform.OS === "web" ? 14 : 12,
        paddingHorizontal: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
            height: 50,
        }),
    },
    textArea: {
        borderRadius: 12,
        padding: 16,
        fontSize: isSmallScreen ? 15 : 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...(Platform.OS === "web" && {
            outlineStyle: "none",
        }),
    },
    characterCount: {
        fontSize: 12,
        textAlign: "right",
        marginTop: 4,
    },
    helpText: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: "italic",
    },
    statusContainer: {
        flexDirection: isSmallScreen ? "column" : "row",
        gap: isSmallScreen ? 12 : 16,
    },
    statusButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: isSmallScreen ? 14 : 16,
        paddingVertical: isSmallScreen ? 10 : 12,
        borderRadius: 12,
        borderWidth: 2,
        flex: isSmallScreen ? 0 : 1,
    },
    statusButtonText: {
        fontWeight: "500",
        fontSize: isSmallScreen ? 14 : 15,
    },
    submitButton: {
        borderRadius: 16,
        paddingVertical: isSmallScreen ? 14 : 16,
        marginTop: isSmallScreen ? 20 : 24,
        ...(Platform.OS === "web" && {
            cursor: "pointer",
            transition: "0.2s opacity",
        }),
    },
    submitButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    submitButtonText: {
        color: "white",
        fontSize: isSmallScreen ? 15 : 16,
        fontWeight: "700",
    },
    iosShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    androidShadow: {
        elevation: 4,
    },
})
