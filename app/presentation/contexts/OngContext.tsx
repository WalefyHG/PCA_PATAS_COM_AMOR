"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import type { Ong } from "@/app/domain/entities/Ongs"

interface OngContextType {
    userOngs: Ong[]
    activeOng: Ong | null
    isOngMode: boolean
    isLoading: boolean
    switchToOng: (ong: Ong) => void
    switchToPersonal: () => void
    refreshOngs: () => Promise<void>
    getCurrentProfile: () => {
        id: string
        name: string
        email: string
        photoURL?: string
        type: "user" | "ong"
    }
}

const OngContext = createContext<OngContextType>({
    userOngs: [],
    activeOng: null,
    isOngMode: false,
    isLoading: true,
    switchToOng: () => { },
    switchToPersonal: () => { },
    refreshOngs: async () => { },
    getCurrentProfile: () => ({ id: "", name: "", email: "", type: "user" }),
})

export const useOng = () => useContext(OngContext)

export const OngProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth()
    const [userOngs, setUserOngs] = useState<Ong[]>([])
    const [activeOng, setActiveOng] = useState<Ong | null>(null)
    const [isOngMode, setIsOngMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const loadUserOngs = async () => {
        if (!user?.uid) {
            setUserOngs([])
            setIsLoading(false)
            return
        }

        try {
            const ongs = await ongRepository.getOngsByUser(user.uid)
            setUserOngs(ongs)
        } catch (error) {
            console.error("Error loading user ONGs:", error)
            setUserOngs([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadUserOngs()
    }, [user?.uid])

    const switchToOng = (ong: Ong) => {
        setActiveOng(ong)
        setIsOngMode(true)
        console.log(`Switched to ONG mode: ${ong.name}`)
    }

    const switchToPersonal = () => {
        setActiveOng(null)
        setIsOngMode(false)
        console.log("Switched to personal mode")
    }

    const refreshOngs = async () => {
        await loadUserOngs()
    }

    const getCurrentProfile = () => {
        if (isOngMode && activeOng) {
            return {
                id: activeOng.id || "",
                name: activeOng.name,
                email: activeOng.email,
                photoURL: activeOng.logoUrl,
                type: "ong" as const,
            }
        }

        return {
            id: user?.uid || "",
            name: user?.displayName || user?.email?.split("@")[0] || "Usuário",
            email: user?.email || "",
            photoURL: user?.photoURL ?? undefined,
            type: "user" as const,
        }
    }

    return (
        <OngContext.Provider
            value={{
                userOngs,
                activeOng,
                isOngMode,
                isLoading,
                switchToOng,
                switchToPersonal,
                refreshOngs,
                getCurrentProfile,
            }}
        >
            {children}
        </OngContext.Provider>
    )
}
