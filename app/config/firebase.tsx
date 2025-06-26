import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth"
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
    setDoc,
} from "firebase/firestore"
import {
    getStorage,
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage"
import { Alert, Platform } from "react-native"
import messaging from "@react-native-firebase/messaging"
import { useNavigation } from "@react-navigation/native"
import { getDatabase, ref, onValue, off, get, set, update, remove, push } from "firebase/database"

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_APPKEY,
    authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECTID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.EXPO_PUBLIC_APPID,
    databaseURL: process.env.EXPO_PUBLIC_DATABASEURL,
}

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const database = getDatabase(app)

// Tipos
export interface BlogPost {
    id?: string
    title: string
    content: string
    excerpt: string
    author: string
    authorId: string
    authorAvatar?: string
    date?: number | string
    image: string
    likes?: number
    comments?: number
    category?: string
    status: "published" | "draft"
    readTime?: string
}

export interface Pet {
    id?: string
    name: string
    age: string
    type: string
    breed: string
    gender: string
    size: string
    color: string
    description: string
    history: string
    images: string[]
    requirements: string[]
    location: string
    contactPhone?: string
    contactEmail?: string
    vaccinated: boolean
    neutered: boolean
    specialNeeds: boolean
    specialNeedsDescription?: string
    status: "available" | "adopted" | "pending"
    createdAt?: number | string
    updatedAt?: number | string
    createdBy?: string
}

export interface Comment {
    id?: string
    postId: string
    author: string
    authorId: string
    authorAvatar?: string
    date?: number | string
    content: string
    likes?: number
}

export interface UserProfile {
    uid: string
    email: string
    displayName?: string
    first_name?: string
    last_name?: string
    photoURL?: string
    phone?: string
    bio?: string
    role: "admin" | "user"
    status: "active" | "inactive"
    createdAt?: number | string
    logginFormat?: string
    fcmToken?: string
    petPreferences?: string[]
    expoPushToken?: string
}

// Serviço de Autenticação
export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()
            resolve(user)
        })
    })
}

export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error("Error signing out:", error)
        throw error
    }
}

export const setupFCM = async (): Promise<void> => {
    const router = useNavigation()
    const authStatus = await messaging().requestPermission()
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (Platform.OS === "android") {
        const settings = await messaging().requestPermission()
        if (settings === messaging.AuthorizationStatus.AUTHORIZED) {
            console.log("FCM permission granted")
        } else {
            console.log("FCM permission denied")
        }
    }
    if (enabled) {
        Alert.alert("FCM permission granted")
        await updateUserProfile(auth.currentUser?.uid || "", {
            fcmToken: await messaging().getToken(),
        })
        messaging().onMessage((remoteMessage) => {
            Alert.alert(
                remoteMessage.notification?.title || "Você tem uma nova notificação",
                remoteMessage.notification?.body || "Você recebeu uma nova mensagem.",
            )
        })
        messaging().onNotificationOpenedApp((remoteMessage) => {
            router.navigate({ name: "AdoptDetails", params: { id: remoteMessage?.data?.petId || "" } } as never)
        })

        const initalNotification = await messaging().getInitialNotification()
        if (initalNotification) {
            router.navigate({ name: "AdoptDetails", params: { id: initalNotification?.data?.petId || "" } } as never)
        }
    }
}

