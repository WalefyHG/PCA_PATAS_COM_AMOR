import { jest } from '@jest/globals'
import "react-native-gesture-handler/jestSetup"

// Mock Firebase
jest.mock("firebase/app", () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
}))

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: "test-uid", email: "test@test.com" },
    })),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    updateProfile: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithCredential: jest.fn(),
}))

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    onSnapshot: jest.fn(),
    setDoc: jest.fn(),
    serverTimestamp: jest.fn(),
}))

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
}))

jest.mock("firebase/database", () => ({
    getDatabase: jest.fn(() => ({
        ref: jest.fn(),
        onValue: jest.fn(),
        set: jest.fn(),
        push: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    })),
}))

jest.mock("@react-native-firebase/app", () => ({
    firebase: {
        app: jest.fn(() => ({
            name: "[DEFAULT]",
            options: {},
        })),
    },
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    initializeApp: jest.fn(),
}))

jest.mock("@react-native-firebase/messaging", () => ({
    default: {
        requestPermission: jest.fn(),
        getToken: jest.fn(() => Promise.resolve("mock-token")),
        onMessage: jest.fn(() => jest.fn()),
        setBackgroundMessageHandler: jest.fn(),
        onNotificationOpenedApp: jest.fn(() => jest.fn()),
        getInitialNotification: jest.fn(() => Promise.resolve(null)),
    },
}))

// Mock Expo modules
jest.mock("expo-notifications", () => ({
    requestPermissionsAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    setNotificationHandler: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    getExpoPushTokenAsync: jest.fn(),
}))

jest.mock("expo-image-picker", () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    MediaTypeOptions: {
        Images: "Images",
    },
}))

jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}))

jest.mock("expo-linear-gradient", () => ({
    LinearGradient: "LinearGradient",
}))

jest.mock("expo-auth-session", () => ({
    startAsync: jest.fn(() => Promise.resolve({ type: "success", params: { access_token: "fake-token" } })),
    makeRedirectUri: jest.fn(() => "http://localhost"),
    useAuthRequest: jest.fn(() => [jest.fn(), jest.fn(), jest.fn()]),
}))

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    },
}))

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        reset: jest.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
    useFocusEffect: jest.fn(),
}))

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        hasPlayServices: jest.fn().mockResolvedValue(true),
        configure: jest.fn(),
        signIn: jest.fn().mockResolvedValue({
            idToken: "fake-id-token",
            user: { email: "test@test.com", name: "Test User" },
        }),
        signOut: jest.fn(),
    },
    statusCodes: {
        SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
        IN_PROGRESS: "IN_PROGRESS",
        PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
    },
    isSuccessResponse: jest.fn(() => true),
}))

// Mock Vector Icons
jest.mock("@expo/vector-icons", () => ({
    Feather: "Feather",
    FontAwesome: "FontAwesome",
}))

// Mock react-i18next
jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            changeLanguage: jest.fn(),
        },
    }),
}))

// Mock UI Kitten
jest.mock("@ui-kitten/components", () => ({
    Input: "Input",
    Button: "Button",
    Layout: "Layout",
    Text: "Text",
}))

// Mock Paper
jest.mock("react-native-paper", () => ({
    Portal: ({ children }) => children,
    Dialog: ({ children }) => children,
    Button: "Button",
    Paragraph: "Paragraph",
    useTheme: () => ({}),
}))

// Global test utilities
global.fetch = jest.fn()
global.FormData = jest.fn()
global.URL = {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
}

// Silence console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
}
