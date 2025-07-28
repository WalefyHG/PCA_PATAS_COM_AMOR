import { Modal, View, Text, TouchableOpacity, ScrollView, Platform, StyleSheet, Linking } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeContext } from "../contexts/ThemeContext"
import { asaasService } from "../../repositories/AsaasRepository" // Importar o serviço ASAAS

interface PaymentDetails {
    id: string
    status: string
    value: number
    paymentDate?: string
    clientPaymentDate?: string
    description?: string
    invoiceUrl?: string
    bankSlipUrl?: string
    transactionReceiptUrl?: string
}

interface PaymentDetailsModalProps {
    visible: boolean
    onClose: () => void
    payment: PaymentDetails | null
}

export default function PaymentDetailsModal({ visible, onClose, payment }: PaymentDetailsModalProps) {
    const { isDarkTheme, colors } = useThemeContext()

    if (!payment) {
        return null // Não renderiza se não houver dados de pagamento
    }

    const openLink = async (url: string | undefined) => {
        if (url && (await Linking.canOpenURL(url))) {
            await Linking.openURL(url)
        } else {
            console.warn("Não foi possível abrir o link:", url)
        }
    }

    const renderDetailRow = (label: string, value: string | undefined, isCurrency = false) => {
        if (!value) return null
        return (
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <Text className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>{label}</Text>
                <Text className={`text-base font-semibold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                    {isCurrency ? `R$ ${Number.parseFloat(value).toFixed(2).replace(".", ",")}` : value}
                </Text>
            </View>
        )
    }

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-center items-center p-4">
                <View
                    className={`${isDarkTheme ? "bg-gray-800" : "bg-white"} rounded-xl w-full max-w-md`}
                    style={styles.modalContentShadow}
                >
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                        <Text
                            className={`text-xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}
                            style={Platform.select({
                                ios: { fontFamily: "San Francisco" },
                                android: { fontFamily: "Roboto" },
                            })}
                        >
                            Detalhes do Pagamento
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Feather name="x" size={24} color={isDarkTheme ? colors.primary : colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
                        <View className="mb-4">
                            <Text className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
                                ID do Pagamento
                            </Text>
                            <Text className={`text-base font-semibold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                                {payment.id}
                            </Text>
                        </View>

                        <View className="mb-4">
                            <Text className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
                                Status ASAAS
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View
                                    className="px-3 py-1 rounded-full mr-2"
                                    style={{
                                        backgroundColor: `${asaasService.getStatusColor(payment.status)}20`,
                                    }}
                                >
                                    <Text
                                        className="text-sm font-medium"
                                        style={{
                                            color: asaasService.getStatusColor(payment.status),
                                        }}
                                    >
                                        {asaasService.getStatusDescription(payment.status)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>Valor</Text>
                            <Text className={`text-3xl font-bold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                                R$ {payment.value.toFixed(2).replace(".", ",")}
                            </Text>
                        </View>

                        {renderDetailRow(
                            "Data de Pagamento",
                            payment.paymentDate ? new Date(payment.paymentDate).toLocaleString("pt-BR") : undefined,
                        )}
                        {renderDetailRow(
                            "Data de Pagamento do Cliente",
                            payment.clientPaymentDate ? new Date(payment.clientPaymentDate).toLocaleString("pt-BR") : undefined,
                        )}
                        {renderDetailRow("Descrição", payment.description)}

                        {/* Links Section */}
                        {(payment.invoiceUrl || payment.bankSlipUrl || payment.transactionReceiptUrl) && (
                            <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Text className={`text-sm font-medium mb-3 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>
                                    Links Disponíveis
                                </Text>
                                {payment.invoiceUrl && (
                                    <TouchableOpacity
                                        onPress={() => openLink(payment.invoiceUrl)}
                                        className="flex-row items-center py-2 px-3 rounded-lg mb-2 bg-blue-50 dark:bg-blue-900/20"
                                    >
                                        <Feather name="file-text" size={18} color={colors.primary} className="mr-3" />
                                        <Text className="text-blue-600 dark:text-blue-400 text-base font-medium">Fatura</Text>
                                    </TouchableOpacity>
                                )}
                                {payment.bankSlipUrl && (
                                    <TouchableOpacity
                                        onPress={() => openLink(payment.bankSlipUrl)}
                                        className="flex-row items-center py-2 px-3 rounded-lg mb-2 bg-blue-50 dark:bg-blue-900/20"
                                    >
                                        <Feather name="credit-card" size={18} color={colors.primary} className="mr-3" />
                                        <Text className="text-blue-600 dark:text-blue-400 text-base font-medium">Boleto</Text>
                                    </TouchableOpacity>
                                )}
                                {payment.transactionReceiptUrl && (
                                    <TouchableOpacity
                                        onPress={() => openLink(payment.transactionReceiptUrl)}
                                        className="flex-row items-center py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                                    >
                                        <Feather name="file" size={18} color={colors.primary} className="mr-3" />
                                        <Text className="text-blue-600 dark:text-blue-400 text-base font-medium">Comprovante</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContentShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 15, // For Android
    },
})
