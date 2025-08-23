import { useQuery } from "@tanstack/react-query";
import http from "~/lib/http";

export interface FinancialMetrics {
    totalBalance: {
        current: number;
        change: number;
    };
    monthlyIncome: {
        current: number;
        change: number;
    };
    monthlyExpenses: {
        current: number;
        change: number;
    };
    savings: {
        current: number;
        change: number;
    };
}

export const useFinancialMetrics = (userId?: string, period: string = 'month') => {
    return useQuery({
        queryKey: ["financial-metrics", userId, period],
        queryFn: async (): Promise<{ success: boolean; data: FinancialMetrics }> => {
            const response = await http.get(`/transactions/financial-metrics/${userId}?period=${period}`);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
