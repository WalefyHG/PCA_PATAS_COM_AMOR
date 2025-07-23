import React from "react";
import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Navbar() {

    const router = useNavigation();

    return (
        <View style={styles.topShape}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.goBack()}
            >
                <Ionicons name="arrow-back-circle-outline" size={28} style={styles.icon} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    topShape: {
        display: 'flex',
        backgroundColor: '#E31E24',
        borderBottomRightRadius: 100,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        ...Platform.select({
            web: {
                width: 500,
                height: 80,
            },
            android: {
                width: 200,
                height: 50,

            },
        }),
    },
    iconButton: {
        width: 40,
        marginLeft: 10,
        padding: 5,
    },
    icon: {
        color: "#fff",
    },
})