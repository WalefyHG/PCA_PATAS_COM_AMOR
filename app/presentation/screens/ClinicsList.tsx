"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useThemeContext } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { clinicRepository } from "../../repositories/FirebaseClinicRepository"
import FloatingActionButton from "../components/FloatingButton"
import type { Clinic } from "../../domain/entities/Clinic"

const MyClinics: React.FC = () => {
  const navigation = useNavigation<any>()
  const { isDarkTheme, colors } = useThemeContext()
  const { user } = useAuth()

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadClinics = async () => {
    if (!user?.uid) return

    try {
      const userClinics = await clinicRepository.getClinicsByUser(user.uid)
      setClinics(userClinics)
    } catch (error) {
      console.error("Error loading clinics:", error)
      Alert.alert("Erro", "Erro ao carregar clínicas")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadClinics()
    }, [user?.uid]),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadClinics()
  }

  const handleAddClinic = () => {
    navigation.navigate("RegisterClinic" as never)
  }

  const handleEditClinic = (clinic: Clinic) => {
    navigation.navigate("RegisterClinic" as never, { clinic } as never)
  }

  const handleDeleteClinic = (clinic: Clinic) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a clínica "${clinic.name}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              if (clinic.id) {
                await clinicRepository.deleteClinic(clinic.id)
                setClinics(clinics.filter((c) => c.id !== clinic.id))
                Alert.alert("Sucesso", "Clínica excluída com sucesso")
              }
            } catch (error) {
              console.error("Error deleting clinic:", error)
              Alert.alert("Erro", "Erro ao excluir clínica")
            }
          },
        },
      ],
    )
  }

  const handleViewDetails = (clinic: Clinic) => {
    navigation.navigate("ClinicDetails" as never, { clinic } as never)
  }

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity style={styles.clinicCard} onPress={() => handleViewDetails(item)}>
      <View style={styles.clinicHeader}>
        <View style={styles.clinicInfo}>
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.clinicLogo} />
          ) : (
            <View style={[styles.clinicLogoPlaceholder, { backgroundColor: colors.primary }]}>
              <Feather name="activity" size={24} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.clinicTextInfo}>
            <Text style={[styles.clinicName, { color: isDarkTheme ? "#FFFFFF" : "#1F2937" }]}>{item.name}</Text>
            <Text style={[styles.clinicEmail, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>{item.email}</Text>
            <Text style={[styles.clinicCrmv, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>CRMV: {item.crmv}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: item.isActive ? "#10B981" : "#EF4444" }]}>
                <Text style={styles.statusText}>{item.isActive ? "Ativa" : "Inativa"}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.clinicActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleEditClinic(item)}
          >
            <Feather name="edit-2" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
            onPress={() => handleDeleteClinic(item)}
          >
            <Feather name="trash-2" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.clinicDescription, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.clinicFooter}>
        <View style={styles.servicesContainer}>
          <Feather name="briefcase" size={14} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
          <Text style={[styles.servicesText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
            {item.services.length} serviços
          </Text>
        </View>
        <Text style={[styles.clinicDate, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
          Criada em {item.createdAt && "toDate" in item.createdAt
            ? item.createdAt.toDate().toLocaleDateString("pt-BR")
            : ""}
        </Text>
        <Feather name="chevron-right" size={16} color={isDarkTheme ? "#9CA3AF" : "#6B7280"} />
      </View>
    </TouchableOpacity>
  )

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
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDarkTheme ? "#FFFFFF" : "#1F2937",
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDarkTheme ? "#9CA3AF" : "#6B7280",
      textAlign: "center",
      lineHeight: 24,
    },
    clinicCard: {
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
    clinicHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    clinicInfo: {
      flexDirection: "row",
      flex: 1,
    },
    clinicLogo: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    clinicLogoPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    clinicTextInfo: {
      flex: 1,
    },
    clinicName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
    },
    clinicEmail: {
      fontSize: 14,
      marginBottom: 2,
    },
    clinicCrmv: {
      fontSize: 12,
      marginBottom: 8,
    },
    statusContainer: {
      flexDirection: "row",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "500",
    },
    clinicActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    clinicDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
    },
    clinicFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    servicesContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    servicesText: {
      fontSize: 12,
    },
    clinicDate: {
      fontSize: 12,
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
  })

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={isDarkTheme ? [colors.primaryDark, colors.secondaryDark] : [colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Minhas Clínicas</Text>
          <Text style={styles.headerSubtitle}>Gerencie suas clínicas veterinárias</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptySubtitle, { marginTop: 16 }]}>Carregando clínicas...</Text>
        </View>
      </View>
    )
  }

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
        <Text style={styles.headerTitle}>Minhas Clínicas</Text>
        <Text style={styles.headerSubtitle}>Gerencie suas clínicas veterinárias</Text>
      </LinearGradient>

      <View style={styles.content}>
        {clinics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="activity" size={64} color={isDarkTheme ? "#374151" : "#D1D5DB"} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Nenhuma clínica cadastrada</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não possui clínicas cadastradas. Clique no botão "+" para adicionar sua primeira clínica
              veterinária.
            </Text>
          </View>
        ) : (
          <FlatList
            data={clinics}
            renderItem={renderClinicItem}
            keyExtractor={(item) => item.id || ""}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          />
        )}
      </View>

      <FloatingActionButton onPress={handleAddClinic} icon="plus" label="Adicionar Clínica" />
    </View>
  )
}

export default MyClinics
