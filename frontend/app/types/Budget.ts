export interface BudgetCategory {
    categoryId: string;
    allocatedAmount: number;
    spentAmount: number;
}

export interface Budget {
    _id: string;
    userId: string;
    name: string;
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    categories: BudgetCategory[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}



export interface CreateBudgetRequest {
    name: string;
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
    totalAmount: number;
    categories: BudgetCategory[];
    userId: string;
}

export interface UpdateBudgetRequest {
    name?: string;
    period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate?: string;
    endDate?: string;
    totalAmount?: number;
    categories?: BudgetCategory[];
    isActive?: boolean;
}