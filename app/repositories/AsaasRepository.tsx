import { ongRepository } from "../repositories/FirebaseOngRepository" // Importação estática adicionada aqui

const ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3"
const ASAAS_API_KEY = (
    process.env.EXPO_PUBLIC_ASAAS_API_KEY ||
    "$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNzI2NTk6OiRhYWNoXzRlNTkzZWYwLTNkMGYtNGI4Zi1hYzE5LWY4ZDYyNTJkNDI4Nw=="
).trim() // Adicionado .trim()

interface AsaasCustomer {
    id?: string
    name: string
    email: string
    phone?: string
    mobilePhone?: string
    cpfCnpj?: string
    postalCode?: string
    address?: string
    addressNumber?: string
    complement?: string
    province?: string
    city?: string
    state?: string
}

interface AsaasPayment {
    id: string
    customer: string
    billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED"
    value: number
    dueDate: string
    description?: string
    externalReference?: string
    installmentCount?: number
    installmentValue?: number
    discount?: {
        value: number
        dueDateLimitDays: number
    }
    interest?: {
        value: number
    }
    fine?: {
        value: number
    }
    pixAddressKey?: string
    status:
    | "PENDING"
    | "RECEIVED"
    | "CONFIRMED"
    | "OVERDUE"
    | "REFUNDED"
    | "RECEIVED_IN_CASH"
    | "REFUND_REQUESTED"
    | "REFUND_IN_PROGRESS"
    | "CHARGEBACK_REQUESTED"
    | "CHARGEBACK_DISPUTE"
    | "AWAITING_CHARGEBACK_REVERSAL"
    | "DUNNING_REQUESTED"
    | "DUNNING_RECEIVED"
    | "AWAITING_RISK_ANALYSIS"
    paymentDate?: string
    clientPaymentDate?: string
    installmentNumber?: number
    invoiceUrl?: string
    bankSlipUrl?: string
    transactionReceiptUrl?: string
    invoiceNumber?: string
    deleted?: boolean
    anticipated?: boolean
    anticipable?: boolean
}

interface AsaasPixQrCode {
    encodedImage: string
    payload: string
    expirationDate: string
}

interface AsaasTransfer {
    id?: string
    value: number
    pixAddressKey: string
    description?: string
    scheduleDate?: string
}

interface AsaasTransferResponse {
    id: string
    value: number
    pixAddressKey: string
    description: string
    status: "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED"
    transferFee: number
    effectiveDate: string
    scheduleDate?: string
    failReason?: string
}

interface AsaasBalance {
    balance: number
}

interface AsaasBankAccount {
    id: string
    bank: {
        code: string
        name: string
    }
    accountName: string
    ownerName: string
    cpfCnpj: string
    agency: string
    account: string
    accountDigit: string
    bankAccountType: "CONTA_CORRENTE" | "CONTA_POUPANCA"
    pixAddressKey?: string
}

interface DonationData {
    ongId: string
    ongName: string
    donorName: string
    donorEmail: string
    donorPhone: string
    donorCpf: string
    amount: number
    pixKey: string
    asaasPaymentId: string
    qrCode: string
    pixCopyPaste: string
}

