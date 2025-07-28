"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { auth, isUserAdmin } from "../../data/datasources/firebase/firebase"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import ExpoNotificationService from "../../repositories/NotificationRepository"
import { AccountProvider } from "./AccountContext"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  logout: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigation = useNavigation<any>()

  useEffect(() => {
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser ? "Logged in" : "Logged out")
      setUser(currentUser)

      if (currentUser) {
        try {
          // Verificar se o usuário é admin
          const adminStatus = await isUserAdmin(currentUser.uid)
          setIsAdmin(adminStatus)
        } catch (error) {
          console.error("Error checking admin status:", error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }

      setIsLoading(false)
    })

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  // Método de logout com limpeza de listeners
  const logout = async () => {
    try {
      console.log("Iniciando processo de logout...")

      // 1. Limpar listeners de notificações para evitar erros de permissão
      const notificationService = ExpoNotificationService.getInstance()

      // 2. Fazer logout do Firebase
      await signOut(auth)

      console.log("Logout realizado com sucesso no contexto")

      // A navegação será tratada pelo listener de onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, logout }}>
      <AccountProvider>{children}</AccountProvider>
    </AuthContext.Provider>
  )
}