// Verificar se o usuário é administrador
export const isUserAdmin = async (userId: string): Promise<boolean> => {
    try {
        const userRef = ref(database, `users/${userId}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
            const userData = snapshot.val() as UserProfile
            return userData.role === "admin"
        }
        return false
    } catch (error) {
        console.error("Error checking admin status:", error)
        return false
    }
}

// Serviço de Blog Posts
export const getBlogPosts = async (category?: string, limit_count = 10, onlyPublished = true): Promise<BlogPost[]> => {
    try {
        const postsRef = ref(database, "blog_posts")
        const snapshot = await get(postsRef)

        if (!snapshot.exists()) {
            return []
        }

        let posts: BlogPost[] = []
        const postsData = snapshot.val()

        Object.keys(postsData).forEach((key) => {
            posts.push({
                id: key,
                ...postsData[key],
            })
        })

        // Filtrar apenas posts publicados se solicitado
        if (onlyPublished) {
            posts = posts.filter((post) => post.status === "published")
        }

        // Filtrar por categoria
        if (category && category !== "Todos") {
            posts = posts.filter((post) => post.category === category)
        }

        // Ordenar por data (do mais recente pro mais antigo)
        posts = posts.sort((a, b) => {
            const dateA = typeof a.date === "number" ? a.date : new Date(a.date || 0).getTime()
            const dateB = typeof b.date === "number" ? b.date : new Date(b.date || 0).getTime()
            return dateB - dateA
        })

        // Limitar a quantidade de posts
        return posts.slice(0, limit_count)
    } catch (error: any) {
        console.error("Erro ao buscar posts:", error.message)
        throw new Error("Não foi possível carregar os posts do blog.")
    }
}

export const getBlogPostById = async (postId: string): Promise<BlogPost | null> => {
    try {
        const postRef = ref(database, `blog_posts/${postId}`)
        const snapshot = await get(postRef)

        if (snapshot.exists()) {
            return {
                id: postId,
                ...(snapshot.val() as BlogPost),
            }
        }

        return null
    } catch (error) {
        console.error("Error fetching blog post:", error)
        throw error
    }
}

export const createBlogPost = async (post: BlogPost): Promise<string> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can create blog posts")

        // Criar nova referência com ID único
        const postsRef = ref(database, "blog_posts")
        const newPostRef = push(postsRef)
        const postId = newPostRef.key!

        // Adicionar metadados
        const postWithMetadata = {
            ...post,
            id: postId,
            authorId: currentUser.uid,
            date: Date.now(),
            likes: 0,
            comments: 0,
        }

        await set(newPostRef, postWithMetadata)
        return postId
    } catch (error) {
        console.error("Error creating blog post:", error)
        throw error
    }
}

export const updateBlogPost = async (postId: string, post: Partial<BlogPost>): Promise<void> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can update blog posts")

        const postRef = ref(database, `blog_posts/${postId}`)
        const updates = {
            ...post,
            updatedAt: Date.now(),
        }

        await update(postRef, updates)
    } catch (error) {
        console.error("Error updating blog post:", error)
        throw error
    }
}

export const deleteBlogPost = async (postId: string): Promise<void> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can delete blog posts")

        // Excluir o post
        const postRef = ref(database, `blog_posts/${postId}`)
        await remove(postRef)

        // Também excluir comentários relacionados
        const commentsRef = ref(database, "comments")
        const commentsSnapshot = await get(commentsRef)

        if (commentsSnapshot.exists()) {
            const commentsData = commentsSnapshot.val()
            const updates: { [key: string]: null } = {}

            Object.keys(commentsData).forEach((commentId) => {
                if (commentsData[commentId].postId === postId) {
                    updates[`comments/${commentId}`] = null
                }
            })

            if (Object.keys(updates).length > 0) {
                await update(ref(database), updates)
            }
        }
    } catch (error) {
        console.error("Error deleting blog post:", error)
        throw error
    }
}

// Serviço de Comentários
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
    try {
        const commentsRef = ref(database, "comments")
        const snapshot = await get(commentsRef)

        if (!snapshot.exists()) {
            return []
        }

        const comments: Comment[] = []
        const commentsData = snapshot.val()

        Object.keys(commentsData).forEach((key) => {
            if (commentsData[key].postId === postId) {
                comments.push({
                    id: key,
                    ...commentsData[key],
                })
            }
        })

        // Ordenar por data (do mais recente pro mais antigo)
        return comments.sort((a, b) => {
            const dateA = typeof a.date === "number" ? a.date : new Date(a.date || 0).getTime()
            const dateB = typeof b.date === "number" ? b.date : new Date(b.date || 0).getTime()
            return dateB - dateA
        })
    } catch (error) {
        console.error("Error fetching comments:", error)
        throw error
    }
}

export const addComment = async (comment: Comment): Promise<string> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Criar nova referência com ID único
        const commentsRef = ref(database, "comments")
        const newCommentRef = push(commentsRef)
        const commentId = newCommentRef.key!

        // Adicionar metadados
        const commentWithMetadata = {
            ...comment,
            id: commentId,
            authorId: currentUser.uid,
            date: Date.now(),
            likes: 0,
        }

        await set(newCommentRef, commentWithMetadata)

        // Atualizar contador de comentários no post
        const postRef = ref(database, `blog_posts/${comment.postId}`)
        const postSnapshot = await get(postRef)

        if (postSnapshot.exists()) {
            const postData = postSnapshot.val() as BlogPost
            await update(postRef, {
                comments: (postData.comments || 0) + 1,
            })
        }

        return commentId
    } catch (error) {
        console.error("Error adding comment:", error)
        throw error
    }
}

// Serviço de Pets
export const getPets = async (type?: string, status = "available", limit_count = 10): Promise<Pet[]> => {
    try {
        const petsRef = ref(database, "pets")
        const snapshot = await get(petsRef)

        if (!snapshot.exists()) {
            return []
        }

        let pets: Pet[] = []
        const petsData = snapshot.val()

        Object.keys(petsData).forEach((key) => {
            pets.push({
                id: key,
                ...petsData[key],
            })
        })

        // Filtrar por status
        if (status && status !== "all") {
            pets = pets.filter((pet) => pet.status === status)
        }

        // Filtrar por tipo
        if (type && type !== "all") {
            pets = pets.filter((pet) => pet.type.toLowerCase() === type.toLowerCase())
        }

        // Ordenar por data (do mais recente pro mais antigo)
        pets = pets.sort((a, b) => {
            const dateA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime()
            const dateB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime()
            return dateB - dateA
        })

        // Limitar a quantidade de pets
        return pets.slice(0, limit_count)
    } catch (error) {
        console.error("Error fetching pets:", error)
        throw error
    }
}

export const getPetById = async (petId: string): Promise<Pet | null> => {
    try {
        const petRef = ref(database, `pets/${petId}`)
        const snapshot = await get(petRef)

        if (snapshot.exists()) {
            return {
                id: petId,
                ...(snapshot.val() as Pet),
            }
        }

        return null
    } catch (error) {
        console.error("Error fetching pet:", error)
        throw error
    }
}

export const createPet = async (pet: Pet): Promise<string> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Criar nova referência com ID único
        const petsRef = ref(database, "pets")
        const newPetRef = push(petsRef)
        const petId = newPetRef.key!

        const petWithMetadata = {
            ...pet,
            id: petId,
            createdBy: currentUser.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }

        await set(newPetRef, petWithMetadata)
        return petId
    } catch (error) {
        console.error("Error creating pet:", error)
        throw error
    }
}

export const updatePet = async (petId: string, pet: Partial<Pet>): Promise<void> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can update pets")

        const petRef = ref(database, `pets/${petId}`)

        // Verificar se o pet existe
        const snapshot = await get(petRef)
        if (!snapshot.exists()) {
            throw new Error(`Pet with ID "${petId}" does not exist.`)
        }

        const updates = {
            ...pet,
            updatedAt: Date.now(),
        }

        await update(petRef, updates)
    } catch (error) {
        console.error("Error updating pet:", error)
        throw error
    }
}

export const deletePet = async (petId: string): Promise<void> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can delete pets")

        const petRef = ref(database, `pets/${petId}`)
        await remove(petRef)
    } catch (error) {
        console.error("Error deleting pet:", error)
        throw error
    }
}

// Serviço de Upload de Imagens
export const uploadImage = async (
    uri: string,
    path: string,
    onProgress?: (progress: number) => void,
): Promise<string> => {
    try {
        // Adicionar verificação de URI
        if (!uri) {
            throw new Error("URI da imagem não fornecida")
        }

        // Obter o blob da imagem com tratamento de erros
        let blob: Blob
        try {
            const response = await fetch(uri)
            if (!response.ok) {
                throw new Error(`Falha ao buscar imagem: ${response.status}`)
            }
            blob = await response.blob()
        } catch (error) {
            console.error("Erro ao converter imagem para blob:", error)
            throw new Error("Não foi possível processar a imagem")
        }

        // Criar referência no Storage com metadados
        const imageRef = storageRef(storage, path)
        const metadata = {
            contentType: blob.type || "image/jpeg",
            cacheControl: "public, max-age=31536000",
        }

        // Iniciar upload com metadados
        const uploadTask = uploadBytesResumable(imageRef, blob, metadata)

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    if (onProgress) onProgress(Math.round(progress))
                },
                (error) => {
                    console.error("Erro no upload:", error)
                    reject(new Error("Falha no upload da imagem"))
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                        resolve(downloadURL)
                    } catch (error) {
                        console.error("Erro ao obter URL de download:", error)
                        reject(new Error("Falha ao obter URL da imagem"))
                    }
                },
            )
        })
    } catch (error) {
        console.error("Erro no processo de upload:", error)
        throw error
    }
}

export const deleteImage = async (path: string): Promise<void> => {
    try {
        const imageRef = storageRef(storage, path)
        await deleteObject(imageRef)
    } catch (error) {
        console.error("Error deleting image:", error)
        throw error
    }
}

// Serviço de Usuários
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userRef = ref(database, `users/${userId}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
            return {
                ...(snapshot.val() as UserProfile),
                uid: userId,
            }
        }

        return null
    } catch (error) {
        console.error("Error fetching user profile:", error)
        throw error
    }
}

