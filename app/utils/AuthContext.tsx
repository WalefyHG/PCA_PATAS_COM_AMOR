"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { auth, isUserAdmin } from "../config/firebase"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { useNavigation } from "@react-navigation/native"
import ExpoNotificationService from "./NotificationsServices"

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

          // Configurar notificações quando o usuário faz login
          const notificationService = ExpoNotificationService.getInstance()
          const hasPermission = await notificationService.setupNotifications()

          if (hasPermission) {
            console.log("✅ Notificações configuradas com sucesso para o usuário logado")
          } else {
            console.log("❌ Permissão de notificação negada")
          }
        } catch (error) {
          console.error("Error checking admin status or setting up notifications:", error)
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

  // Adicione um método de logout explícito
  const logout = async () => {
    try {
      await signOut(auth)
      console.log("Logout realizado com sucesso no contexto")
      // A navegação será tratada pelo listener de onAuthStateChanged
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, isAdmin, isLoading, logout }}>{children}</AuthContext.Provider>
}
