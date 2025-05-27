import { initializeApp } from "firebase/app"
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
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage"
import { Alert, Platform } from "react-native"

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_APPKEY,
    authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECTID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.EXPO_PUBLIC_APPID,
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Tipos
export interface BlogPost {
    id?: string
    title: string
    content: string
    excerpt: string
    author: string
    authorId: string
    authorAvatar?: string
    date?: Timestamp | Date
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
    createdAt?: Timestamp | Date
    updatedAt?: Timestamp | Date
    createdBy?: string
}

export interface Comment {
    id?: string
    postId: string
    author: string
    authorId: string
    authorAvatar?: string
    date?: Timestamp | Date
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
    createdAt?: Timestamp | Date
    logginFormat?: string
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

// Verificar se o usuário é administrador
export const isUserAdmin = async (userId: string): Promise<boolean> => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            return userData.role === "admin"
        }
        return false
    } catch (error) {
        console.error("Error checking admin status:", error)
        return false
    }
}

// Serviço de Blog Posts
const ALL_CATEGORIES = "Todos"

export const getBlogPosts = async (
    category?: string,
    limit_count: number = 10,
    onlyPublished: boolean = true
): Promise<BlogPost[]> => {
    try {
        const snapshot = await getDocs(collection(db, "blog_posts"))

        let posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as BlogPost[]

        // Filtrar por categoria
        if (category && category !== "Todos") {
            posts = posts.filter((post) => post.category === category)
        }

        // Ordenar por data (do mais recente pro mais antigo)
        posts = posts.sort((a, b) => {
            const getTime = (date: Timestamp | Date | undefined) => {
                if (!date) return 0;
                if (typeof (date as any).toDate === "function") {
                    // Firestore Timestamp
                    return (date as Timestamp).toDate().getTime();
                }
                if (date instanceof Date) {
                    return date.getTime();
                }
                return 0;
            };
            const dateA = getTime(a.date);
            const dateB = getTime(b.date);
            return dateB - dateA;
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
        const docRef = doc(db, "blog_posts", postId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data() as BlogPost,
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

        // Adicionar metadados
        const postWithMetadata = {
            ...post,
            authorId: currentUser.uid,
            date: serverTimestamp(),
            likes: 0,
            comments: 0,
        }

        const docRef = await addDoc(collection(db, "blog_posts"), postWithMetadata)

        await updateDoc(doc(db, "blog_posts", docRef.id), {
            id: docRef.id,
        })

        return docRef.id
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

        const docRef = doc(db, "blog_posts", postId)
        await updateDoc(docRef, {
            ...post,
            updatedAt: serverTimestamp(),
        })
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
        const docRef = doc(db, "blog_posts", postId)
        await deleteDoc(docRef)

        // Também excluir comentários relacionados
        const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId))
        const commentsSnapshot = await getDocs(commentsQuery)

        const deletePromises = commentsSnapshot.docs.map((commentDoc) =>
            deleteDoc(doc(db, "comments", commentDoc.id))
        )

        await Promise.all(deletePromises)
    } catch (error) {
        console.error("Error deleting blog post:", error)
        throw error
    }
}

// Serviço de Comentários
export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, "comments"),
            where("postId", "==", postId),
            orderBy("date", "desc")
        )

        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data() as Comment,
        }))
    } catch (error) {
        console.error("Error fetching comments:", error)
        throw error
    }
}

export const addComment = async (comment: Comment): Promise<string> => {
    try {
        const currentUser = auth.currentUser
        if (!currentUser) throw new Error("User not authenticated")

        // Adicionar metadados
        const commentWithMetadata = {
            ...comment,
            authorId: currentUser.uid,
            date: serverTimestamp(),
            likes: 0,
        }

        const docRef = await addDoc(collection(db, "comments"), commentWithMetadata)

        // Atualizar contador de comentários no post
        const postRef = doc(db, "blog_posts", comment.postId)
        const postDoc = await getDoc(postRef)

        if (postDoc.exists()) {
            const postData = postDoc.data() as BlogPost
            await updateDoc(postRef, {
                comments: (postData.comments || 0) + 1,
            })
        }

        return docRef.id
    } catch (error) {
        console.error("Error adding comment:", error)
        throw error
    }
}

