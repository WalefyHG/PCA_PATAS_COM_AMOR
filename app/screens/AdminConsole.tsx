"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    RefreshControl,
    Platform,
    Animated,
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"

// Tipos para os dados
interface AdminTab {
    id: string
    title: string
    icon: keyof typeof Feather.glyphMap
}

interface BlogPost {
    id: string
    title: string
    author: string
    date: string
    image: string
    status: "published" | "draft"
}

interface Pet {
    id: string
    name: string
    type: string
    breed: string
    age: string
    image: string
    status: "available" | "adopted" | "pending"
}

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "user"
    status: "active" | "inactive"
    avatar?: string
}

export default function AdminConsole() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const [activeTab, setActiveTab] = useState<string>("blog")
    const [refreshing, setRefreshing] = useState(false)

    // Animated values
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(30))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

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

    // Dados de exemplo
    const [blogPosts] = useState<BlogPost[]>([
        {
            id: "1",
            title: "Como cuidar de filhotes recém-nascidos",
            author: "Dra. Ana Silva",
            date: "15/04/2023",
            image:
                "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "published",
        },
        {
            id: "2",
            title: "Alimentação saudável para pets idosos",
            author: "Dr. Carlos Mendes",
            date: "03/05/2023",
            image:
                "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "published",
        },
        {
            id: "3",
            title: "Benefícios da adoção responsável",
            author: "Patrícia Oliveira",
            date: "22/05/2023",
            image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "draft",
        },
    ])

    const [pets] = useState<Pet[]>([
        {
            id: "1",
            name: "Max",
            type: "Cachorro",
            breed: "Labrador",
            age: "2 anos",
            image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "available",
        },
        {
            id: "2",
            name: "Luna",
            type: "Gato",
            breed: "Siamês",
            age: "1 ano",
            image:
                "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "pending",
        },
        {
            id: "3",
            name: "Bob",
            type: "Cachorro",
            breed: "Vira-lata",
            age: "3 anos",
            image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            status: "adopted",
        },
    ])

    const [users] = useState<User[]>([
        {
            id: "1",
            name: "João Silva",
            email: "joao@example.com",
            role: "admin",
            status: "active",
            avatar: "https://ui-avatars.com/api/?name=João+Silva&background=random",
        },
        {
            id: "2",
            name: "Maria Oliveira",
            email: "maria@example.com",
            role: "user",
            status: "active",
            avatar: "https://ui-avatars.com/api/?name=Maria+Oliveira&background=random",
        },
        {
            id: "3",
            name: "Pedro Santos",
            email: "pedro@example.com",
            role: "user",
            status: "inactive",
            avatar: "https://ui-avatars.com/api/?name=Pedro+Santos&background=random",
        },
    ])

    // Abas do Admin Console
    const tabs: AdminTab[] = [
        { id: "blog", title: "Blog", icon: "book-open" },
        { id: "pets", title: "Pets", icon: "heart" },
        { id: "users", title: "Usuários", icon: "users" },
        { id: "settings", title: "Configurações", icon: "settings" },
    ]

    const onRefresh = async () => {
        setRefreshing(true)
        // Aqui você implementaria a lógica para recarregar os dados
        // Por exemplo: await fetchBlogPosts();

        // Simulando um atraso para demonstração
        setTimeout(() => {
            setRefreshing(false)
        }, 1000)
    }

    const handleEdit = (id: string, type: string) => {
        if (type === "blog") {
            navigation.navigate("AddBlogPost", { id })
        } else if (type === "pet") {
            // Navegar para a tela de edição de pet
            Alert.alert("Editar Pet", `Editar pet com ID: ${id}`)
        } else if (type === "user") {
            // Navegar para a tela de edição de usuário
            Alert.alert("Editar Usuário", `Editar usuário com ID: ${id}`)
        }
    }

    const handleDelete = (id: string, type: string) => {
        Alert.alert("Confirmar exclusão", `Tem certeza que deseja excluir este item?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: () => {
                    // Aqui você implementaria a lógica para excluir o item
                    Alert.alert("Sucesso", `Item excluído com sucesso!`)
                },
            },
        ])
    }

    const handleAdd = () => {
        if (activeTab === "blog") {
            navigation.navigate("AddBlogPost")
        } else if (activeTab === "pets") {
            // Navegar para a tela de adição de pet
            Alert.alert("Adicionar Pet", "Funcionalidade em desenvolvimento")
        } else if (activeTab === "users") {
            // Navegar para a tela de adição de usuário
            Alert.alert("Adicionar Usuário", "Funcionalidade em desenvolvimento")
        }
    }

    return (
        <View className={`flex-1 ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header with gradient */}
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="pt-16 pb-4 px-4"
            >
                <View className="flex-row items-center justify-center">
                    <Text className="text-white text-xl font-bold">Admin Console</Text>
                    <View className="w-10" />
                </View>
            </LinearGradient>

            {/* Tabs Navigation */}
            <View
                className={`${isDarkTheme ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`flex-row items-center mx-2 px-4 py-2 rounded-full ${activeTab === tab.id ? (isDarkTheme ? "bg-gray-700" : "bg-gray-100") : "bg-transparent"
                                }`}
                        >
                            <Feather
                                name={tab.icon}
                                size={18}
                                color={
                                    activeTab === tab.id ? colors.primary : isDarkTheme ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"
                                }
                            />
                            <Text
                                className={`ml-2 font-medium ${activeTab === tab.id
                                    ? isDarkTheme
                                        ? "text-white"
                                        : "text-gray-800"
                                    : isDarkTheme
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                            >
                                {tab.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content Area */}
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {activeTab === "blog" && (
                    <FlatList
                        data={blogPosts}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        renderItem={({ item, index }) => (
                            <BlogPostItem
                                post={item}
                                index={index}
                                isDark={isDarkTheme}
                                colors={colors}
                                onEdit={() => handleEdit(item.id, "blog")}
                                onDelete={() => handleDelete(item.id, "blog")}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-20">
                                <Feather name="inbox" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                <Text
                                    className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Nenhum post encontrado
                                </Text>
                            </View>
                        }
                    />
                )}

                {activeTab === "pets" && (
                    <FlatList
                        data={pets}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        renderItem={({ item, index }) => (
                            <PetItem
                                pet={item}
                                index={index}
                                isDark={isDarkTheme}
                                colors={colors}
                                onEdit={() => handleEdit(item.id, "pet")}
                                onDelete={() => handleDelete(item.id, "pet")}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-20">
                                <Feather name="inbox" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                <Text
                                    className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Nenhum pet encontrado
                                </Text>
                            </View>
                        }
                    />
                )}

                {activeTab === "users" && (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        renderItem={({ item, index }) => (
                            <UserItem
                                user={item}
                                index={index}
                                isDark={isDarkTheme}
                                colors={colors}
                                onEdit={() => handleEdit(item.id, "user")}
                                onDelete={() => handleDelete(item.id, "user")}
                            />
                        )}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-20">
                                <Feather name="inbox" size={48} color={isDarkTheme ? "#6B7280" : "#9CA3AF"} />
                                <Text
                                    className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
                                    style={Platform.select({
                                        ios: { fontFamily: "San Francisco" },
                                        android: { fontFamily: "Roboto" },
                                    })}
                                >
                                    Nenhum usuário encontrado
                                </Text>
                            </View>
                        }
                    />
                )}

                {activeTab === "settings" && <SettingsPanel isDark={isDarkTheme} colors={colors} />}
            </Animated.View>

            {/* Floating Action Button */}
            {activeTab !== "settings" && (
                <TouchableOpacity
                    onPress={handleAdd}
                    className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
                    style={{
                        backgroundColor: colors.secondary,
                        ...styles.fabShadow,
                    }}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    )
}

// Blog Post Item Component
interface BlogPostItemProps {
    post: BlogPost
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function BlogPostItem({ post, index, isDark, colors, onEdit, onDelete }: BlogPostItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
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
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`mb-5 rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="flex-row">
                    <Image source={{ uri: post.image }} className="w-24 h-24 object-cover" />
                    <View className="flex-1 p-3 justify-center">
                        <View className="flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={1}
                            >
                                {post.title}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {post.author} • {post.date}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: post.status === "published" ? `${colors.primary}20` : `${colors.error}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: post.status === "published" ? colors.primary : colors.error,
                                    }}
                                >
                                    {post.status === "published" ? "Publicado" : "Rascunho"}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-3 justify-center">
                        <TouchableOpacity onPress={onEdit} className="mb-3">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

// Pet Item Component
interface PetItemProps {
    pet: Pet
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function PetItem({ pet, index, isDark, colors, onEdit, onDelete }: PetItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
                    useNativeDriver: true,
                }),
            ]).start()
        }, index * 100)

        return () => clearTimeout(timeout)
    }, [])

    const getStatusColor = () => {
        switch (pet.status) {
            case "available":
                return colors.primary
            case "pending":
                return colors.secondary
            case "adopted":
                return colors.success || "#10B981"
            default:
                return colors.primary
        }
    }

    const getStatusText = () => {
        switch (pet.status) {
            case "available":
                return "Disponível"
            case "pending":
                return "Em processo"
            case "adopted":
                return "Adotado"
            default:
                return pet.status
        }
    }

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={`mb-5 rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="flex-row">
                    <Image source={{ uri: pet.image }} className="w-24 h-24 object-cover" />
                    <View className="flex-1 p-3 justify-center">
                        <View className="flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={1}
                            >
                                {pet.name}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {pet.type} • {pet.breed} • {pet.age}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: `${getStatusColor()}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: getStatusColor(),
                                    }}
                                >
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-3 justify-center">
                        <TouchableOpacity onPress={onEdit} className="mb-3">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

