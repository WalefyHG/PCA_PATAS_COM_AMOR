"use client"

import React, { useState } from "react"
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
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"

export default function AddBlogPost() {
    const { paperTheme } = useThemeContext()
    const navigation = useNavigation()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [image, setImage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            await new Promise(resolve => setTimeout(resolve, 1000))

            Alert.alert("Sucesso", "Post adicionado com sucesso!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ])
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
            <ScrollView style={{ backgroundColor: paperTheme.colors.background }}>
                <View style={styles.container}>
                    <TouchableOpacity
                        style={[
                            styles.imageContainer,
                            {
                                backgroundColor: paperTheme.colors.surfaceVariant,
                                borderColor: paperTheme.colors.outline,
                            },
                        ]}
                        onPress={pickImage}
                    >
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Feather name="image" size={48} color={paperTheme.colors.outline} />
                                <Text style={[styles.imagePlaceholderText, { color: paperTheme.colors.onSurfaceVariant }]}>
                                    Toque para adicionar uma imagem
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: paperTheme.colors.onBackground }]}>Título</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: paperTheme.colors.surface,
                                    color: paperTheme.colors.onSurface,
                                    borderColor: paperTheme.colors.outline,
                                },
                            ]}
                            placeholder="Digite o título do post"
                            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: paperTheme.colors.onBackground }]}>Conteúdo</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    backgroundColor: paperTheme.colors.surface,
                                    color: paperTheme.colors.onSurface,
                                    borderColor: paperTheme.colors.outline,
                                },
                            ]}
                            placeholder="Digite o conteúdo do post"
                            placeholderTextColor={paperTheme.colors.onSurfaceVariant}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: isSubmitting ? paperTheme.colors.surfaceVariant : paperTheme.colors.primary,
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Text style={[styles.submitButtonText, { color: paperTheme.colors.onSurfaceVariant }]}>
                                Publicando...
                            </Text>
                        ) : (
                            <Text style={[styles.submitButtonText, { color: paperTheme.colors.onPrimary }]}>Publicar Post</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    saveButton: {
        padding: 8,
    },
    imageContainer: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        minHeight: 150,
    },
    submitButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 32,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
})
