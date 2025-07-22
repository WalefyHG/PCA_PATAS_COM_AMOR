import { Timestamp } from "firebase/firestore"

export interface Pet {
    photos: any
    species: ReactNode
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
    images: string[]
    requirements: string[]
    location: string
    contactPhone?: string
    contactEmail?: string
    vaccinated: boolean
    neutered: boolean
    specialNeeds: boolean
    specialNeedsDescription?: string
    status: "available" | "adopted" | "pending"
    createdAt?: Timestamp | Date
    updatedAt?: Timestamp | Date
    createdBy?: string
}