"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { accountRepository } from "../../repositories/FirebaseAccountRepository"
import { ongRepository } from "../../repositories/FirebaseOngRepository"
import { clinicRepository } from "../../repositories/FirebaseClinicRepository"
import type { AccountProfile, UserAccountContext } from "../../domain/entities/Account"
import { Platform } from "react-native"

interface AccountContextType extends UserAccountContext {
    switchAccount: (account: AccountProfile) => void
    refreshAccounts: () => Promise<void>
    createUserAccount: () => Promise<void>
    isLoading: boolean
}

const AccountContext = createContext<AccountContextType>({
    currentAccount: {
        userId: "",
        type: "user",
        profileId: "",
        profileName: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    availableAccounts: [],
    switchAccount: () => { },
    refreshAccounts: async () => { },
    createUserAccount: async () => { },
    isLoading: true,
})

export const useAccount = () => useContext(AccountContext)

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth()
    const [currentAccount, setCurrentAccount] = useState<AccountProfile>({
        userId: "",
        type: "user",
        profileId: "",
        profileName: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
    const [availableAccounts, setAvailableAccounts] = useState<AccountProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const createUserAccount = async () => {
        if (!user) return

        const userAccount: Omit<AccountProfile, "id" | "createdAt" | "updatedAt"> = {
            userId: user.uid,
            type: "user",
            profileId: user.uid,
            profileName: user.displayName || user.email || "Usuário",
            profileImage: user.photoURL || undefined,
            isActive: true,
        }

        try {
            await accountRepository.createAccount(userAccount)
        } catch (error) {
            console.error("Error creating user account:", error)
        }
    }

    const loadAccounts = async () => {
        if (!user?.uid) {
            setIsLoading(false)
            return
        }

        try {
            let accounts = await accountRepository.getUserAccounts(user.uid)

            // Se não há contas, criar conta de usuário padrão
            if (accounts.length === 0) {
                await createUserAccount()
                accounts = await accountRepository.getUserAccounts(user.uid)
            }

            // Carregar ONGs do usuário e criar contas para elas
            const userOngs = await ongRepository.getOngsByUser(user.uid)
            for (const ong of userOngs) {
                const existingOngAccount = accounts.find((acc) => acc.type === "ong" && acc.profileId === ong.id)
                if (!existingOngAccount && ong.id) {
                    const ongAccount: Omit<AccountProfile, "id" | "createdAt" | "updatedAt"> = {
                        userId: user.uid,
                        type: "ong",
                        profileId: ong.id,
                        profileName: ong.name,
                        profileImage: ong.logoUrl,
                        isActive: ong.isActive,
                    }
                    await accountRepository.createAccount(ongAccount)
                }
            }

            // Carregar Clínicas do usuário e criar contas para elas
            const userClinics = await clinicRepository.getClinicsByUser(user.uid)
            for (const clinic of userClinics) {
                const existingClinicAccount = accounts.find((acc) => acc.type === "clinic" && acc.profileId === clinic.id)
                if (!existingClinicAccount && clinic.id) {
                    const clinicAccount: Omit<AccountProfile, "id" | "createdAt" | "updatedAt"> = {
                        userId: user.uid,
                        type: "clinic",
                        profileId: clinic.id,
                        profileName: clinic.name,
                        profileImage: clinic.logoUrl,
                        isActive: clinic.isActive,
                    }
                    await accountRepository.createAccount(clinicAccount)
                }
            }

            // Recarregar contas após criação
            accounts = await accountRepository.getUserAccounts(user.uid)
            setAvailableAccounts(accounts)

            // Definir conta atual (priorizar a última usada ou usuário padrão)
            const savedAccountId = getSavedAccountId(user.uid)
            let accountToSet =
                accounts.find((acc) => acc.id === savedAccountId) || accounts.find((acc) => acc.type === "user")

            if (!accountToSet && accounts.length > 0) {
                accountToSet = accounts[0]
            }

            if (accountToSet) {
                setCurrentAccount(accountToSet)
            }
        } catch (error) {
            console.error("Error loading accounts:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const switchAccount = (account: AccountProfile) => {
        setCurrentAccount(account)
        if (user?.uid && account.id) {
            saveCurrentAccountId(user.uid, account.id)
        }
    }

    const refreshAccounts = async () => {
        await loadAccounts()
    }

    // Funções para localStorage seguro
    const getSavedAccountId = (userId: string): string | null => {
        if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
            return localStorage.getItem(`currentAccount_${userId}`)
        }
        return null
    }

    const saveCurrentAccountId = (userId: string, accountId: string): void => {
        if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(`currentAccount_${userId}`, accountId)
        }
    }

    useEffect(() => {
        if (user) {
            loadAccounts()
        } else {
            setAvailableAccounts([])
            setCurrentAccount({
                userId: "",
                type: "user",
                profileId: "",
                profileName: "",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            setIsLoading(false)
        }
    }, [user])

    return (
        <AccountContext.Provider
            value={{
                currentAccount,
                availableAccounts,
                switchAccount,
                refreshAccounts,
                createUserAccount,
                isLoading,
            }}
        >
            {children}
        </AccountContext.Provider>
    )
}
