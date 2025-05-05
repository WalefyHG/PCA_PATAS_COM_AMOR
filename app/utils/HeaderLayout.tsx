import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, UIManager, findNodeHandle } from 'react-native';
import Popover from 'react-native-popover-view';
import { Avatar, useTheme } from 'react-native-paper';
import { Icon } from '@ui-kitten/components';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from './ThemeContext';

const EvaIcon = ({ name, color = '#555' }: { name: string; color?: string }) => (
    <Icon name={name} fill={color} style={{ width: 22, height: 22 }} />
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
    const [anchorRect, setAnchorRect] = useState<any>(null);
    const avatarRef = useRef<any>(null);

    const { toggleTheme, isDarkTheme } = useThemeContext();
    const { colors } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return unsubscribe;
    }, []);

    const initials = getInitials(user?.displayName || user?.email || 'U');

    const openPopover = () => {
        if (!avatarRef.current) return;
        const handle = findNodeHandle(avatarRef.current);
        if (handle) {
            UIManager.measureInWindow(handle, (x, y, width, height) => {
                setAnchorRect({ x, y, width, height });
                setIsVisible(true);
            });
        }
    };

    const handleLogout = async () => {
        setIsVisible(false);
        await signOut(auth);
        router.replace('Home');
    };

    return (
        <View style={[styles.container]}>
            <TouchableOpacity
                onPress={toggleTheme}
                style={[styles.themeButton, { backgroundColor: colors.elevation.level1 }]}
            >
                <EvaIcon name={isDarkTheme ? 'sun-outline' : 'moon-outline'} color={colors.primary} />
            </TouchableOpacity>

            {/* Avatar com ref */}
            <TouchableOpacity
                ref={avatarRef}
                onPress={openPopover}
                style={styles.avatarWrapper}
            >
                <Avatar.Text
                    size={44}
                    label={initials}
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
                    labelStyle={styles.avatarLabel}
                />
            </TouchableOpacity>

            {/* Popover com âncora baseada em coordenadas medidas */}
            {anchorRect && (
                <Popover
                    isVisible={isVisible}
                    from={anchorRect}
                    onRequestClose={() => setIsVisible(false)}
                    popoverStyle={[styles.popoverContent, { backgroundColor: colors.background }]}
                    animationConfig={{
                        duration: 200,
                        useNativeDriver: true,
                    }}
                >
                    <View>
                        <Text style={[styles.userName, { color: colors.onBackground }]}>
                            {user?.displayName || 'Usuário'}
                        </Text>
                        <Text style={[styles.userEmail, { color: colors.onSurfaceVariant }]}>
                            {user?.email}
                        </Text>

                        <View style={[styles.separator, { backgroundColor: colors.outlineVariant }]} />

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <EvaIcon name="log-out-outline" color={colors.primary} />
                            <Text style={[styles.menuText, { color: colors.primary }]}>Sair</Text>
                        </TouchableOpacity>
                    </View>
                </Popover>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    themeButton: {
        padding: 6,
        borderRadius: 10,
    },
    avatarWrapper: {
        zIndex: 10,
    },
    avatar: {
        elevation: 4,
    },
    avatarLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#fff',
    },
    popoverContent: {
        padding: 12,
        minWidth: 200,
        borderRadius: 12,
        elevation: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        marginBottom: 10,
    },
    separator: {
        height: 1,
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
    },
});
