import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../utils/ThemeContext';
import { Feather } from '@expo/vector-icons';

interface NavigationCardProps {
    title: string;
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
}

export default function NavigationCard({ title, icon, onPress }: NavigationCardProps) {
    const { paperTheme } = useThemeContext();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: paperTheme.colors.surface,
                    borderColor: paperTheme.colors.primary,
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.cardContent}>
                <Feather
                    name={icon}
                    size={32}
                    color={paperTheme.colors.primary}
                    style={styles.icon}
                />
                <Text
                    style={[
                        styles.cardTitle,
                        { color: paperTheme.colors.onSurface },
                    ]}
                >
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        width: '45%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    cardContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
