export interface Account {
    _id: string;
    name: string;
    type: string;
    balance: number;
    userId: string;
    currency: string;
    bankName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}