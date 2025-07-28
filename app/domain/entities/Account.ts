export type AccountType = "user" | "ong" | "clinic"

export interface AccountProfile {
    id?: string
    userId: string
    type: AccountType
    profileId: string
    profileName: string
    profileImage?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface UserAccountContext {
    currentAccount: AccountProfile
    availableAccounts: AccountProfile[]
}