export const createUser = async (user: UserProfile): Promise<string> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can create users")

        // Usar o UID do usuário atual como chave
        const userId = currentUser.uid
        const userRef = ref(database, `users/${userId}`)

        // Adicionar metadados
        const userWithMetadata = {
            ...user,
            uid: userId,
            createdAt: Date.now(),
            role: "user",
            status: "active",
        }

        await set(userRef, userWithMetadata)
        return userId
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
        const userRef = ref(database, `users/${userId}`)

        // Verificar se o usuário tem o campo logginFormat e formatar do jeito correto
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
            const userData = snapshot.val() as UserProfile
            if (userData.logginFormat && data.logginFormat && userData.logginFormat !== data.logginFormat) {
                throw new Error("Cannot change loggin format once set")
            }
        }

        await update(userRef, data)
    } catch (error) {
        console.error("Error updating user profile:", error)
        throw error
    }
}

export const subscribeToPetTopic = async (petType: string): Promise<void> => {
    try {
        const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, "")
        await messaging().subscribeToTopic(topic)
        console.log(`Subscribed to topic: ${topic}`)
    } catch (error) {
        console.error("Error subscribing to topic:", error)
        throw error
    }
}

export const unsubscribeFromPetTopic = async (petType: string) => {
    try {
        const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, "")
        await messaging().unsubscribeFromTopic(topic)
        console.log(`Unsubscribed from topic: ${topic}`)
    } catch (error) {
        console.error(`Error unsubscribing to topic: `, error)
    }
}

