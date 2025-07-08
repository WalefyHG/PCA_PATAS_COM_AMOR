import { Timestamp } from "firebase/firestore"

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
    fcmToken?: string
    petPreferences?: string[]
    expoPushToken?: string
}