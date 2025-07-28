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
import type { Clinic, Appointment } from "../domain/entities/Clinic"

export class FirebaseClinicRepository {
    private clinicsCollection = collection(db, "clinics")
    private appointmentsCollection = collection(db, "appointments")

    async createClinic(clinic: Omit<Clinic, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const clinicData = {
                ...clinic,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.clinicsCollection, clinicData)
            return docRef.id
        } catch (error) {
            console.error("Error creating clinic:", error)
            throw new Error("Erro ao cadastrar clínica")
        }
    }

    async getAllActiveClinics(): Promise<Clinic[]> {
        try {
            const q = query(this.clinicsCollection, where("isActive", "==", true))
            const querySnapshot = await getDocs(q)

            const clinics: Clinic[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                clinics.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Clinic)
            })

            return clinics.sort((a, b) => a.name.localeCompare(b.name))
        } catch (error) {
            console.error("Error fetching clinics:", error)
            return []
        }
    }

    async getClinicsByUser(userId: string): Promise<Clinic[]> {
        try {
            const q = query(this.clinicsCollection, where("userId", "==", userId))
            const querySnapshot = await getDocs(q)

            const clinics: Clinic[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                clinics.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Clinic)
            })

            return clinics.sort((a, b) => a.name.localeCompare(b.name))
        } catch (error) {
            console.error("Error fetching user clinics:", error)
            return []
        }
    }

    async getClinicById(id: string): Promise<Clinic | null> {
        try {
            const docRef = doc(this.clinicsCollection, id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Clinic
            }

            return null
        } catch (error) {
            console.error("Error fetching clinic:", error)
            return null
        }
    }

    async updateClinic(id: string, updates: Partial<Clinic>): Promise<void> {
        try {
            const clinicRef = doc(this.clinicsCollection, id)
            await updateDoc(clinicRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error updating clinic:", error)
            throw new Error("Erro ao atualizar clínica")
        }
    }

    async deleteClinic(id: string): Promise<void> {
        try {
            const clinicRef = doc(this.clinicsCollection, id)
            await deleteDoc(clinicRef)
        } catch (error) {
            console.error("Error deleting clinic:", error)
            throw new Error("Erro ao deletar clínica")
        }
    }

    async createAppointment(appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Promise<string> {
        try {
            const appointmentData = {
                ...appointment,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }

            const docRef = await addDoc(this.appointmentsCollection, appointmentData)
            return docRef.id
        } catch (error) {
            console.error("Error creating appointment:", error)
            throw new Error("Erro ao criar agendamento")
        }
    }

    async getAppointmentsByClinic(clinicId: string): Promise<Appointment[]> {
        try {
            const q = query(this.appointmentsCollection, where("clinicId", "==", clinicId))
            const querySnapshot = await getDocs(q)

            const appointments: Appointment[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                appointments.push({
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date(),
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Appointment)
            })

            return appointments.sort((a, b) => b.date.getTime() - a.date.getTime())
        } catch (error) {
            console.error("Error fetching appointments by clinic:", error)
            return []
        }
    }

    async updateAppointmentStatus(
        id: string,
        status: "scheduled" | "confirmed" | "completed" | "cancelled",
    ): Promise<void> {
        try {
            const appointmentRef = doc(this.appointmentsCollection, id)
            await updateDoc(appointmentRef, {
                status,
                updatedAt: Timestamp.now(),
            })
        } catch (error) {
            console.error("Error updating appointment status:", error)
            throw new Error("Erro ao atualizar status do agendamento")
        }
    }
}

export const clinicRepository = new FirebaseClinicRepository()
