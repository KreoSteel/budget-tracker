import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Budget, CreateBudgetRequest, UpdateBudgetRequest } from "~/types/Budget";

const useBudgets = (userId?: string, options?: {
    limit?: number;
    page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}) => {
    const { limit, page, sort, order } = options || {};
    return useQuery({
        queryKey: ["budgets", userId, limit, page, sort, order],
        queryFn: async (): Promise<{ data: Budget[]; pagination?: any }> => {
            let url = `/budgets/user/${userId}`;
            const params = new URLSearchParams();
            
            if (limit) params.append('limit', limit.toString());
            if (page) params.append('page', page.toString());
            if (sort) params.append('sort', sort);
            if (order) params.append('order', order);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await http.get(url);
            return response.data;
        },
        enabled: !!userId,
    });
};

const useBudgetById = (budgetId?: string) => {
    return useQuery({
        queryKey: ["budget", budgetId],
        queryFn: async (): Promise<Budget> => {
            const response = await http.get(`/budgets/${budgetId}`);
            return response.data.data;
        },
        enabled: !!budgetId,
    });
};

const useBudgetProgress = (budgetId?: string) => {
    return useQuery({
        queryKey: ["budget-progress", budgetId],
        queryFn: async (): Promise<any> => {
            const response = await http.get(`/budgets/${budgetId}/progress`);
            return response.data.data;
        },
        enabled: !!budgetId,
    });
};

const useBudgetAlerts = (budgetId?: string, userId?: string) => {
    return useQuery({
        queryKey: ["budget-alerts", budgetId, userId],
        queryFn: async (): Promise<any> => {
            const response = await http.get(`/budgets/${budgetId}/alerts?userId=${userId}`);
            return response.data.data;
        },
        enabled: !!budgetId && !!userId,
    });
};

const useBudgetSummary = (userId?: string) => {
    return useQuery({
        queryKey: ["budget-summary", userId],
        queryFn: async (): Promise<any> => {
            const response = await http.get(`/budgets/summary/${userId}`);
            return response.data.data;
        },
        enabled: !!userId,
    });
};

const useCreateBudget = () => {
    const client = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: async (budgetData: CreateBudgetRequest) => {
            const response = await http.post('/budgets', budgetData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
    });

    return { mutate, isPending, error };
};

const useUpdateBudget = () => {
    const client = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: async ({ budgetId, budgetData }: { budgetId: string; budgetData: UpdateBudgetRequest }) => {
            const response = await http.put(`/budgets/${budgetId}`, budgetData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
    });

    return { mutate, isPending, error };
};

const useDeleteBudget = () => {
    const client = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: async (budgetId: string) => {
            const response = await http.delete(`/budgets/${budgetId}`);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
    });

    return { mutate, isPending, error };
};

export {
    useBudgets,
    useBudgetById,
    useBudgetProgress,
    useBudgetAlerts,
    useBudgetSummary,
    useCreateBudget,
    useUpdateBudget,
    useDeleteBudget,
};