export const manageUserPetPreferences = async (userId: string, newPreferences: string[]) => {
    try {
        const currentUserProfile = await getUserProfile(userId)
        const oldPreferences = currentUserProfile?.petPreferences || []

        const topicsToSubscribe = newPreferences.filter((pref) => !oldPreferences.includes(pref))
        for (const topic of topicsToSubscribe) {
            await subscribeToPetTopic(topic)
        }

        const topicsToUnsubscribe = oldPreferences.filter((pref) => !newPreferences.includes(pref))
        for (const topic of topicsToUnsubscribe) {
            await unsubscribeFromPetTopic(topic)
        }

        await updateUserProfile(userId, { petPreferences: newPreferences })
        console.log("Preferências de pet do usuário atualizadas no Realtime Database e FCM.")
    } catch (error) {
        console.error("Erro ao gerenciar preferências de pet:", error)
        throw error
    }
}

export const deleteUserProfile = async (userId: string): Promise<void> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Verificar se o usuário é admin
        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can delete users")

        const userRef = ref(database, `users/${userId}`)
        await remove(userRef)
    } catch (error) {
        console.error("Error deleting user profile:", error)
        throw error
    }
}

export const getUsers = async (
    limit_count = 10,
    role?: "admin" | "user",
    status?: "active" | "inactive",
): Promise<UserProfile[]> => {
    try {
        const usersRef = ref(database, "users")
        const snapshot = await get(usersRef)

        if (!snapshot.exists()) {
            return []
        }

        let users: UserProfile[] = []
        const usersData = snapshot.val()

        Object.keys(usersData).forEach((key) => {
            users.push({
                uid: key,
                ...usersData[key],
            })
        })

        // Filtrar por role se especificado
        if (role) {
            users = users.filter((user) => user.role === role)
        }

        // Filtrar por status se especificado
        if (status) {
            users = users.filter((user) => user.status === status)
        }

        // Ordenar por data (do mais recente pro mais antigo)
        users = users.sort((a, b) => {
            const dateA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime()
            const dateB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime()
            return dateB - dateA
        })

        // Limitar a quantidade de usuários
        return users.slice(0, limit_count)
    } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message)
        throw new Error("Não foi possível carregar os usuários.")
    }
}

