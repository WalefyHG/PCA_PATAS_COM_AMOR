import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    getDoc,
} from "firebase/firestore"
import { db } from "../data/datasources/firebase/firebase"
import type { Ong, Donation } from "@/app/domain/entities/Ongs"

export class FirebaseOngRepository {
    private ongsCollection = collection(db, "ongs")
    private donationsCollection = collection(db, "donations")

    async createOng(ong: Omit<Ong, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const ongData = {
                ...ong,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.ongsCollection, ongData)
            return docRef.id
        } catch (error) {
            console.error("Error creating ONG:", error)
            throw new Error("Erro ao cadastrar ONG")
        }
    }

    async getAllActiveOngs(): Promise<Ong[]> {
        try {
            const q = query(this.ongsCollection, where("isActive", "==", true))
            const querySnapshot = await getDocs(q)

            const ongs: Ong[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                ongs.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Ong)
            })

            return ongs.sort((a, b) => a.name.localeCompare(b.name))
        } catch (error) {
            console.error("Error fetching ONGs:", error)
            return []
        }
    }

    async getOngsByUser(userId: string): Promise<Ong[]> {
        try {
            const q = query(this.ongsCollection, where("userId", "==", userId))
            const querySnapshot = await getDocs(q)

            const ongs: Ong[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                ongs.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Ong)
            })

            return ongs.sort((a, b) => a.name.localeCompare(b.name))
        } catch (error) {
            console.error("Error fetching user ONGs:", error)
            return []
        }
    }

    async getOngById(id: string): Promise<Ong | null> {
        try {
            const docRef = doc(this.ongsCollection, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Ong
            }

            return null
        } catch (error) {
            console.error("Error fetching ONG:", error)
            return null
        }
    }

    async updateOng(id: string, updates: Partial<Ong>): Promise<void> {
        try {
            const ongRef = doc(this.ongsCollection, id)
            await updateDoc(ongRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error updating ONG:", error)
            throw new Error("Erro ao atualizar ONG")
        }
    }

    async deleteOng(id: string): Promise<void> {
        try {
            const ongRef = doc(this.ongsCollection, id)
            await deleteDoc(ongRef)
        } catch (error) {
            console.error("Error deleting ONG:", error)
            throw new Error("Erro ao deletar ONG")
        }
    }

    async createDonation(donation: Omit<Donation, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const donationData = {
                ...donation,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.donationsCollection, donationData)
            console.log("Donation created with ID:", docRef.id)
            return docRef.id
        } catch (error) {
            console.error("Error creating donation:", error)
            throw new Error("Erro ao criar doação")
        }
    }

    async updateDonationStatus(id: string, status: "pending" | "paid" | "cancelled"): Promise<void> {
        try {
            const donationRef = doc(this.donationsCollection, id)
            await updateDoc(donationRef, {
                status,
                updatedAt: Timestamp.now(),
            })
            console.log(`Donation ${id} status updated to ${status}`)
        } catch (error) {
            console.error("Error updating donation status:", error)
            throw new Error("Erro ao atualizar status da doação")
        }
    }

    async updateDonationStatusByAsaasId(asaasPaymentId: string, status: "pending" | "paid" | "cancelled"): Promise<void> {
        try {
            const q = query(this.donationsCollection, where("asaasPaymentId", "==", asaasPaymentId))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const donationDoc = querySnapshot.docs[0]
                await updateDoc(donationDoc.ref, {
                    status,
                    updatedAt: Timestamp.now(),
                })
                console.log(`Donation with ASAAS ID ${asaasPaymentId} status updated to ${status}`)
            } else {
                console.warn(`No donation found with ASAAS payment ID: ${asaasPaymentId}`)
            }
        } catch (error) {
            console.error("Error updating donation status by ASAAS ID:", error)
            throw new Error("Erro ao atualizar status da doação pelo ID do ASAAS")
        }
    }

    async getDonationsByOng(ongId: string): Promise<Donation[]> {
        try {
            const q = query(this.donationsCollection, where("ongId", "==", ongId))
            const querySnapshot = await getDocs(q)

            const donations: Donation[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                donations.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Donation)
            })

            return donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } catch (error) {
            console.error("Error fetching donations by ONG:", error)
            return []
        }
    }

    async getDonationsByDonor(donorEmail: string): Promise<Donation[]> {
        try {
            const q = query(this.donationsCollection, where("donorEmail", "==", donorEmail))
            const querySnapshot = await getDocs(q)

            const donations: Donation[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                donations.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Donation)
            })

            return donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } catch (error) {
            console.error("Error fetching donations by donor:", error)
            return []
        }
    }

    async getAllDonations(): Promise<Donation[]> {
        try {
            const querySnapshot = await getDocs(this.donationsCollection)

            const donations: Donation[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                donations.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Donation)
            })

            return donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } catch (error) {
            console.error("Error fetching all donations:", error)
            return []
        }
    }
}

export const ongRepository = new FirebaseOngRepository()
