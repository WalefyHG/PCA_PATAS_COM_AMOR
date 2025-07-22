import type React from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import type { Ong } from "@/app/domain/entities/Ongs"

type OngDetailsRouteParams = {
    OngDetails: {
        ong: Ong
    }
}

const OngDetails: React.FC = () => {
    const route = useRoute<RouteProp<OngDetailsRouteParams, "OngDetails">>()
    const navigation = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()

    const { ong } = route.params
    const isOwner = user?.uid === ong.userId

    const handleCall = () => {
        const phoneNumber = ong.phone.replace(/\D/g, "")
        Linking.openURL(`tel:${phoneNumber}`)
    }

    const handleEmail = () => {
        Linking.openURL(`mailto:${ong.email}`)
    }

    const handleEdit = () => {
        navigation.navigate("RegisterOng" as never, { ong } as never)
    }

    const handleDonate = () => {
        navigation.navigate("Donation" as never, { selectedOng: ong } as never)
    }

    const formatCNPJ = (cnpj: string) => {
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }

    const formatPhone = (phone: string) => {
        const numbers = phone.replace(/\D/g, "")
        if (numbers.length === 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
        }
        return phone
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkTheme ? "#111827" : "#F9FAFB",
        },
        header: {
            paddingTop: 60,
            paddingBottom: 30,
            paddingHorizontal: 20,
            alignItems: "center",
        },
        backButton: {
            position: "absolute",
            top: 60,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
        },
        editButton: {
            position: "absolute",
            top: 60,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
        },
        logoContainer: {
            alignItems: "center",
            marginBottom: 16,
        },
        logo: {
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 12,
        },
        logoPlaceholder: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 8,
        },
        statusContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        statusBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
        statusText: {
            fontSize: 14,
            color: "#FFFFFF",
            fontWeight: "500",
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
        },
        section: {
            backgroundColor: isDarkTheme ? "#1F2937" : "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
            marginBottom: 12,
        },
        infoRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
        },
        infoIcon: {
            marginRight: 12,
            width: 20,
        },
        infoText: {
            fontSize: 16,
            color: isDarkTheme ? "#D1D5DB" : "#374151",
            flex: 1,
        },
        infoLabel: {
            fontSize: 14,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            marginBottom: 4,
        },
        description: {
            fontSize: 16,
            color: isDarkTheme ? "#D1D5DB" : "#374151",
            lineHeight: 24,
        },
        actionButtons: {
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        actionButton: {
            flex: 1,
            borderRadius: 12,
            overflow: "hidden",
        },
        actionButtonGradient: {
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
        },
        actionButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
        },
        contactButton: {
            backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            marginLeft: "auto",
        },
        contactButtonText: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: "500",
        },
    })

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {isOwner && (
                    <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Feather name="edit-2" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                )}

                <View style={styles.logoContainer}>
                    {ong.logoUrl ? (
                        <Image source={{ uri: ong.logoUrl }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Feather name="heart" size={32} color="#FFFFFF" />
                        </View>
                    )}
                    <Text style={styles.headerTitle}>{ong.name}</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{ong.isActive ? "Ativa" : "Inativa"}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações de Contato</Text>

                    <View style={styles.infoRow}>
                        <Feather name="mail" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoText}>{ong.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                            <Text style={styles.contactButtonText}>Enviar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="phone" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Telefone</Text>
                            <Text style={styles.infoText}>{formatPhone(ong.phone)}</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                            <Text style={styles.contactButtonText}>Ligar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="file-text" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>CNPJ</Text>
                            <Text style={styles.infoText}>{formatCNPJ(ong.cnpj)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre a ONG</Text>
                    <Text style={styles.description}>{ong.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações de Doação</Text>
                    <View style={styles.infoRow}>
                        <Feather name="credit-card" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Chave PIX</Text>
                            <Text style={styles.infoText}>{ong.pixKey}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações Gerais</Text>
                    <View style={styles.infoRow}>
                        <Feather name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Data de Cadastro</Text>
                            <Text style={styles.infoText}>{ong.createdAt.toLocaleDateString("pt-BR")}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.actionButtons}>
                {!isOwner && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleDonate}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                        >
                            <Feather name="heart" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Fazer Doação</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default OngDetails
