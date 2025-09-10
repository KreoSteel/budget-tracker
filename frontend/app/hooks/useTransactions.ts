import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Transaction, CreateTransactionRequest } from "~/types/Transactions";

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



const useTransactions = (userId?: string, accountId?: string) => {
    return useQuery({
        queryKey: ["transactions", userId, accountId],
        queryFn: async (): Promise<Transaction[]> => {
            let url = "/transactions";
            const params = new URLSearchParams();

            // Only add accountId if provided - userId is not a direct field on transactions
            if (accountId) params.append('accountId', accountId);

            const response = await http.get<Transaction[]>(`${url}?${params.toString()}`);
            return response.data;
        },
        enabled: !!accountId, // Only enable if we have an accountId
        staleTime: 5 * 60 * 1000,
    })
}

const useTransactionsByUserId = (userId?: string) => {
    return useQuery({
        queryKey: ["user-transactions", userId],
        queryFn: async (): Promise<Transaction[]> => {
            const response = await http.get(`/transactions/user/${userId}`);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    })
}



const useRecentTransactions = (userId?: string, limit: number = 6) => {
    return useQuery({
        queryKey: ["recent-transactions", userId, limit],
        queryFn: async (): Promise<Transaction[]> => {
            if (!userId) {
                throw new Error("User ID is required");
            }
            const response = await http.get(`/transactions/recent/${userId}?limit=${limit}`);
            return response.data.data || response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    })
}

const useCreateTransaction = () => {
    const client = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: async (transactionData: CreateTransactionRequest) => {
            const response = await http.post<Transaction>("/transactions", transactionData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["transactions"] });
            client.invalidateQueries({ queryKey: ["user-transactions"] });
            client.invalidateQueries({ queryKey: ["recent-transactions"] });
            client.invalidateQueries({ queryKey: ["financial-metrics"] });
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["user-accounts"] });
            client.invalidateQueries({ queryKey: ["filteredTransactions"] });
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
    })

    return { mutate, isPending, error };
}

const useFinancialMetrics = (userId?: string, period: string = 'month') => {
    return useQuery({
        queryKey: ["financial-metrics", userId, period],
        queryFn: async (): Promise<{ success: boolean; data: FinancialMetrics }> => {
            const response = await http.get(`/transactions/financial-metrics/${userId}?period=${period}`);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
    });
};

export const useFilteredTransactions = (userId: string, filters: any) => {
    return useQuery({
        queryKey: ['filteredTransactions', userId, filters],
        queryFn: async (): Promise<Transaction[]> => {
            const response = await http.get(`/transactions/user/${userId}`);
            if (!response.data) throw new Error('Failed to fetch transactions');
            let transactions = response.data;
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                transactions = transactions.filter((t: Transaction) => 
                    t.description?.toLowerCase().includes(searchTerm) ||
                    t.amount?.toString().includes(searchTerm) ||
                    t.categoryId?.name?.toLowerCase().includes(searchTerm) ||
                    t.accountId?.name?.toLowerCase().includes(searchTerm) ||
                    t.paymentMethod?.toLowerCase().includes(searchTerm)
                );
            }
            
            if (filters.type !== 'all') {
                transactions = transactions.filter((t: Transaction) => t.type === filters.type);
            }
            
            if (filters.categoryId !== 'all') {
                transactions = transactions.filter((t: Transaction) => t.categoryId?._id === filters.categoryId);
            }
            
            if (filters.accountId !== 'all') {
                transactions = transactions.filter((t: Transaction) => t.accountId?._id === filters.accountId);
            }
            
            if (filters.dateRange.from || filters.dateRange.to) {
                transactions = transactions.filter((t: Transaction) => {
                    const transactionDate = new Date(t.date || t.createdAt);
                    if (filters.dateRange.from && transactionDate < filters.dateRange.from) return false;
                    if (filters.dateRange.to && transactionDate > filters.dateRange.to) return false;
                    return true;
                });
            }
            
            return transactions;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

const useDeleteTransaction = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await http.delete(`/transactions/${id}`);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["filteredTransactions"] });
            client.invalidateQueries({ queryKey: ["user-transactions"] });
            client.invalidateQueries({ queryKey: ["transactions"] });
            client.invalidateQueries({ queryKey: ["recent-transactions"] });
            client.invalidateQueries({ queryKey: ["financial-metrics"] });
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["user-accounts"] });
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
    });
}


export { useTransactions, useCreateTransaction, useFinancialMetrics, useRecentTransactions, useTransactionsByUserId, useDeleteTransaction };