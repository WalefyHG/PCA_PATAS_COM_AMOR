"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useThemeContext } from "../utils/ThemeContext"
import { useNavigation } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import {
    getBlogPosts,
    getPets,
    deleteBlogPost,
    deletePet,
    isUserAdmin,
    type BlogPost,
    type Pet,
    getUsers,
    type UserProfile,
    deleteUserProfile,
} from "../config/firebase"
import { auth } from "../config/firebase"
import HeaderLayout from "../utils/HeaderLayout"
import { ConfirmModal } from "../utils/ConfirmModal"
import type { User } from "firebase/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    BookOpen,
    Heart,
    Users,
    Settings,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Inbox,
    Bell,
    Mail,
    Layout,
    Database,
    FileText,
    Info,
    ChevronRight,
    UserIcon,
    Loader2,
} from "lucide-react"

// Tipos para os dados
interface AdminTab {
    id: string
    title: string
    icon: React.ComponentType<any>
}

export default function AdminConsoleWeb() {
    const { isDarkTheme, colors } = useThemeContext()
    const navigation = useNavigation<any>()
    const [activeTab, setActiveTab] = useState<string>("blog")
    const [refreshing, setRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null)

    const { t } = useTranslation()

    // Dados
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [pets, setPets] = useState<Pet[]>([])
    const [users, setUsers] = useState<UserProfile[]>([])

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (auth.currentUser) {
                const adminStatus = await isUserAdmin(auth.currentUser.uid)
                setIsAdmin(adminStatus)

                if (!adminStatus) {
                    if (typeof window !== "undefined") {
                        window.alert("Acesso Restrito: Apenas administradores podem acessar esta página.")
                        navigation.goBack()
                    }
                } else {
                    // Carregar dados iniciais
                    fetchData()
                }
            } else {
                if (typeof window !== "undefined") {
                    window.alert("Não Autenticado: Você precisa estar logado para acessar esta página.")
                    navigation.goBack()
                }
            }
        }

        checkAdminStatus()
    }, [navigation])

    useEffect(() => {
        if (isAdmin) {
            fetchData()
        }
    }, [activeTab, isAdmin])

    useEffect(() => {
        if (!isAdmin) {
            const timer = setTimeout(() => {
                navigation.goBack()
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [isAdmin, navigation])

    const fetchData = async () => {
        setIsLoading(true)

        try {
            if (activeTab === "blog") {
                // Buscar todos os posts (publicados e rascunhos)
                const posts = await getBlogPosts("", 20, false)
                setBlogPosts(posts)
            } else if (activeTab === "pets") {
                // Buscar todos os pets (disponíveis, pendentes e adotados)
                const allPets = await getPets("", "", 20)
                setPets(allPets)
            } else if (activeTab === "users") {
                const allUser = await getUsers(20)
                setUsers(allUser)
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab} data:`, error)
            if (typeof window !== "undefined") {
                window.alert(`Ocorreu um erro ao carregar os dados de ${activeTab}.`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
    }

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        fetchData()
    }

    const handleEdit = (id: string, type: string) => {
        if (type === "blog") {
            navigation.navigate("AddBlogPost", { postId: id })
        } else if (type === "pet") {
            navigation.navigate("AddPet", { petId: id })
        } else if (type === "users") {
            navigation.navigate("AddUsers", { userId: id })
        }
    }

    const openDeleteModal = (id: string, type: string) => {
        setItemToDelete({ id, type })
        setModalVisible(true)
    }

    // Função que executa a exclusão
    const handleDelete = async (id: string, type: string) => {
        try {
            if (type === "blog") {
                await deleteBlogPost(id)
                setBlogPosts((prev) => prev.filter((post) => post.id !== id))
            } else if (type === "pet") {
                await deletePet(id)
                setPets((prev) => prev.filter((pet) => pet.id !== id))
            } else if (type === "users") {
                await deleteUserProfile(id)
                setUsers((prev) => prev.filter((user) => user.uid !== id))
            }

            if (typeof window !== "undefined") {
                window.alert(`${type === "blog" ? "Post" : type === "pet" ? "Pet" : "Usuário"} excluído com sucesso!`)
            }
        } catch (error) {
            console.error("Erro ao excluir:", error)
            if (typeof window !== "undefined") {
                window.alert(`Ocorreu um erro ao excluir o ${type === "blog" ? "post" : type === "pet" ? "pet" : "usuário"}.`)
            }
        } finally {
            setModalVisible(false)
            setItemToDelete(null)
        }
    }

    const handleAdd = () => {
        if (activeTab === "blog") {
            navigation.navigate("AddBlogPost")
        } else if (activeTab === "pets") {
            navigation.navigate("AddPet")
        } else if (activeTab === "users") {
            navigation.navigate("AddUsers")
        }
    }

    // Abas do Admin Console
    const tabs: AdminTab[] = [
        { id: "blog", title: "Blog", icon: BookOpen },
        { id: "pets", title: "Pets", icon: Heart },
        { id: "users", title: "Usuários", icon: Users },
        { id: "settings", title: "Configurações", icon: Settings },
    ]

    if (!isAdmin) {
        return (
            <div
                className={`flex-1 flex items-center justify-center min-h-screen ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}
            >
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
                    <p className={`text-lg ${isDarkTheme ? "text-white" : "text-gray-800"}`}>Verificando permissões...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${isDarkTheme ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header with gradient */}
            <div
                className="pt-16 pb-4 px-4"
                style={{
                    background: isDarkTheme
                        ? `linear-gradient(90deg, ${colors.primaryDark}, ${colors.secondaryDark})`
                        : `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                }}
            >
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </Button>
                    <h1 className="text-white text-xl font-bold">{t("Admin Console")}</h1>
                    <div className="w-10" />
                </div>
                <div className="absolute right-0 top-20 flex items-center">
                    <HeaderLayout title="Profile" />
                </div>
            </div>

            {/* Tabs Navigation */}
            <Card
                className={`${isDarkTheme ? "bg-gray-800 border-gray-700" : "bg-white"} rounded-none border-x-0 border-t-0`}
            >
                <Card className="p-0">
                    <ScrollArea className="w-full">
                        <div className="flex py-2 px-4 space-x-2">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon
                                return (
                                    <Button
                                        key={tab.id}
                                        variant={activeTab === tab.id ? "secondary" : "ghost"}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id ? (isDarkTheme ? "bg-gray-700" : "bg-gray-100") : "hover:bg-gray-100"
                                            }`}
                                    >
                                        <IconComponent
                                            size={18}
                                            className={
                                                activeTab === tab.id ? "text-primary" : isDarkTheme ? "text-gray-400" : "text-gray-500"
                                            }
                                        />
                                        <span
                                            className={`font-medium ${activeTab === tab.id
                                                ? isDarkTheme
                                                    ? "text-white"
                                                    : "text-gray-800"
                                                : isDarkTheme
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                                }`}
                                        >
                                            {tab.title}
                                        </span>
                                    </Button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </Card>
            </Card>

            {/* Content Area */}
            <div className="flex-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-600">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
                            <p className={`${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>Carregando dados...</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        {activeTab === "blog" && (
                            <div className="space-y-4">
                                {refreshing && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: colors.primary }} />
                                    </div>
                                )}
                                {blogPosts.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <Inbox size={48} className={isDarkTheme ? "text-gray-600" : "text-gray-400"} />
                                            <p className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                                Nenhum post encontrado
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    blogPosts.map((post, index) => (
                                        <BlogPostItem
                                            key={post.id}
                                            post={post}
                                            index={index}
                                            isDark={isDarkTheme}
                                            colors={colors}
                                            onEdit={() => handleEdit(post.id || "", "blog")}
                                            onDelete={() => openDeleteModal(post.id || "", "blog")}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "pets" && (
                            <div className="space-y-4">
                                {refreshing && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: colors.primary }} />
                                    </div>
                                )}
                                {pets.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <Inbox size={48} className={isDarkTheme ? "text-gray-600" : "text-gray-400"} />
                                            <p className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                                Nenhum pet encontrado
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    pets.map((pet, index) => (
                                        <PetItem
                                            key={pet.id}
                                            pet={pet}
                                            index={index}
                                            isDark={isDarkTheme}
                                            colors={colors}
                                            onEdit={() => handleEdit(pet.id || "", "pet")}
                                            onDelete={() => openDeleteModal(pet.id || "", "pet")}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "users" && (
                            <div className="space-y-4">
                                {refreshing && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: colors.primary }} />
                                    </div>
                                )}
                                {users.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <UserIcon size={48} className={isDarkTheme ? "text-gray-600" : "text-gray-400"} />
                                            <p className={`mt-4 text-base ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                                                Nenhum usuário encontrado
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    users.map((user, index) => (
                                        <UserItem
                                            key={user.uid}
                                            user={user}
                                            index={index}
                                            isDark={isDarkTheme}
                                            colors={colors}
                                            onEdit={() => handleEdit(user.uid || "", "users")}
                                            onDelete={() => openDeleteModal(user.uid || "", "users")}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === "settings" && <SettingsPanel isDark={isDarkTheme} colors={colors} />}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {activeTab !== "settings" && (
                <Button
                    onClick={handleAdd}
                    className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    style={{ backgroundColor: colors.secondary }}
                >
                    <Plus size={24} className="text-white" />
                </Button>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                visible={modalVisible}
                message={`Tem certeza que deseja excluir este ${itemToDelete?.type === "blog" ? "post" : itemToDelete?.type === "pet" ? "pet" : "usuário"
                    }?`}
                onConfirm={() => handleDelete(itemToDelete?.id || "", itemToDelete?.type || "")}
                onCancel={() => setModalVisible(false)}
            />
        </div>
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
    return (
        <Card
            className={`overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
        >
            <Card className="p-0">
                <div className="flex">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-24 h-24 object-cover" />
                    <div className="flex-1 p-3 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-base font-bold truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                                {post.title}
                            </h3>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {post.author} •{" "}
                            {post.date instanceof Date
                                ? post.date.toLocaleDateString()
                                : post.date?.toDate?.()?.toLocaleDateString() || "Data não disponível"}
                        </p>
                        <div className="flex items-center mt-2">
                            <Badge
                                variant="outline"
                                className={`text-xs ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {post.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-3 flex flex-col justify-center space-y-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Edit2 size={16} style={{ color: colors.primary }} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.error}15` }}
                        >
                            <Trash2 size={16} style={{ color: colors.error }} />
                        </Button>
                    </div>
                </div>
            </Card>
        </Card>
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
        <Card
            className={`overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
        >
            <Card className="p-0">
                <div className="flex">
                    <img src={pet.images[0] || "/placeholder.svg"} alt={pet.name} className="w-24 h-24 object-cover" />
                    <div className="flex-1 p-3 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-base font-bold truncate ${isDark ? "text-white" : "text-gray-800"}`}>{pet.name}</h3>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {pet.type} • {pet.breed} • {pet.age}
                        </p>
                        <div className="flex items-center mt-2">
                            <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                    backgroundColor: `${getStatusColor()}20`,
                                }}
                            >
                                <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
                            </Badge>
                        </div>
                    </div>
                    <div className="p-3 flex flex-col justify-center space-y-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Edit2 size={16} style={{ color: colors.primary }} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.error}15` }}
                        >
                            <Trash2 size={16} style={{ color: colors.error }} />
                        </Button>
                    </div>
                </div>
            </Card>
        </Card>
    )
}

interface UserItemProps {
    user: UserProfile | User
    index: number
    isDark: boolean
    colors: any
    onEdit: () => void
    onDelete: () => void
}

function UserItem({ user, index, isDark, colors, onEdit, onDelete }: UserItemProps) {
    const getLoginIcon = () => {
        if ("logginFormat" in user && user.logginFormat === "google") {
            return (
                <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                    <span className="text-xs text-red-600">G</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                    <Mail size={14} className="text-blue-600" />
                </div>
            )
        }
    }

    return (
        <Card
            className={`overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
        // If you want animation delay on web, use a CSS variable or style only for web
        >
            <Card className="p-4">
                <div className="flex items-center">
                    <UserIcon size={36} style={{ color: colors.primary }} />
                    <div className="flex-1 ml-4">
                        <h3 className={`text-base font-bold truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                            {user.displayName || user.email?.split("@")[0] || "Usuário sem nome"}
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{user.email}</p>
                        <div className="flex items-center mt-2 space-x-2">
                            {getLoginIcon()}
                            <span className="text-sm text-gray-500">
                                {"logginFormat" in user && user.logginFormat === "google" ? "Login com Google" : "Login com Email"}
                            </span>
                            {"role" in user && user.role === "admin" && (
                                <Badge style={{ backgroundColor: colors.primary }}>
                                    <span className="text-xs text-white font-semibold">Admin</span>
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.primary}15` }}
                        >
                            <Edit2 size={16} style={{ color: colors.primary }} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: `${colors.error}15` }}
                        >
                            <Trash2 size={16} style={{ color: colors.error }} />
                        </Button>
                    </div>
                </div>
            </Card>
        </Card>
    )
}

// Settings Panel Component
interface SettingsPanelProps {
    isDark: boolean
    colors: any
}

function SettingsPanel({ isDark, colors }: SettingsPanelProps) {
    const settingsSections = [
        {
            id: "notifications",
            title: "Notificações",
            icon: Bell,
            items: [
                {
                    id: "push",
                    title: "Configurar notificações push",
                    icon: Bell,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Configurações de Notificações: Funcionalidade em desenvolvimento")
                        }
                    },
                },
                {
                    id: "email",
                    title: "Configurar emails automáticos",
                    icon: Mail,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Configurações de Email: Funcionalidade em desenvolvimento")
                        }
                    },
                },
            ],
        },
        {
            id: "appearance",
            title: "Aparência",
            icon: Layout,
            items: [
                {
                    id: "theme",
                    title: "Personalizar tema do aplicativo",
                    icon: Layout,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Configurações de Tema: Funcionalidade em desenvolvimento")
                        }
                    },
                },
                {
                    id: "logo",
                    title: "Alterar logo e imagens",
                    icon: Layout,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Configurações de Logo: Funcionalidade em desenvolvimento")
                        }
                    },
                },
            ],
        },
        {
            id: "system",
            title: "Sistema",
            icon: Settings,
            items: [
                {
                    id: "backup",
                    title: "Backup e restauração",
                    icon: Database,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Backup: Funcionalidade em desenvolvimento")
                        }
                    },
                },
                {
                    id: "logs",
                    title: "Logs do sistema",
                    icon: FileText,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Logs: Funcionalidade em desenvolvimento")
                        }
                    },
                },
                {
                    id: "info",
                    title: "Informações do aplicativo",
                    icon: Info,
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.alert("Versão: Versão atual: 1.0.0")
                        }
                    },
                },
            ],
        },
    ]

    return (
        <ScrollArea className="h-full">
            <div className="space-y-6">
                {settingsSections.map((section) => {
                    const SectionIcon = section.icon
                    return (
                        <div key={section.id}>
                            <div className="flex items-center mb-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                                    style={{ backgroundColor: `${colors.primary}15` }}
                                >
                                    <SectionIcon size={16} style={{ color: colors.primary }} />
                                </div>
                                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{section.title}</h2>
                            </div>

                            <Card className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
                                <Card className="p-0">
                                    {section.items.map((item, index) => {
                                        const ItemIcon = item.icon
                                        return (
                                            <Button
                                                key={item.id}
                                                variant="ghost"
                                                onClick={item.action}
                                                className={`w-full justify-between p-4 h-auto ${index < section.items.length - 1 ? "border-b border-gray-200" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                                        style={{ backgroundColor: `${colors.primary}10` }}
                                                    >
                                                        <ItemIcon size={18} style={{ color: colors.primary }} />
                                                    </div>
                                                    <span className={`${isDark ? "text-white" : "text-gray-800"}`}>{item.title}</span>
                                                </div>
                                                <ChevronRight size={20} className={isDark ? "text-gray-600" : "text-gray-400"} />
                                            </Button>
                                        )
                                    })}
                                </Card>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}
