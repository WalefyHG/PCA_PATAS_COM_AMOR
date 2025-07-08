import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore"
import { auth, db, isUserAdmin } from "../data/datasources/firebase/firebase"
import { Pet } from "../domain/entities/Pet"

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

export { Pet }