// Serviço de Pets
export const getPets = async (
    type?: string,
    status: string = "available",
    limit_count: number = 10
): Promise<Pet[]> => {
    try {
        const snapshot = await getDocs(collection(db, "pets"))

        let pets = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Pet[]

        // Filtrar por categoria
        if (status && status !== "available") {
            pets = pets.filter((pet) => pet.status === status)
        }

        // Ordenar por data (do mais recente pro mais antigo)
        pets = pets.sort((a, b) => {
            const getTime = (date: Timestamp | Date | undefined) => {
                if (!date) return 0;
                if (typeof (date as any).toDate === "function") {
                    // Firestore Timestamp
                    return (date as Timestamp).toDate().getTime();
                }
                if (date instanceof Date) {
                    return date.getTime();
                }
                return 0;
            };
            const dateA = getTime(a.createdAt);
            const dateB = getTime(b.createdAt);
            return dateB - dateA;
        })

        // Limitar a quantidade de posts
        return pets.slice(0, limit_count)
    } catch (error) {
        console.error("Error fetching pets:", error)
        throw error
    }
}

export const getPetById = async (petId: string): Promise<Pet | null> => {
    try {
        const docRef = doc(db, "pets", petId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data() as Pet,
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

        const isAdmin = await isUserAdmin(currentUser.uid)
        if (!isAdmin) throw new Error("Unauthorized: Only admins can create pets")

        const petWithMetadata = {
            ...pet,
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "pets"), petWithMetadata)

        await updateDoc(doc(db, "pets", docRef.id), {
            id: docRef.id,
        })

        return docRef.id
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

        const docRef = doc(db, "pets", petId)

        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            throw new Error(`Pet with ID "${petId}" does not exist.`)
        }

        await updateDoc(docRef, {
            ...pet,
            updatedAt: serverTimestamp(),
        })
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

        const docRef = doc(db, "pets", petId)
        await deleteDoc(docRef)
    } catch (error) {
        console.error("Error deleting pet:", error)
        throw error
    }
}

// Serviço de Upload de Imagens
export const uploadImage = async (
    uri: string,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        // Adicionar verificação de URI
        if (!uri) {
            throw new Error("URI da imagem não fornecida");
        }

        // Obter o blob da imagem com tratamento de erros
        let blob: Blob;
        try {
            const response = await fetch(uri);
            if (!response.ok) {
                throw new Error(`Falha ao buscar imagem: ${response.status}`);
            }
            blob = await response.blob();
        } catch (error) {
            console.error("Erro ao converter imagem para blob:", error);
            throw new Error("Não foi possível processar a imagem");
        }

        // Criar referência no Storage com metadados
        const storageRef = ref(storage, path);
        const metadata = {
            contentType: blob.type || 'image/jpeg', // Tipo padrão se não detectado
            cacheControl: 'public, max-age=31536000', // Cache por 1 ano
        };

        // Iniciar upload com metadados
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(Math.round(progress));
                },
                (error) => {
                    console.error("Erro no upload:", error);
                    reject(new Error("Falha no upload da imagem"));
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("Erro ao obter URL de download:", error);
                        reject(new Error("Falha ao obter URL da imagem"));
                    }
                }
            );
        });
    } catch (error) {
        console.error("Erro no processo de upload:", error);
        throw error;
    }
};

export const deleteImage = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path)
        await deleteObject(storageRef)
    } catch (error) {
        console.error("Error deleting image:", error)
        throw error
    }
}