class AsaasService {
    private async makeRequest<T>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data?: any,
    ): Promise<T> {
        try {
            const response = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    access_token: ASAAS_API_KEY,
                },
                body: data ? JSON.stringify(data) : undefined,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`Asaas API Error (${method} ${endpoint}):`, error)
            throw error
        }
    }

    async createCustomer(customerData: Omit<AsaasCustomer, "id">): Promise<AsaasCustomer> {
        return this.makeRequest<AsaasCustomer>("/customers", "POST", customerData)
    }

    async getCustomer(customerId: string): Promise<AsaasCustomer> {
        return this.makeRequest<AsaasCustomer>(`/customers/${customerId}`)
    }

    async createPixPayment(paymentData: Omit<AsaasPayment, "id">): Promise<AsaasPayment> {
        return this.makeRequest<AsaasPayment>("/payments", "POST", paymentData)
    }

    async getPayment(paymentId: string): Promise<AsaasPayment> {
        return this.makeRequest<AsaasPayment>(`/payments/${paymentId}`)
    }

    async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
        return this.makeRequest<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`)
    }

    async cancelPayment(paymentId: string): Promise<void> {
        await this.makeRequest(`/payments/${paymentId}`, "DELETE")
    }

    async createDonation(donationData: DonationData): Promise<string> {
        try {
            // Não é mais necessário importar aqui, ongRepository já está importado globalmente
            const donationId = await ongRepository.createDonation({
                ongId: donationData.ongId,
                ongName: donationData.ongName,
                donorName: donationData.donorName,
                donorEmail: donationData.donorEmail,
                amount: donationData.amount,
                pixKey: donationData.pixKey,
                asaasPaymentId: donationData.asaasPaymentId,
                qrCode: donationData.qrCode,
                pixCopyPaste: donationData.pixCopyPaste,
                status: "pending",
            })
            return donationId
        } catch (error) {
            console.error("Error creating donation:", error)
            throw new Error("Erro ao salvar doação")
        }
    }

    // ===== FUNCIONALIDADES DE TRANSFERÊNCIA =====

    /**
     * Obtém o saldo atual da conta ASAAS
     */
    async getBalance(): Promise<AsaasBalance> {
        try {
            return await this.makeRequest<AsaasBalance>("/finance/balance")
        } catch (error) {
            console.error("Error fetching balance:", error)
            throw new Error("Erro ao consultar saldo")
        }
    }

    /**
     * Lista as contas bancárias cadastradas
     */
    async getBankAccounts(): Promise<AsaasBankAccount[]> {
        try {
            const response = await this.makeRequest<{ data: AsaasBankAccount[] }>("/bankAccounts")
            return response.data || []
        } catch (error) {
            console.error("Error fetching bank accounts:", error)
            throw new Error("Erro ao consultar contas bancárias")
        }
    }

    /**
     * Cria uma transferência PIX
     */
    async createPixTransfer(transferData: Omit<AsaasTransfer, "id">): Promise<AsaasTransferResponse> {
        try {
            const response = await this.makeRequest<AsaasTransferResponse>("/transfers", "POST", {
                ...transferData,
                operationType: "PIX",
            })
            console.log(`PIX transfer created: ${response.id}`)
            return response
        } catch (error) {
            console.error("Error creating PIX transfer:", error)
            throw new Error("Erro ao criar transferência PIX")
        }
    }

    /**
     * Consulta o status de uma transferência
     */
    async getTransfer(transferId: string): Promise<AsaasTransferResponse> {
        try {
            return await this.makeRequest<AsaasTransferResponse>(`/transfers/${transferId}`)
        } catch (error) {
            console.error("Error fetching transfer:", error)
            throw new Error("Erro ao consultar transferência")
        }
    }

    /**
     * Lista todas as transferências
     */
    async getTransfers(limit = 20, offset = 0): Promise<AsaasTransferResponse[]> {
        try {
            const response = await this.makeRequest<{ data: AsaasTransferResponse[] }>(
                `/transfers?limit=${limit}&offset=${offset}`,
            )
            return response.data || []
        } catch (error) {
            console.error("Error fetching transfers:", error)
            throw new Error("Erro ao consultar transferências")
        }
    }

    /**
     * Cancela uma transferência (apenas se ainda estiver pendente)
     */
    async cancelTransfer(transferId: string): Promise<void> {
        try {
            await this.makeRequest(`/transfers/${transferId}`, "DELETE")
            console.log(`Transfer ${transferId} cancelled`)
        } catch (error) {
            console.error("Error cancelling transfer:", error)
            throw new Error("Erro ao cancelar transferência")
        }
    }

    /**
     * Processa transferência automática para uma doação
     */
    async processAutomaticTransfer(
        donationId: string,
        pixKey: string,
        amount: number,
        description?: string,
    ): Promise<{
        success: boolean
        transferId?: string
        message: string
    }> {
        try {
            // 1. Verificar saldo disponível
            const balance = await this.getBalance()
            if (balance.balance < amount) {
                return {
                    success: false,
                    message: `Saldo insuficiente. Disponível: R$ ${balance.balance.toFixed(2)}, Necessário: R$ ${amount.toFixed(2)}`,
                }
            }

            // 2. Criar a transferência PIX
            const transfer = await this.createPixTransfer({
                value: amount,
                pixAddressKey: pixKey,
                description: description || `Transferência automática - Doação ${donationId}`,
            })

            // 3. Atualizar status da doação no Firebase
            // Não é mais necessário importar aqui, ongRepository já está importado globalmente
            await ongRepository.updateDonationStatus(donationId, "paid")
            return {
                success: true,
                transferId: transfer.id,
                message: `Transferência realizada com sucesso! ID: ${transfer.id}`,
            }
        } catch (error) {
            console.error("Error processing automatic transfer:", error)
            return {
                success: false,
                message: error instanceof Error ? error.message : "Erro desconhecido ao processar transferência",
            }
        }
    }

    /**
     * Verifica se uma chave PIX é válida para transferência ASAAS
     */
    async validatePixKey(pixKey: string): Promise<{
        valid: boolean
        ownerName?: string
        ownerDocument?: string
        message: string
    }> {
        try {
            // Endpoint para validar chave PIX (pode variar conforme a API do ASAAS)
            const response = await this.makeRequest<{
                valid: boolean
                ownerName?: string
                ownerDocument?: string
            }>("/pix/addressKeys/validate", "POST", {
                addressKey: pixKey,
            })
            return {
                ...response,
                message: response.valid ? "Chave PIX válida" : "Chave PIX inválida",
            }
        } catch (error) {
            console.error("Error validating PIX key:", error)
            return {
                valid: false,
                message: "Erro ao validar chave PIX",
            }
        }
    }

    /**
     * Obtém estatísticas de transferências
     */
    async getTransferStats(
        startDate?: string,
        endDate?: string,
    ): Promise<{
        totalTransfers: number
        totalAmount: number
        successfulTransfers: number
        failedTransfers: number
        pendingTransfers: number
    }> {
        try {
            let endpoint = "/transfers/statistics"
            const params = new URLSearchParams()

            if (startDate) params.append("startDate", startDate)
            if (endDate) params.append("endDate", endDate)

            if (params.toString()) {
                endpoint += `?${params.toString()}`
            }

            const response = await this.makeRequest<{
                totalTransfers: number
                totalAmount: number
                successfulTransfers: number
                failedTransfers: number
                pendingTransfers: number
            }>(endpoint)
            return response
        } catch (error) {
            console.error("Error fetching transfer stats:", error)
            return {
                totalTransfers: 0,
                totalAmount: 0,
                successfulTransfers: 0,
                failedTransfers: 0,
                pendingTransfers: 0,
            }
        }
    }

    // ===== FUNCIONALIDADES DE SINCRONIZAÇÃO DE STATUS =====

    /**
     * Sincroniza o status de uma doação com o ASAAS
     */
    async syncDonationStatus(
        donationId: string,
        asaasPaymentId: string,
    ): Promise<{
        success: boolean
        currentStatus: string
        message: string
    }> {
        try {
            // 1. Buscar o pagamento no ASAAS
            const payment = await this.getPayment(asaasPaymentId)

            // 2. Mapear status do ASAAS para status da doação
            let donationStatus: "pending" | "paid" | "cancelled"

            switch (payment.status) {
                case "RECEIVED":
                case "CONFIRMED":
                case "RECEIVED_IN_CASH":
                    donationStatus = "paid"
                    break
                case "OVERDUE":
                case "REFUNDED":
                case "CHARGEBACK_REQUESTED":
                    donationStatus = "cancelled"
                    break
                default:
                    donationStatus = "pending"
            }

            // 3. Atualizar no Firebase
            // Não é mais necessário importar aqui, ongRepository já está importado globalmente
            await ongRepository.updateDonationStatus(donationId, donationStatus)

            return {
                success: true,
                currentStatus: payment.status,
                message: `Status sincronizado: ${payment.status} → ${donationStatus}`,
            }
        } catch (error) {
            console.error("Error syncing donation status:", error)
            return {
                success: false,
                currentStatus: "UNKNOWN",
                message: error instanceof Error ? error.message : "Erro ao sincronizar status",
            }
        }
    }

    /**
     * Obtém detalhes completos de um pagamento ASAAS
     */
    async getPaymentDetails(paymentId: string): Promise<{
        success: boolean
        payment?: AsaasPayment
        message: string
    }> {
        try {
            const payment = await this.getPayment(paymentId)
            return {
                success: true,
                payment,
                message: "Detalhes obtidos com sucesso",
            }
        } catch (error) {
            console.error("Error fetching payment details:", error)
            return {
                success: false,
                message: error instanceof Error ? error.message : "Erro ao buscar detalhes do pagamento",
            }
        }
    }

    /**
     * Lista todos os pagamentos com filtros
     */
    async getPayments(
        limit = 20,
        offset = 0,
        status?: string,
        customer?: string,
    ): Promise<{
        success: boolean
        payments: AsaasPayment[]
        totalCount: number
        message: string
    }> {
        try {
            let endpoint = `/payments?limit=${limit}&offset=${offset}`
            if (status) endpoint += `&status=${status}`
            if (customer) endpoint += `&customer=${customer}`
            const response = await this.makeRequest<{
                data: AsaasPayment[]
                totalCount: number
            }>(endpoint)
            return {
                success: true,
                payments: response.data || [],
                totalCount: response.totalCount || 0,
                message: "Pagamentos obtidos com sucesso",
            }
        } catch (error) {
            console.error("Error fetching payments:", error)
            return {
                success: false,
                payments: [],
                totalCount: 0,
                message: error instanceof Error ? error.message : "Erro ao buscar pagamentos",
            }
        }
    }

    /**
     * Converte status do ASAAS para status legível em português
     */
    getStatusDescription(status: string): string {
        const statusMap: { [key: string]: string } = {
            PENDING: "Pendente",
            RECEIVED: "Recebido",
            CONFIRMED: "Confirmado",
            OVERDUE: "Vencido",
            REFUNDED: "Reembolsado",
            RECEIVED_IN_CASH: "Recebido em Dinheiro",
            REFUND_REQUESTED: "Reembolso Solicitado",
            REFUND_IN_PROGRESS: "Reembolso em Andamento",
            CHARGEBACK_REQUESTED: "Chargeback Solicitado",
            CHARGEBACK_DISPUTE: "Disputa de Chargeback",
            AWAITING_CHARGEBACK_REVERSAL: "Aguardando Reversão de Chargeback",
            DUNNING_REQUESTED: "Cobrança Solicitada",
            DUNNING_RECEIVED: "Cobrança Recebida",
            AWAITING_RISK_ANALYSIS: "Aguardando Análise de Risco",
        }
        return statusMap[status] || status
    }

    /**
     * Obtém a cor do status para exibição
     */
    getStatusColor(status: string): string {
        switch (status) {
            case "RECEIVED":
            case "CONFIRMED":
            case "RECEIVED_IN_CASH":
                return "#10B981" // Verde
            case "PENDING":
            case "AWAITING_RISK_ANALYSIS":
                return "#F59E0B" // Amarelo
            case "OVERDUE":
            case "REFUNDED":
            case "CHARGEBACK_REQUESTED":
                return "#EF4444" // Vermelho
            default:
                return "#6B7280" // Cinza
        }
    }
}

export const asaasService = new AsaasService()
