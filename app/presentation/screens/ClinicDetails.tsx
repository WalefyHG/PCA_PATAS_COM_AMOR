"use client"

import type React from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking } from "react-native"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import type { Clinic } from "../../domain/entities/Clinic"

type ClinicDetailsRouteParams = {
    ClinicDetails: {
        clinic: Clinic
    }
}

const ClinicDetails: React.FC = () => {
    const route = useRoute<RouteProp<ClinicDetailsRouteParams, "ClinicDetails">>()
    const navigation = useNavigation<any>()
    const { isDarkTheme, colors } = useThemeContext()
    const { user } = useAuth()

    const { clinic } = route.params
    const isOwner = user?.uid === clinic.userId

    const handleCall = () => {
        const phoneNumber = clinic.phone.replace(/\D/g, "")
        Linking.openURL(`tel:${phoneNumber}`)
    }

    const handleEmail = () => {
        Linking.openURL(`mailto:${clinic.email}`)
    }

    const handleEdit = () => {
        navigation.navigate("RegisterClinic" as never, { clinic } as never)
    }

    const handleScheduleAppointment = () => {
        navigation.navigate("ScheduleAppointment" as never, { clinic } as never)
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

    const getDayName = (dayKey: string) => {
        const dayNames: { [key: string]: string } = {
            monday: "Segunda",
            tuesday: "Terça",
            wednesday: "Quarta",
            thursday: "Quinta",
            friday: "Sexta",
            saturday: "Sábado",
            sunday: "Domingo",
        }
        return dayNames[dayKey] || dayKey
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
        serviceItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        serviceText: {
            fontSize: 16,
            color: isDarkTheme ? "#D1D5DB" : "#374151",
            marginLeft: 8,
        },
        workingHoursItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkTheme ? "#374151" : "#E5E7EB",
        },
        dayName: {
            fontSize: 16,
            fontWeight: "500",
            color: isDarkTheme ? "#FFFFFF" : "#1F2937",
        },
        timeText: {
            fontSize: 16,
            color: isDarkTheme ? "#D1D5DB" : "#374151",
        },
        closedText: {
            fontSize: 16,
            color: isDarkTheme ? "#9CA3AF" : "#6B7280",
            fontStyle: "italic",
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
                    {clinic.logoUrl ? (
                        <Image source={{ uri: clinic.logoUrl }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Feather name="activity" size={32} color="#FFFFFF" />
                        </View>
                    )}
                    <Text style={styles.headerTitle}>{clinic.name}</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{clinic.isActive ? "Ativa" : "Inativa"}</Text>
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
                            <Text style={styles.infoText}>{clinic.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                            <Text style={styles.contactButtonText}>Enviar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="phone" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Telefone</Text>
                            <Text style={styles.infoText}>{formatPhone(clinic.phone)}</Text>
                        </View>
                        <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                            <Text style={styles.contactButtonText}>Ligar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="map-pin" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Endereço</Text>
                            <Text style={styles.infoText}>{clinic.address}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="file-text" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>CNPJ</Text>
                            <Text style={styles.infoText}>{formatCNPJ(clinic.cnpj)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="award" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>CRMV</Text>
                            <Text style={styles.infoText}>{clinic.crmv}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre a Clínica</Text>
                    <Text style={styles.description}>{clinic.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
                    {clinic.services.map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                            <Feather name="check-circle" size={16} color={colors.primary} />
                            <Text style={styles.serviceText}>{service}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>
                    {Object.entries(clinic.workingHours).map(([dayKey, dayInfo]) => (
                        <View key={dayKey} style={styles.workingHoursItem}>
                            <Text style={styles.dayName}>{getDayName(dayKey)}</Text>
                            {dayInfo.isOpen ? (
                                <Text style={styles.timeText}>
                                    {dayInfo.open} às {dayInfo.close}
                                </Text>
                            ) : (
                                <Text style={styles.closedText}>Fechado</Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações Gerais</Text>
                    <View style={styles.infoRow}>
                        <Feather name="calendar" size={20} color={colors.primary} style={styles.infoIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Data de Cadastro</Text>
                            <Text style={styles.infoText}>
                                {(
                                    typeof clinic.createdAt?.toDate === "function"
                                        ? clinic.createdAt.toDate()
                                        : new Date(
                                            typeof clinic.createdAt === "string" || typeof clinic.createdAt === "number"
                                                ? clinic.createdAt
                                                : ""
                                        )
                                ).toLocaleDateString("pt-BR")}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.actionButtons}>
                {!isOwner && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleScheduleAppointment}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                        >
                            <Feather name="calendar" size={20} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>Agendar Consulta</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default ClinicDetails