// User Item Component
interface UserItemProps {
    user: User
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function UserItem({ user, index, isDark, colors, onEdit, onDelete }: UserItemProps) {
    const [fadeAnim] = useState(new Animated.Value(0))
    const [slideAnim] = useState(new Animated.Value(50))

    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    useEffect(() => {
        // Staggered animation for each item
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    speed: 12,
                    bounciness: 6,
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
                transform: [{ translateY: slideAnim }],
            }}
            className="mb-4"
        >
            <View
                className={` mb-5 rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
            >
                <View className="flex-row">
                    <Image
                        source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random` }}
                        className="w-16 h-16 rounded-full m-4"
                    />
                    <View className="flex-1 py-3 justify-center">
                        <View className="flex-row items-center justify-between">
                            <Text
                                className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                                style={Platform.select({
                                    ios: { fontFamily: "San Francisco" },
                                    android: { fontFamily: "Roboto" },
                                })}
                                numberOfLines={1}
                            >
                                {user.name}
                            </Text>
                        </View>
                        <Text
                            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {user.email}
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <View
                                className="px-2 py-1 rounded-full mr-2"
                                style={{
                                    backgroundColor: user.role === "admin" ? `${colors.secondary}20` : `${colors.primary}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: user.role === "admin" ? colors.secondary : colors.primary,
                                    }}
                                >
                                    {user.role === "admin" ? "Admin" : "Usuário"}
                                </Text>
                            </View>
                            <View
                                className="px-2 py-1 rounded-full"
                                style={{
                                    backgroundColor: user.status === "active" ? `${colors.success || "#10B981"}20` : `${colors.error}20`,
                                }}
                            >
                                <Text
                                    className="text-xs font-medium"
                                    style={{
                                        color: user.status === "active" ? colors.success || "#10B981" : colors.error,
                                    }}
                                >
                                    {user.status === "active" ? "Ativo" : "Inativo"}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-3 justify-center">
                        <TouchableOpacity onPress={onEdit} className="mb-3">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.primary}15` }}
                            >
                                <Feather name="edit-2" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onDelete}>
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: `${colors.error}15` }}
                            >
                                <Feather name="trash-2" size={16} color={colors.error} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )
}

