import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_APPKEY,
    authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECTID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
    appId: process.env.EXPO_PUBLIC_APPID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Somente para Web
if (Platform.OS === "web") {
    import("firebase/auth").then(({ browserLocalPersistence, setPersistence }) => {
        setPersistence(auth, browserLocalPersistence);
    });
}

const db = getFirestore(app);

export { auth, db };
