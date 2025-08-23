import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Transaction } from "~/types/Transactions";

const useTransactions = (userId?: string, accountId?: string, options?: {
    recent?: boolean;
    limit?: number;
    days?: number;
}) => {
    const { recent = false, limit = 5, days = 30 } = options || {};

    return useQuery({
        queryKey: ["transactions", userId, accountId, recent, limit, days],
        queryFn: async (): Promise<Transaction[]> => {
            if (recent) {
                // Use recent endpoint for dashboard
                let url = "/transactions/recent";
                const params = new URLSearchParams();

                if (userId) params.append('userId', userId);
                params.append('limit', limit.toString());
                params.append('days', days.toString());

                const fullUrl = `${url}?${params.toString()}`;
                console.log('🔍 Recent transactions URL:', fullUrl);
                console.log('🔍 Full URL being sent to http.get:', fullUrl);
                console.log('🔍 http baseURL:', (http as any).defaults?.baseURL);

                const response = await http.get<{ data: Transaction[] }>(fullUrl);
                console.log('🔍 Response:', response);

                // Handle both response structures (with and without data wrapper)
                return response.data.data || response.data;
            } else {
                // Use paginated endpoint for full lists
                let url = "/transactions";

                if (userId) {
                    url += `?userId=${userId}`;
                }
                if (accountId) {
                    url += `${userId ? '&' : '?'}accountId=${accountId}`;
                }

                const response = await http.get<Transaction[]>(url);
                return response.data;
            }
        },
        enabled: !!userId, // Only require userId for recent transactions
        staleTime: recent ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2 min for recent, 5 min for full
        gcTime: recent ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5 min for recent, 10 min for full
    })
}

const useCreateTransaction = () => {
    const client = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: async (transaction: Transaction) => {
            const response = await http.post<Transaction>("/transactions", transaction);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["transactions"] });
        },
        onError: (error) => {
            console.error("Error creating transaction:", error);
        },
    })

    return { mutate, isPending, error };
}

export { useTransactions, useCreateTransaction };