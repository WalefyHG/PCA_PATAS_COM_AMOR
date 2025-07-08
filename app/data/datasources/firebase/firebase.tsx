import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth"
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
    setDoc,
} from "firebase/firestore"
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage"
import { Alert, Platform } from "react-native"
import messaging from "@react-native-firebase/messaging"
import { useNavigation } from "@react-navigation/native"
import { getDatabase } from "firebase/database"
import { UserProfile } from "@/app/domain/entities/User"
import { Pet } from "@/app/domain/entities/Pet"
import { updateUserProfile } from "@/app/repositories/FirebaseUserRepository"

// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_APPKEY,
    authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECTID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.EXPO_PUBLIC_APPID,
    databaseURL: process.env.EXPO_PUBLIC_DATABASEURL,
}

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const database = getDatabase(app)

// Serviço de Autenticação
export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()
            resolve(user)
        })
    })
}

export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth)
    } catch (error) {
        console.error("Error signing out:", error)
        throw error
    }
}

export const setupFCM = async (): Promise<void> => {
    const router = useNavigation()
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (Platform.OS === "android") {
        // Solicitar permissão para Android
        const settings = await messaging().requestPermission();
        if (settings === messaging.AuthorizationStatus.AUTHORIZED) {
            console.log("FCM permission granted");
        } else {
            console.log("FCM permission denied");
        }
    }
    if (enabled) {
        Alert.alert("FCM permission granted");
        await updateUserProfile(auth.currentUser?.uid || "", {
            fcmToken: await messaging().getToken(),
        });
        messaging().onMessage((remoteMessage) => {
            Alert.alert(
                remoteMessage.notification?.title || "Você tem uma nova notificação",
                remoteMessage.notification?.body || "Você recebeu uma nova mensagem.",
            )
        })
        messaging().onNotificationOpenedApp((remoteMessage) => {
            router.navigate({ name: "AdoptDetails", params: { id: remoteMessage?.data?.petId || "" } } as never)
        });

        const initalNotification = await messaging().getInitialNotification();
        if (initalNotification) {
            router.navigate({ name: "AdoptDetails", params: { id: initalNotification?.data?.petId || "" } } as never);
        }
    }
}

// Verificar se o usuário é administrador
export const isUserAdmin = async (userId: string): Promise<boolean> => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            return userData.role === "admin"
        }
        return false
    } catch (error) {
        console.error("Error checking admin status:", error)
        return false
    }
}

// Serviço de Upload de Imagens
export const uploadImage = async (
    uri: string,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        // Adicionar verificação de URI
        if (!uri) {
            throw new Error("URI da imagem não fornecida");
        }

        // Obter o blob da imagem com tratamento de erros
        let blob: Blob;
        try {
            const response = await fetch(uri);
            if (!response.ok) {
                throw new Error(`Falha ao buscar imagem: ${response.status}`);
            }
            blob = await response.blob();
        } catch (error) {
            console.error("Erro ao converter imagem para blob:", error);
            throw new Error("Não foi possível processar a imagem");
        }

        // Criar referência no Storage com metadados
        const storageRef = ref(storage, path);
        const metadata = {
            contentType: blob.type || 'image/jpeg', // Tipo padrão se não detectado
            cacheControl: 'public, max-age=31536000', // Cache por 1 ano
        };

        // Iniciar upload com metadados
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(Math.round(progress));
                },
                (error) => {
                    console.error("Erro no upload:", error);
                    reject(new Error("Falha no upload da imagem"));
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("Erro ao obter URL de download:", error);
                        reject(new Error("Falha ao obter URL da imagem"));
                    }
                }
            );
        });
    } catch (error) {
        console.error("Erro no processo de upload:", error);
        throw error;
    }
};

export const deleteImage = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path)
        await deleteObject(storageRef)
    } catch (error) {
        console.error("Error deleting image:", error)
        throw error
    }
}

// Função para verificar e criar coleções necessárias
export const initializeFirestore = async (): Promise<void> => {
    try {
        // Verificar se as coleções existem e criar documentos de exemplo se necessário
        const collections = ["blog_posts", "pets", "comments", "users"]

        for (const collectionName of collections) {
            const collectionRef = collection(db, collectionName)
            const snapshot = await getDocs(query(collectionRef, limit(1)))

            if (snapshot.empty) {
                console.log(`Collection ${collectionName} is empty or doesn't exist. Creating...`)
                // Aqui você poderia criar documentos de exemplo se necessário
            }
        }

        console.log("Firestore initialized successfully")
    } catch (error) {
        console.error("Error initializing Firestore:", error)
    }
}

export const uploadToCloudinary = (
    uri: string | File,
    onProgress?: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        if (Platform.OS === 'web') {
            if (!(uri instanceof File)) {
                return reject(new Error('Na web, o arquivo precisa ser do tipo File.'));
            }
            formData.append('file', uri);
        } else {
            formData.append('file', {
                uri,
                type: 'image/jpeg',
                name: `upload_${Date.now()}.jpg`,
            } as any);
        }

        formData.append('upload_preset', 'pca_fixed');

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/drwe1wtnk/image/upload');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.secure_url) {
                        resolve(data.secure_url);
                    } else {
                        reject(new Error('URL não encontrada na resposta do Cloudinary'));
                    }
                } catch (err) {
                    reject(new Error('Erro ao processar resposta do Cloudinary'));
                }
            } else {
                reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Erro de rede no upload da imagem'));
        };

        xhr.send(formData);
    });
};