// Settings Panel Component
interface SettingsPanelProps {
    isDark: boolean
    colors: any
}

function SettingsPanel({ isDark, colors }: SettingsPanelProps) {
    const isIOS = Platform.OS === "ios"
    const isAndroid = Platform.OS === "android"

    const settingsSections = [
        {
            id: "notifications",
            title: "Notificações",
            icon: "bell",
            items: [
                {
                    id: "push",
                    title: "Configurar notificações push",
                    icon: "bell",
                    action: () => Alert.alert("Configurações de Notificações", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "email",
                    title: "Configurar emails automáticos",
                    icon: "mail",
                    action: () => Alert.alert("Configurações de Email", "Funcionalidade em desenvolvimento"),
                },
            ],
        },
        {
            id: "appearance",
            title: "Aparência",
            icon: "layout",
            items: [
                {
                    id: "theme",
                    title: "Personalizar tema do aplicativo",
                    icon: "layout",
                    action: () => Alert.alert("Configurações de Tema", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "logo",
                    title: "Alterar logo e imagens",
                    icon: "image",
                    action: () => Alert.alert("Configurações de Logo", "Funcionalidade em desenvolvimento"),
                },
            ],
        },
        {
            id: "system",
            title: "Sistema",
            icon: "settings",
            items: [
                {
                    id: "backup",
                    title: "Backup e restauração",
                    icon: "database",
                    action: () => Alert.alert("Backup", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "logs",
                    title: "Logs do sistema",
                    icon: "file-text",
                    action: () => Alert.alert("Logs", "Funcionalidade em desenvolvimento"),
                },
                {
                    id: "info",
                    title: "Informações do aplicativo",
                    icon: "info",
                    action: () => Alert.alert("Versão", "Versão atual: 1.0.0"),
                },
            ],
        },
    ]

    return (
        <ScrollView className="flex-1 p-4">
            {settingsSections.map((section) => (
                <View key={section.id} className="mb-6">
                    <View className="flex-row items-center mb-3">
                        <View
                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Feather name={section.icon as any} size={16} color={colors.primary} />
                        </View>
                        <Text
                            className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            {section.title}
                        </Text>
                    </View>

                    <View
                        className={`rounded-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
                        style={isIOS ? styles.iosShadow : isAndroid ? styles.androidShadow : styles.webShadow}
                    >
                        {section.items.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={item.action}
                                className={`flex-row items-center justify-between p-4 ${index < section.items.length - 1 ? "border-b border-gray-200" : ""
                                    }`}
                            >
                                <View className="flex-row items-center">
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: `${colors.primary}10` }}
                                    >
                                        <Feather name={item.icon as any} size={18} color={colors.primary} />
                                    </View>
                                    <Text
                                        className={`${isDark ? "text-white" : "text-gray-800"}`}
                                        style={Platform.select({
                                            ios: { fontFamily: "San Francisco" },
                                            android: { fontFamily: "Roboto" },
                                        })}
                                    >
                                        {item.title}
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
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
    fabShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
})
