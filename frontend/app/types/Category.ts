import type { User } from "./User";

export interface Category {
    _id: string;
    name: string;
    type: "income" | "expense";
    userId: User;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateCategoryRequest = {
    name: string;
    type: "income" | "expense";
    userId: string;
}