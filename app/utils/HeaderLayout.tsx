import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Popover from 'react-native-popover-view';
import { Avatar } from 'react-native-paper';
import { Icon } from '@ui-kitten/components';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const EvaIcon = ({ name, color = '#555' }: { name: string; color?: string }) => (
    <Icon name={name} fill={color} style={{ width: 20, height: 20 }} />
);

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function HeaderUserMenu() {
    const router = useNavigation<any>();
    const [user, setUser] = useState<User | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const touchableRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return unsubscribe;
    }, []);

    const initials = getInitials(user?.displayName || user?.email || 'U');

    const handleLogout = async () => {
        setIsVisible(false);
        await signOut(auth);
        router.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity ref={touchableRef} onPress={() => setIsVisible(true)} style={styles.avatarWrapper}>
                <Avatar.Text
                    size={44}
                    label={initials}
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                />
            </TouchableOpacity>

            {/* Popover não deve ocupar toda a tela */}
            <Popover
                isVisible={isVisible}
                from={touchableRef}
                onRequestClose={() => setIsVisible(false)}
                popoverStyle={styles.popoverContent}
                animationConfig={{
                    duration: 200,
                    useNativeDriver: true,
                }}
            >
                <View>
                    <Text style={styles.userName}>{user?.displayName || 'Usuário'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <EvaIcon name="log-out-outline" />
                        <Text style={styles.menuText}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </Popover>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        position: 'relative',
    },
    avatarWrapper: {
        zIndex: 10, // Garante que o avatar tenha prioridade sobre outros elementos
    },
    avatar: {
        backgroundColor: '#E31E24',
        elevation: 4,
    },
    avatarLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    popoverContent: {
        padding: 12,
        minWidth: 200,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
        color: '#222',
        alignSelf: 'center',
    },
    userEmail: {
        fontSize: 13,
        color: '#777',
        marginBottom: 10,
        alignSelf: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
    },
    menuText: {
        fontSize: 14,
        color: '#333',
    },
});
