import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore"
import { auth, db, isUserAdmin } from "../data/datasources/firebase/firebase"
import messaging from "@react-native-firebase/messaging"
import { UserProfile } from "../domain/entities/User"

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

export const subscribeToPetTopic = async (petType: string): Promise<void> => {
    try {
        const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, '')
        await messaging().subscribeToTopic(topic)
        console.log(`Subscribed to topic: ${topic}`)
    } catch (error) {
        console.error("Error subscribing to topic:", error)
        throw error
    }
}

export const unsubscribeFromPetTopic = async (petType: string) => {
    try {
        const topic = petType.toLowerCase().replace(/[^a-z0-9]/g, '');
        await messaging().unsubscribeFromTopic(topic);
        console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error(`Error unsubscribing to topic: `, error);
    }
}

export const manageUserPetPreferences = async (userId: string, newPreferences: string[]) => {
    try {
        const currentUserProfile = await getUserProfile(userId);
        const oldPreferences = currentUserProfile?.petPreferences || [];

        const topicsToSubscribe = newPreferences.filter(pref => !oldPreferences.includes(pref));
        for (const topic of topicsToSubscribe) {
            await subscribeToPetTopic(topic);
        }

        const topicsToUnsubscribe = oldPreferences.filter(pref => !newPreferences.includes(pref));
        for (const topic of topicsToUnsubscribe) {
            await unsubscribeFromPetTopic(topic);
        }

        await updateUserProfile(userId, { petPreferences: newPreferences });
        console.log('Preferências de pet do usuário atualizadas no Firestore e FCM.');
    } catch (error) {
        console.error('Erro ao gerenciar preferências de pet:', error);
        throw error;
    }
};

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
