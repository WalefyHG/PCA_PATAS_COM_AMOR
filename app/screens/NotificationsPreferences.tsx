"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import NotificationService, { type NotificationPreference } from "../utils/NotificationsServices"
import { getUserProfile, auth } from "../config/firebase"

const PET_TYPES = [
    { type: "Cão", icon: "heart", description: "Receber notificações sobre cães" },
    { type: "Gato", icon: "heart", description: "Receber notificações sobre gatos" },
    { type: "Pássaro", icon: "heart", description: "Receber notificações sobre pássaros" },
    { type: "Peixe", icon: "heart", description: "Receber notificações sobre peixes" },
    { type: "Roedor", icon: "heart", description: "Receber notificações sobre roedores" },
    { type: "Réptil", icon: "heart", description: "Receber notificações sobre répteis" },
]

export default function NotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const notificationService = NotificationService.getInstance()

    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        try {
            if (!auth.currentUser) return

            const userProfile = await getUserProfile(auth.currentUser.uid)
            const userPreferences = userProfile?.petPreferences || []

            const prefs = PET_TYPES.map((petType) => ({
                petType: petType.type,
                enabled: userPreferences.includes(petType.type),
            }))

            setPreferences(prefs)
        } catch (error) {
            console.error("Erro ao carregar preferências:", error)
            Alert.alert("Erro", "Não foi possível carregar suas preferências")
        } finally {
            setLoading(false)
        }
    }

    const togglePreference = (petType: string) => {
        setPreferences((prev) =>
            prev.map((pref) => (pref.petType === petType ? { ...pref, enabled: !pref.enabled } : pref)),
        )
    }

    const savePreferences = async () => {
        try {
            setSaving(true)
            await notificationService.updateNotificationPreferences(preferences)
            Alert.alert("Sucesso", "Suas preferências foram salvas!")
        } catch (error) {
            console.error("Erro ao salvar preferências:", error)
            Alert.alert("Erro", "Não foi possível salvar suas preferências")
        } finally {
            setSaving(false)
        }
    }

    const enableAllNotifications = async () => {
        const hasPermission = await notificationService.setupNotifications()
        if (!hasPermission) {
            Alert.alert(
                "Permissão necessária",
                "Para receber notificações, você precisa permitir o acesso nas configurações do seu dispositivo.",
            )
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Carregando preferências...</Text>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Feather name="bell" size={24} color="#6366F1" />
                <Text style={styles.title}>Preferências de Notificação</Text>
                <Text style={styles.subtitle}>Escolha os tipos de pets sobre os quais você quer receber notificações</Text>
            </View>

            <TouchableOpacity style={styles.setupButton} onPress={enableAllNotifications}>
                <Feather name="settings" size={20} color="#fff" />
                <Text style={styles.setupButtonText}>Configurar Notificações</Text>
            </TouchableOpacity>

            <View style={styles.preferencesContainer}>
                {PET_TYPES.map((petType, index) => {
                    const pref = preferences.find((p) => p.petType === petType.type)
                    return (
                        <View key={index} style={styles.preferenceItem}>
                            <View style={styles.preferenceInfo}>
                                <View style={styles.preferenceHeader}>
                                    <Feather name={petType.icon as any} size={20} color="#6366F1" />
                                    <Text style={styles.preferenceTitle}>{petType.type}</Text>
                                </View>
                                <Text style={styles.preferenceDescription}>{petType.description}</Text>
                            </View>
                            <Switch
                                value={pref?.enabled || false}
                                onValueChange={() => togglePreference(petType.type)}
                                trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                                thumbColor={pref?.enabled ? "#6366F1" : "#9CA3AF"}
                            />
                        </View>
                    )
                })}
            </View>

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={savePreferences}
                disabled={saving}
            >
                <Feather name="check" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>{saving ? "Salvando..." : "Salvar Preferências"}</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
                <Feather name="info" size={16} color="#6366F1" />
                <Text style={styles.infoText}>
                    Você receberá notificações sempre que um novo pet do tipo selecionado for colocado para adoção.
                </Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1F2937",
        marginTop: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 22,
    },
    setupButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6366F1",
        marginHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    setupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    preferencesContainer: {
        paddingHorizontal: 20,
    },
    preferenceItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    preferenceInfo: {
        flex: 1,
        marginRight: 16,
    },
    preferenceHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    preferenceTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginLeft: 8,
    },
    preferenceDescription: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 18,
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#10B981",
        marginHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
    },
    saveButtonDisabled: {
        backgroundColor: "#9CA3AF",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#EEF2FF",
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#4338CA",
        lineHeight: 18,
        marginLeft: 8,
    },
})
