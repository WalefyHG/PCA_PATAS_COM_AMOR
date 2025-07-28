import { Timestamp } from "firebase/firestore"

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