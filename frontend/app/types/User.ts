export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    preferences: {
        currency: string;
        dateFormat: string;
        budgetPeriod: string;
        theme: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}