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
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"

export default function AddBlogPost() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const categories = ["Cuidados", "Alimentação", "Adoção", "Comportamento", "Saúde", "Dicas"]

    useEffect(() => {
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
    }, [])

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

        if (!image) {
            Alert.alert("Erro", "Por favor, adicione uma imagem para o post.")
            return
        }

        try {
            setIsSubmitting(true)

            // Aqui você adicionaria a lógica para salvar o post no Firebase
            // Por exemplo:
            // const newPost = {
            //   title,
            //   content,
            //   image,
            //   author: auth.currentUser?.displayName || "Usuário",
            //   date: new Date().toISOString(),
            //   likes: 0,
            //   comments: 0,
            // }
            // await addDoc(collection(db, "posts"), newPost)

            // Simulando um atraso para demonstração
            await new Promise((resolve) => setTimeout(resolve, 1000))

            Alert.alert("Sucesso", "Post adicionado com sucesso!", [{ text: "OK", onPress: () => navigation.goBack() }])
        } catch (error) {
            console.error("Erro ao adicionar post:", error)
            Alert.alert("Erro", "Ocorreu um erro ao adicionar o post. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
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
                        <Text className="text-white text-xl font-bold">Novo Post</Text>
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
                                            category !== cat && (isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow)
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

                        <View className="mb-8">
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
                                    <Animated.View
                                        style={{
                                            transform: [
                                                {
                                                    rotate: fadeAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ["0deg", "360deg"],
                                                    }),
                                                },
                                            ],
                                        }}
                                    >
                                        <Feather name="loader" size={20} color="white" />
                                    </Animated.View>
                                    <Text className="ml-2 text-white font-semibold">Publicando...</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center">
                                    <Feather name="send" size={20} color="white" />
                                    <Text className="ml-2 text-white font-semibold">Publicar Post</Text>
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