// Função para verificar e criar estruturas necessárias no Realtime Database
export const initializeFirestore = async (): Promise<void> => {
    try {
        // Verificar se as estruturas existem no Realtime Database
        const collections = ["blog_posts", "pets", "comments", "users"]

        for (const collectionName of collections) {
            const collectionRef = ref(database, collectionName)
            const snapshot = await get(collectionRef)

            if (!snapshot.exists()) {
                console.log(`Collection ${collectionName} is empty or doesn't exist in Realtime Database.`)
                // Aqui você poderia criar estruturas de exemplo se necessário
            }
        }

        console.log("Realtime Database initialized successfully")
    } catch (error) {
        console.error("Error initializing Realtime Database:", error)
    }
}

export const uploadToCloudinary = (uri: string | File, onProgress?: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const formData = new FormData()

        if (Platform.OS === "web") {
            if (!(uri instanceof File)) {
                return reject(new Error("Na web, o arquivo precisa ser do tipo File."))
            }
            formData.append("file", uri)
        } else {
            formData.append("file", {
                uri,
                type: "image/jpeg",
                name: `upload_${Date.now()}.jpg`,
            } as any)
        }

        formData.append("upload_preset", "pca_fixed")

        xhr.open("POST", "https://api.cloudinary.com/v1_1/drwe1wtnk/image/upload")

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100)
                onProgress(percent)
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText)
                    if (data.secure_url) {
                        resolve(data.secure_url)
                    } else {
                        reject(new Error("URL não encontrada na resposta do Cloudinary"))
                    }
                } catch (err) {
                    reject(new Error("Erro ao processar resposta do Cloudinary"))
                }
            } else {
                reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`))
            }
        }

        xhr.onerror = () => {
            reject(new Error("Erro de rede no upload da imagem"))
        }

        xhr.send(formData)
    })
}

// Funções adicionais para aproveitar recursos do Realtime Database

// Listener em tempo real para posts do blog
export const subscribeToBlogs = (callback: (posts: BlogPost[]) => void): (() => void) => {
    const postsRef = ref(database, "blog_posts")

    const unsubscribe = onValue(postsRef, (snapshot) => {
        if (snapshot.exists()) {
            const posts: BlogPost[] = []
            const postsData = snapshot.val()

            Object.keys(postsData).forEach((key) => {
                posts.push({
                    id: key,
                    ...postsData[key],
                })
            })

            // Ordenar por data
            posts.sort((a, b) => {
                const dateA = typeof a.date === "number" ? a.date : new Date(a.date || 0).getTime()
                const dateB = typeof b.date === "number" ? b.date : new Date(b.date || 0).getTime()
                return dateB - dateA
            })

            callback(posts)
        } else {
            callback([])
        }
    })

    return () => off(postsRef, "value", unsubscribe)
}

// Listener em tempo real para pets
export const subscribeToPets = (callback: (pets: Pet[]) => void): (() => void) => {
    const petsRef = ref(database, "pets")

    const unsubscribe = onValue(petsRef, (snapshot) => {
        if (snapshot.exists()) {
            const pets: Pet[] = []
            const petsData = snapshot.val()

            Object.keys(petsData).forEach((key) => {
                pets.push({
                    id: key,
                    ...petsData[key],
                })
            })

            // Ordenar por data
            pets.sort((a, b) => {
                const dateA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime()
                const dateB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime()
                return dateB - dateA
            })

            callback(pets)
        } else {
            callback([])
        }
    })

    return () => off(petsRef, "value", unsubscribe)
}

// Listener em tempo real para comentários de um post específico
export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void): (() => void) => {
    const commentsRef = ref(database, "comments")

    const valueCallback = (snapshot: any) => {
        if (snapshot.exists()) {
            const comments: Comment[] = []
            const commentsData = snapshot.val()

            Object.keys(commentsData).forEach((key) => {
                if (commentsData[key].postId === postId) {
                    comments.push({
                        id: key,
                        ...commentsData[key],
                    })
                }
            })

            // Ordenar por data
            comments.sort((a, b) => {
                const dateA = typeof a.date === "number" ? a.date : new Date(a.date || 0).getTime()
                const dateB = typeof b.date === "number" ? b.date : new Date(b.date || 0).getTime()
                return dateB - dateA
            })

            callback(comments)
        } else {
            callback([])
        }
    }

    onValue(commentsRef, valueCallback)

    return () => off(commentsRef, "value", valueCallback)
}
