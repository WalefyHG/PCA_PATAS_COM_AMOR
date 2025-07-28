import { Timestamp } from "firebase/firestore"

export interface Pet {
    id?: string
    name: string
    age: string
    type: string
    breed: string
    gender: string
    size: string
    color: string
    description: string
    history: string
    location: string
    images: string[]
    requirements: string[]
    vaccinated: boolean
    neutered: boolean
    specialNeeds: boolean
    specialNeedsDescription?: string
    contactPhone?: string
    contactEmail?: string
    status: "available" | "pending" | "adopted"
    createdBy: string
    createdByName?: string
    createdByType?: "user" | "ong" | "clinic"
    createdByProfileId?: string
    createdByAvatar?: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
}
