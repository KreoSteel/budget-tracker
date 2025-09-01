export type Account = {
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


export type TransferMoney = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
}

export type TransferMoneyResponse = {
    message: string;
    type: 'success' | 'error';
}