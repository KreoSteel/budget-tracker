import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Category, CreateCategoryRequest } from "~/types/Category";

const useGetUserCategories = (userId: string) => {
    return useQuery({
        queryKey: ["user-categories", userId],
        queryFn: async (): Promise<{ success: boolean; count: number; data: Category[] }> => {
            const response = await http.get<{ success: boolean; count: number; data: Category[] }>(`/categories/user/${userId}`);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    })
}

const useCreateCategory = (userId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationKey: ["create-category", userId],
        mutationFn: async (categoryData: CreateCategoryRequest) => {
            const response = await http.post("/categories", categoryData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["user-categories", userId] });
        },
        onError: (error) => {
            console.error("Error creating category:", error);
        },
    });
};

const useDeleteCategory = (userId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationKey: ["delete-category", userId],
        mutationFn: async (categoryId: string) => {
            const response = await http.delete(`/categories/${categoryId}`);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["user-categories", userId] });
            client.invalidateQueries({ queryKey: ["budgets"] });
            client.invalidateQueries({ queryKey: ["budget-summary"] });
        },
        onError: (error) => {
            console.error("Error deleting category:", error);
        },
    });
};

export { useGetUserCategories, useCreateCategory, useDeleteCategory };