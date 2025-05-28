"use client"

import { SetStateAction, useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, ActivityIndicator, SafeAreaView, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, db } from "../config/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button, Input } from "@ui-kitten/components"
import { useThemeContext } from "../utils/ThemeContext"
import { useAuth } from "../utils/AuthContext"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin"


if (Platform.OS !== "web") {
  try {

    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEBCLIENTID,
      offlineAccess: true,
    })

  } catch (error) {
    console.log("Google SignIn não disponível nesta plataforma")
  }
}

// Componente de senha com visibilidade
const InputPassword = ({ value, onChangeText, placeholder, style }: any) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const { isDarkTheme, colors } = useThemeContext()

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry)
  }

  return (
    <View style={[style, { position: "relative" }]}>
      <Input
        style={{ paddingRight: 40 }}
        placeholder={placeholder}
        placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
        value={value}
        label="Senha"
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
      <TouchableOpacity
        style={{ position: "absolute", right: 10, top: "50%", transform: [{ translateY: -10 }] }}
        onPress={toggleSecureEntry}
      >
        <Feather name={secureTextEntry ? "eye-off" : "eye"} size={20} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
      </TouchableOpacity>
    </View>
  )
}

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useNavigation<any>()
  const { isDarkTheme, colors } = useThemeContext()
  const { user } = useAuth()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      router.navigate("Tabs")
    }
  }, [user, router])

  // Configuração do Google SignIn
  useEffect(() => {
    if (Platform.OS !== "web" && GoogleSignin) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_WEBCLIENTID, // Adapte isso ao seu client ID
        offlineAccess: true,
      })
      console.log("Google SignIn configurado")
    }
  }, [])

  // Função para lidar com erros de autenticação
  const handleAuthError = (error: any) => {
    setIsLoading(false)
    console.error("Erro de autenticação:", error)

    let errorMessage = "Ocorreu um erro durante o login. Tente novamente."

    if (error.code) {
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Email inválido."
          break
        case "auth/user-disabled":
          errorMessage = "Esta conta foi desativada."
          break
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado."
          break
        case "auth/wrong-password":
          errorMessage = "Senha incorreta."
          break
        case "auth/too-many-requests":
          errorMessage = "Muitas tentativas de login. Tente novamente mais tarde."
          break
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet."
          break
      }
    }

    setError(errorMessage)
  }

  // Handle Email/Password login
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        // Criar documento do usuário se não existir
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split("@")[0],
          role: "user", // Papel padrão
          status: "active",
          createdAt: new Date(),
        })
      }

      setIsLoading(false)
      router.navigate("Tabs")
    } catch (e: any) {
      handleAuthError(e)
    }
  }

  // Handle Google Login (for Web and Android)
  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)

    try {
      let user

      if (Platform.OS === "web") {
        // For Web login with Google
        const provider = new GoogleAuthProvider()
        const userCredential = await signInWithPopup(auth, provider)
        user = userCredential.user
      } else if (GoogleSignin) {
        // For Android
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
        await GoogleSignin.signOut()
        const response = await GoogleSignin.signIn()

        if (isSuccessResponse(response)) {
          console.log("Google SignIn response:", response.data.idToken)

          const googleCredential = GoogleAuthProvider.credential(response.data.idToken)
          const userCredential = await signInWithCredential(auth, googleCredential)
          user = userCredential.user
        }
      } else {
        throw new Error("Google SignIn não está disponível nesta plataforma")
      }

      if (user) {
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)

        // If user document doesn't exist, create it
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "user", // Papel padrão
            status: "active",
            createdAt: new Date(),
          })
        }

        setIsLoading(false)
        router.navigate("Tabs")
      }
    } catch (e: any) {
      handleAuthError(e)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[{ backgroundColor: isDarkTheme ? "#111827" : "#fff" }]}>
      {/* Header Gradient */}
      <LinearGradient
        colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topShape}
      />

      <View style={styles.content}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          defaultSource={require("../../assets/logo.png")}
        />

        <Text
          style={[
            styles.platformIndicator,
            { color: isDarkTheme ? colors.secondary : colors.primary, marginBottom: 30 },
          ]}
        >
          {Platform.select({
            ios: "Versão do App para iOS",
            android: "Versão do App para Android",
            web: "Versão do App para Web",
            default: "Versão do App",
          })}
        </Text>

        <View style={styles.formContainer}>
          <Input
            style={[
              styles.input,
              {
                backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
              },
            ]}
            placeholder="Digite seu Email"
            placeholderTextColor={isDarkTheme ? "#9CA3AF" : "#6B7280"}
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setError("")
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
          />

          <InputPassword
            style={[
              styles.input,
              {
                backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
              },
            ]}
            placeholder="Digite sua Senha"
            value={password}
            onChangeText={(text: SetStateAction<string>) => {
              setPassword(text)
              setError("")
            }}
            disabled={isLoading}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.enterButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.enterButtonText}>Entrar</Text>
            )}
          </Button>

          <Button
            style={[styles.createAccountButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.navigate("registers")}
            disabled={isLoading}
          >
            <Text style={styles.createAccountText}>Criar Conta</Text>
          </Button>
        </View>

        <Text style={[styles.orText, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>Ou</Text>
        <Text style={[styles.socialText, { color: isDarkTheme ? "#E5E7EB" : "#1F2937" }]}>Entrar Com</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              {
                backgroundColor: isDarkTheme ? "#1F2937" : "#F9FAFB",
                borderColor: isDarkTheme ? "#374151" : "#E5E7EB",
              },
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png",
              }}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          {/* Implement other social logins if needed */}
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={() => router.navigate("ForgotPassword")}>
          <Text style={{ color: isDarkTheme ? colors.secondary : colors.primary }}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Gradient */}
      <LinearGradient
        colors={isDarkTheme ? [colors.secondaryDark, colors.primaryDark] : [colors.secondary, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bottomShape}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      web: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100%",
      },
    }),
  },
  topShape: {
    borderBottomRightRadius: 100,
    alignSelf: "flex-start",
    ...Platform.select({
      web: { width: 500, height: 80 },
      android: { width: 200, height: 50 },
      ios: { width: 200, height: 50 },
      default: { width: 200, height: 50 },
    }),
  },
  bottomShape: {
    borderTopLeftRadius: 100,
    alignSelf: "flex-end",
    ...Platform.select({
      web: { width: 500, height: 80 },
      android: { width: 200, height: 50 },
      ios: { width: 200, height: 50 },
      default: { width: 200, height: 50 },
    }),
  },
  content: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    alignItems: "center",
    ...Platform.select({
      web: { maxWidth: 600 },
    }),
  },
  logo: { width: 200, height: 200, resizeMode: "contain", marginBottom: 20 },
  platformIndicator: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  enterButton: {
    borderWidth: 0,
    flex: 1,
    marginRight: 10,
  },
  enterButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  createAccountButton: {
    borderWidth: 0,
    flex: 1,
    marginLeft: 10,
  },
  createAccountText: {
    color: "#fff",
    fontSize: 16,
  },
  orText: {
    marginTop: 30,
    fontSize: 16,
  },
  socialText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 1,
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: "#EF4444",
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPassword: {
    marginTop: 20,
  },
})
