import { collection, addDoc, getDocs, doc, updateDoc, query, where, Timestamp, getDoc } from "firebase/firestore"
import { db } from "../data/datasources/firebase/firebase"
import type { AccountProfile } from "../domain/entities/Account"
import { Platform } from "react-native"

// Função para gerenciar localStorage de forma segura
const getStorageItem = (key: string): string | null => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key)
    }
    return null
}

const setStorageItem = (key: string, value: string): void => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value)
    }
}

export class FirebaseAccountRepository {
    private accountsCollection = collection(db, "user_accounts")

    async createAccount(account: Omit<AccountProfile, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            // Filtrar campos undefined
            const cleanAccount = {
                userId: account.userId,
                type: account.type,
                profileId: account.profileId,
                profileName: account.profileName,
                isActive: account.isActive,
                ...(account.profileImage && { profileImage: account.profileImage }),
            }

            const accountData = {
                ...cleanAccount,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.accountsCollection, accountData)
            return docRef.id
        } catch (error) {
            console.error("Error creating account:", error)
            throw new Error("Erro ao criar conta")
        }
    }

    async getUserAccounts(userId: string): Promise<AccountProfile[]> {
        try {
            const q = query(this.accountsCollection, where("userId", "==", userId), where("isActive", "==", true))
            const querySnapshot = await getDocs(q)

            const accounts: AccountProfile[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                accounts.push({
                    id: doc.id,
                    userId: data.userId,
                    type: data.type,
                    profileId: data.profileId,
                    profileName: data.profileName,
                    profileImage: data.profileImage,
                    isActive: data.isActive,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as AccountProfile)
            })

            return accounts.sort((a, b) => a.type.localeCompare(b.type))
        } catch (error) {
            console.error("Error fetching user accounts:", error)
            return []
        }
    }

    async updateAccount(id: string, updates: Partial<AccountProfile>): Promise<void> {
        try {
            const accountRef = doc(this.accountsCollection, id)

            // Filtrar campos undefined
            const cleanUpdates: any = {}
            Object.keys(updates).forEach((key) => {
                const value = (updates as any)[key]
                if (value !== undefined) {
                    cleanUpdates[key] = value
                }
            })

            await updateDoc(accountRef, {
                ...cleanUpdates,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error updating account:", error)
            throw new Error("Erro ao atualizar conta")
        }
    }

    async deactivateAccount(id: string): Promise<void> {
        try {
            const accountRef = doc(this.accountsCollection, id)
            await updateDoc(accountRef, {
                isActive: false,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error deactivating account:", error)
            throw new Error("Erro ao desativar conta")
        }
    }

    async getAccountById(id: string): Promise<AccountProfile | null> {
        try {
            const docRef = doc(this.accountsCollection, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    userId: data.userId,
                    type: data.type,
                    profileId: data.profileId,
                    profileName: data.profileName,
                    profileImage: data.profileImage,
                    isActive: data.isActive,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as AccountProfile
            }

            return null
        } catch (error) {
            console.error("Error fetching account:", error)
            return null
        }
    }

    // Métodos para gerenciar localStorage de forma segura
    getSavedAccountId(userId: string): string | null {
        return getStorageItem(`currentAccount_${userId}`)
    }

    saveCurrentAccountId(userId: string, accountId: string): void {
        setStorageItem(`currentAccount_${userId}`, accountId)
    }
}

export const accountRepository = new FirebaseAccountRepository()
