// components/HeaderUserMenu.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function HeaderUserMenu() {
    const router = useNavigation<any>();
    const user = auth.currentUser;

    const initials = getInitials(user?.displayName || user?.email || 'U');

    const handleLogout = async () => {
        await signOut(auth);
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{user?.displayName || 'Usuário'}</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logout}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E31E24',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 14,
        color: '#000',
    },
    logout: {
        marginLeft: 6,
        color: '#E31E24',
        fontWeight: 'bold',
    },
});
