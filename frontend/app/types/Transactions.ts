import type { Account } from "./Account";
import type { Category } from "./Category";

export interface Transaction {
    _id: string;
    amount: number;
    description: string;
    type: "income" | "expense";
    accountId: Account;
    categoryId: Category;
    date: Date;
    isRecurring: boolean;
    recurringDetails: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
        endDate: Date;
        nextOccurrence: Date;
        occurrences: number;
    };
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateTransactionRequest = {
    amount: number;
    description: string;
    type: "income" | "expense";
    accountId: string;
    categoryId: string;
    date: string;
    paymentMethod: string;
}