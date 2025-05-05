"use client"

import { useState } from "react"
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
} from "react-native"
import { useThemeContext } from "../utils/ThemeContext"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import FloatingActionButton from "../../app/components/FloatingButton"

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
    const { paperTheme } = useThemeContext()
    const navigation = useNavigation<any>()
    const [activeTab, setActiveTab] = useState<string>("blog")
    const [refreshing, setRefreshing] = useState(false)

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

    const renderBlogPosts = () => {
        return (
            <FlatList
                data={blogPosts}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[paperTheme.colors.primary]} />
                }
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.listItem,
                            { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                        ]}
                    >
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, { color: paperTheme.colors.onSurface }]}>{item.title}</Text>
                            <Text style={[styles.itemSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                                {item.author} • {item.date}
                            </Text>
                            <View style={styles.itemStatus}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                item.status === "published" ? paperTheme.colors.primary + "20" : paperTheme.colors.error + "20",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: item.status === "published" ? paperTheme.colors.primary : paperTheme.colors.error,
                                            },
                                        ]}
                                    >
                                        {item.status === "published" ? "Publicado" : "Rascunho"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id, "blog")}>
                                <Feather name="edit-2" size={18} color={paperTheme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, "blog")}>
                                <Feather name="trash-2" size={18} color={paperTheme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={48} color={paperTheme.colors.onSurfaceVariant} />
                        <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                            Nenhum post encontrado
                        </Text>
                    </View>
                }
            />
        )
    }

    const renderPets = () => {
        return (
            <FlatList
                data={pets}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[paperTheme.colors.primary]} />
                }
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.listItem,
                            { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                        ]}
                    >
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, { color: paperTheme.colors.onSurface }]}>{item.name}</Text>
                            <Text style={[styles.itemSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
                                {item.type} • {item.breed} • {item.age}
                            </Text>
                            <View style={styles.itemStatus}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                item.status === "available"
                                                    ? paperTheme.colors.primary + "20"
                                                    : item.status === "pending"
                                                        ? paperTheme.colors.secondary + "20"
                                                        : paperTheme.colors.primary + "20",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color:
                                                    item.status === "available"
                                                        ? paperTheme.colors.primary
                                                        : item.status === "pending"
                                                            ? paperTheme.colors.secondary
                                                            : paperTheme.colors.primary,
                                            },
                                        ]}
                                    >
                                        {item.status === "available" ? "Disponível" : item.status === "pending" ? "Em processo" : "Adotado"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id, "pet")}>
                                <Feather name="edit-2" size={18} color={paperTheme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, "pet")}>
                                <Feather name="trash-2" size={18} color={paperTheme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={48} color={paperTheme.colors.onSurfaceVariant} />
                        <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>Nenhum pet encontrado</Text>
                    </View>
                }
            />
        )
    }

    const renderUsers = () => {
        return (
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[paperTheme.colors.primary]} />
                }
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.listItem,
                            { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
                        ]}
                    >
                        <Image
                            source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=random` }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, { color: paperTheme.colors.onSurface }]}>{item.name}</Text>
                            <Text style={[styles.itemSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>{item.email}</Text>
                            <View style={styles.itemStatus}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                item.role === "admin" ? paperTheme.colors.secondary + "20" : paperTheme.colors.primary + "20",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: item.role === "admin" ? paperTheme.colors.secondary : paperTheme.colors.primary,
                                            },
                                        ]}
                                    >
                                        {item.role === "admin" ? "Admin" : "Usuário"}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor:
                                                item.status === "active" ? paperTheme.colors.primary + "20" : paperTheme.colors.error + "20",
                                            marginLeft: 8,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: item.status === "active" ? paperTheme.colors.primary : paperTheme.colors.error,
                                            },
                                        ]}
                                    >
                                        {item.status === "active" ? "Ativo" : "Inativo"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item.id, "user")}>
                                <Feather name="edit-2" size={18} color={paperTheme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id, "user")}>
                                <Feather name="trash-2" size={18} color={paperTheme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={48} color={paperTheme.colors.onSurfaceVariant} />
                        <Text style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
                            Nenhum usuário encontrado
                        </Text>
                    </View>
                }
            />
        )
    }

    const renderSettings = () => {
        return (
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[paperTheme.colors.primary]} />
                }
            >
                <View style={styles.settingsContainer}>
                    <View style={[styles.settingsCard, { backgroundColor: paperTheme.colors.surface }]}>
                        <Text style={[styles.settingsTitle, { color: paperTheme.colors.onSurface }]}>
                            Configurações do Aplicativo
                        </Text>

                        <View style={styles.settingsSection}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>Notificações</Text>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Configurações de Notificações", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="bell" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Configurar notificações push
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Configurações de Email", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="mail" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Configurar emails automáticos
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsSection}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>Aparência</Text>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Configurações de Tema", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="layout" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Personalizar tema do aplicativo
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Configurações de Logo", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="image" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Alterar logo e imagens
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsSection}>
                            <Text style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}>Sistema</Text>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Backup", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="database" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Backup e restauração
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.settingsItem, { borderBottomColor: paperTheme.colors.outline }]}
                                onPress={() => Alert.alert("Logs", "Funcionalidade em desenvolvimento")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="file-text" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>Logs do sistema</Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.settingsItem}
                                onPress={() => Alert.alert("Versão", "Versão atual: 1.0.0")}
                            >
                                <View style={styles.settingsItemContent}>
                                    <Feather name="info" size={20} color={paperTheme.colors.primary} />
                                    <Text style={[styles.settingsItemText, { color: paperTheme.colors.onSurface }]}>
                                        Informações do aplicativo
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={20} color={paperTheme.colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case "blog":
                return renderBlogPosts()
            case "pets":
                return renderPets()
            case "users":
                return renderUsers()
            case "settings":
                return renderSettings()
            default:
                return renderBlogPosts()
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
            {/* Tabs de navegação */}
            <View style={[styles.tabsContainer, { backgroundColor: paperTheme.colors.surface }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id && [styles.activeTab, { borderColor: paperTheme.colors.primary }],
                            ]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Feather
                                name={tab.icon}
                                size={18}
                                color={activeTab === tab.id ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: activeTab === tab.id ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant,
                                    },
                                ]}
                            >
                                {tab.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Conteúdo principal */}
            <View style={styles.content}>{renderContent()}</View>

            {/* Botão flutuante de adição (não mostrar na aba de configurações) */}
            {activeTab !== "settings" && <FloatingActionButton onPress={handleAdd} />}
        </View>
    )
}

const styles = StyleSheet.create({
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
    placeholder: {
        width: 40,
    },
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    tabsScrollContent: {
        paddingHorizontal: 8,
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        marginLeft: 8,
        fontWeight: "500",
    },
    content: {
        flex: 1,
    },
    listItem: {
        flexDirection: "row",
        borderBottomWidth: 1,
        padding: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    itemContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    itemStatus: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    itemActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    },
    settingsContainer: {
        padding: 16,
    },
    settingsCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    settingsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    settingsItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    settingsItemContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    settingsItemText: {
        fontSize: 16,
        marginLeft: 12,
    },
})
