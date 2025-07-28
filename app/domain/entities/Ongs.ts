export interface Ong {
    id?: string
    name: string
    email: string
    phone: string
    cnpj: string
    pixKey: string
    description: string
    logoUrl?: string
    userId: string // ID do usuário que criou a ONG
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Donation {
    id?: string
    ongId: string
    ongName: string
    donorName: string
    donorEmail: string
    amount: number
    pixKey: string
    asaasPaymentId: string
    qrCode: string
    pixCopyPaste: string
    status: "pending" | "paid" | "cancelled"
    createdAt: Date
    updatedAt: Date
}
