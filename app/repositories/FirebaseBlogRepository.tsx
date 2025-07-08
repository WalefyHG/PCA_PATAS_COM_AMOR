import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore"
import { BlogPost } from "../domain/entities/Blog"
import { auth, db, isUserAdmin } from "../data/datasources/firebase/firebase"
import { Comment } from "../domain/entities/Blog"

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

export { BlogPost }
