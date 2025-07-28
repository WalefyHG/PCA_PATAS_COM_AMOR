import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    getDoc,
    Timestamp,
} from "firebase/firestore"
import { db } from "../data/datasources/firebase/firebase"
import type { BlogPost as BlogPostBase } from "../domain/entities/Blog"

export interface BlogPost extends BlogPostBase {
    id: string
    authorType?: "user" | "ong" | "clinic"
    authorProfileId?: string
    createdAt: Date
    updatedAt: Date
}

class FirebaseBlogRepository {
    private blogsCollection = collection(db, "blogs")

    async createBlogPost(blogData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const docData = {
                ...blogData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.blogsCollection, docData)
            return docRef.id
        } catch (error) {
            console.error("Error creating blog post:", error)
            throw new Error("Erro ao criar post do blog")
        }
    }

    async getBlogPosts(): Promise<BlogPost[]> {
        try {
            const q = query(this.blogsCollection, orderBy("createdAt", "desc"))
            const querySnapshot = await getDocs(q)

            const blogs: BlogPost[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                blogs.push({
                    id: doc.id,
                    title: data.title,
                    content: data.content,
                    excerpt: data.excerpt,
                    category: data.category,
                    image: data.image,
                    author: data.author,
                    authorId: data.authorId,
                    authorAvatar: data.authorAvatar,
                    authorType: data.authorType,
                    authorProfileId: data.authorProfileId,
                    status: data.status,
                    readTime: data.readTime,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                })
            })

            return blogs
        } catch (error) {
            console.error("Error fetching blog posts:", error)
            return []
        }
    }

    async getBlogPostById(id: string): Promise<BlogPost | null> {
        try {
            const docRef = doc(this.blogsCollection, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    title: data.title,
                    content: data.content,
                    excerpt: data.excerpt,
                    category: data.category,
                    image: data.image,
                    author: data.author,
                    authorId: data.authorId,
                    authorAvatar: data.authorAvatar,
                    authorType: data.authorType,
                    authorProfileId: data.authorProfileId,
                    status: data.status,
                    readTime: data.readTime,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                }
            }

            return null
        } catch (error) {
            console.error("Error fetching blog post:", error)
            return null
        }
    }

    async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
        try {
            const docRef = doc(this.blogsCollection, id)
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error updating blog post:", error)
            throw new Error("Erro ao atualizar post do blog")
        }
    }

    async deleteBlogPost(id: string): Promise<void> {
        try {
            const docRef = doc(this.blogsCollection, id)
            await deleteDoc(docRef)
        } catch (error) {
            console.error("Error deleting blog post:", error)
            throw new Error("Erro ao deletar post do blog")
        }
    }

    async getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
        try {
            const q = query(this.blogsCollection, where("authorId", "==", authorId), orderBy("createdAt", "desc"))
            const querySnapshot = await getDocs(q)

            const blogs: BlogPost[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                blogs.push({
                    id: doc.id,
                    title: data.title,
                    content: data.content,
                    excerpt: data.excerpt,
                    category: data.category,
                    image: data.image,
                    author: data.author,
                    authorId: data.authorId,
                    authorAvatar: data.authorAvatar,
                    authorType: data.authorType,
                    authorProfileId: data.authorProfileId,
                    status: data.status,
                    readTime: data.readTime,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                })
            })

            return blogs
        } catch (error) {
            console.error("Error fetching blog posts by author:", error)
            return []
        }
    }
}

export const blogRepository = new FirebaseBlogRepository()
export const { createBlogPost, getBlogPosts, getBlogPostById, updateBlogPost, deleteBlogPost, getBlogPostsByAuthor } =
    blogRepository
