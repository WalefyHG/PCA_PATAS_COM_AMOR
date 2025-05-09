import 'dotenv/config';

export default {
    expo: {
        name: "test expo",
        slug: "test-expo",
        plugins: ["expo-router"],
        router: {
            appRoot: 'app/'
        },
        extra: {
            apiKey: process.env.EXPO_PUBLIC_APPKEY,
            authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
            projectId: process.env.EXPO_PUBLIC_PROJECTID,
            storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
            messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
            appId: process.env.EXPO_PUBLIC_APPID,
            webClientId: process.env.EXPO_PUBLIC_WEBCLIENTID,
            androidClientId: process.env.EXPO_PUBLIC_ANDROIDCLIENT_ID,
            redirectUri: process.env.EXPO_PUBLIC_REDIRECTURI,
            eas: {
                projectId: "12e5ef74-76b4-4dd2-91f4-c0f7bbec3df8"
            }
        },
        runtimeVersion: "1.0.0"
    },
};