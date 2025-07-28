import { Timestamp } from "firebase/firestore"

export interface Clinic {
    id?: string
    name: string
    email: string
    phone: string
    cnpj: string
    crmv: string
    address: string
    description: string
    services: string[]
    logoUrl?: string
    userId: string
    isActive: boolean
    workingHours: {
        monday: { open: string; close: string; isOpen: boolean }
        tuesday: { open: string; close: string; isOpen: boolean }
        wednesday: { open: string; close: string; isOpen: boolean }
        thursday: { open: string; close: string; isOpen: boolean }
        friday: { open: string; close: string; isOpen: boolean }
        saturday: { open: string; close: string; isOpen: boolean }
        sunday: { open: string; close: string; isOpen: boolean }
    }
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface Appointment {
    id?: string
    clinicId: string
    clinicName: string
    petId: string
    petName: string
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    service: string
    date: Date
    time: string
    status: "scheduled" | "confirmed" | "completed" | "cancelled"
    notes?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}
