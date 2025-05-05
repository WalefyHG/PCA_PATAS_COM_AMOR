import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../utils/ThemeContext';
import { Feather } from '@expo/vector-icons';

interface Pet {
    id: string;
    name: string;
    age: string;
    type: string;
    breed: string;
    description: string;
    image: string;
}

export default function Adopt() {
    const { paperTheme } = useThemeContext();

    const [pets] = useState<Pet[]>([
        {
            id: '1',
            name: 'Max',
            age: '2 anos',
            type: 'Cachorro',
            breed: 'Labrador',
            description: 'Max é um cachorro amigável e brincalhão que adora crianças.',
            image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
            id: '2',
            name: 'Luna',
            age: '1 ano',
            type: 'Gato',
            breed: 'Siamês',
            description: 'Luna é uma gata dócil e carinhosa que adora dormir no colo.',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
            id: '3',
            name: 'Bob',
            age: '3 anos',
            type: 'Cachorro',
            breed: 'Vira-lata',
            description: 'Bob é um cachorro leal e protetor, ótimo para famílias.',
            image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
            id: '4',
            name: 'Mia',
            age: '6 meses',
            type: 'Gato',
            breed: 'Persa',
            description: 'Mia é uma gatinha brincalhona e curiosa, perfeita para apartamentos.',
            image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
    ]);

    return (
        <ScrollView style={{ backgroundColor: paperTheme.colors.background }}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>
                    Adote um Amigo
                </Text>
                <Text style={[styles.subtitle, { color: paperTheme.colors.onBackground }]}>
                    Encontre um novo companheiro para sua família
                </Text>

                {pets.map((pet) => (
                    <View
                        key={pet.id}
                        style={[
                            styles.petCard,
                            { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline }
                        ]}
                    >
                        <Image source={{ uri: pet.image }} style={styles.petImage} />
                        <View style={styles.petInfo}>
                            <Text style={[styles.petName, { color: paperTheme.colors.onSurface }]}>{pet.name}</Text>
                            <Text style={[styles.petDetails, { color: paperTheme.colors.onSurfaceVariant }]}>
                                {pet.type} • {pet.breed} • {pet.age}
                            </Text>
                            <Text
                                style={[styles.petDescription, { color: paperTheme.colors.onSurfaceVariant }]}
                                numberOfLines={3}
                            >
                                {pet.description}
                            </Text>
                            <TouchableOpacity
                                style={[styles.adoptButton, { backgroundColor: paperTheme.colors.primary }]}
                            >
                                <Text style={[styles.adoptButtonText, { color: paperTheme.colors.onPrimary }]}>
                                    Quero Adotar
                                </Text>
                                <Feather name="heart" size={16} color={paperTheme.colors.onPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    petCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    petImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    petInfo: {
        padding: 16,
    },
    petName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    petDetails: {
        fontSize: 14,
        marginBottom: 8,
    },
    petDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    adoptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    adoptButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