// Serviço de Usuários
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, "users", userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return {
                ...(docSnap.data() as UserProfile),
                uid: docSnap.id,
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

        // Adicionar metadados
        const userWithMetadata = {
            ...user,
            uid: currentUser.uid,
            createdAt: serverTimestamp(),
            role: "user",
            status: "active",
        }

        const docRef = await addDoc(collection(db, "users"), userWithMetadata)

        await updateDoc(doc(db, "users", docRef.id), {
            uid: docRef.id,
        })

        return docRef.id
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
        const docRef = doc(db, "users", userId)

        // Verificar se o usuário tem o campo logginFormat e formatar do jeito correto se for email continuar email na hora do update e se for google ou facebook, deixar do mesmo jeito
        const userDoc = await getDoc(docRef)
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            if (userData.logginFormat && data.logginFormat && userData.logginFormat !== data.logginFormat) {
                throw new Error("Cannot change loggin format once set")
            }
        }
        await updateDoc(docRef, data)
    } catch (error) {
        console.error("Error updating user profile:", error)
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

        const docRef = doc(db, "users", userId)
        await deleteDoc(docRef)
    } catch (error) {
        console.error("Error deleting user profile:", error)
        throw error
    }
}

export const getUsers = async (
    limit_count: number = 10,
    role?: "admin" | "user",
    status?: "active" | "inactive"
): Promise<UserProfile[]> => {
    try {
        const snapshot = await getDocs(collection(db, "users"))

        let users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as unknown as UserProfile[]

        // Ordenar por data (do mais recente pro mais antigo)
        users = users.sort((a, b) => {
            const getTime = (date: Timestamp | Date | undefined) => {
                if (!date) return 0;
                if (typeof (date as any).toDate === "function") {
                    // Firestore Timestamp
                    return (date as Timestamp).toDate().getTime();
                }
                if (date instanceof Date) {
                    return date.getTime();
                }
                return 0;
            };
            const dateA = getTime(a.createdAt);
            const dateB = getTime(b.createdAt);
            return dateB - dateA;
        })

        // Limitar a quantidade de posts
        return users.slice(0, limit_count)
    } catch (error: any) {
        console.error("Erro ao buscar posts:", error.message)
        throw new Error("Não foi possível carregar os posts do blog.")
    }
}

// Função para verificar e criar coleções necessárias
export const initializeFirestore = async (): Promise<void> => {
    try {
        // Verificar se as coleções existem e criar documentos de exemplo se necessário
        const collections = ["blog_posts", "pets", "comments", "users"]

        for (const collectionName of collections) {
            const collectionRef = collection(db, collectionName)
            const snapshot = await getDocs(query(collectionRef, limit(1)))

            if (snapshot.empty) {
                console.log(`Collection ${collectionName} is empty or doesn't exist. Creating...`)
                // Aqui você poderia criar documentos de exemplo se necessário
            }
        }

        console.log("Firestore initialized successfully")
    } catch (error) {
        console.error("Error initializing Firestore:", error)
    }
}


export const uploadToCloudinary = async (uri: string | File): Promise<string> => {
    try {
        const formData = new FormData();

        if (Platform.OS === 'web') {
            // `uri` deve ser um objeto File no ambiente web
            if (!(uri instanceof File)) {
                throw new Error('Na web, o arquivo precisa ser do tipo File.');
            }
            formData.append('file', uri);
        } else {
            // Para mobile, `uri` é uma string de caminho local (por exemplo, file://...)
            formData.append('file', {
                uri,
                type: 'image/jpeg',
                name: `upload_${Date.now()}.jpg`,
            } as any);
        }

        formData.append('upload_preset', 'pca_fixed'); // seu preset

        const response = await fetch('https://api.cloudinary.com/v1_1/drwe1wtnk/image/upload', {
            method: 'POST',
            body: formData,
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}\n${text}`);
        }

        const data = JSON.parse(text);
        console.log('Resposta da API do Cloudinary:', data);

        if (data.secure_url) return data.secure_url;
        throw new Error('Falha no upload para Cloudinary: URL não encontrada na resposta');
    } catch (err: any) {
        console.error('Erro uploading image to Cloudinary:', err);
        Alert.alert('Erro', `Falha no upload da imagem: ${err.message}`);
        throw err;
    }
};
