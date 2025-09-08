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

const useCreateCategory = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (categoryData: CreateCategoryRequest) => {
            const response = await http.post("/categories", categoryData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["user-categories"] });
        },
        onError: (error) => {
            console.error("Error creating category:", error);
        },
    });
};

export { useGetUserCategories, useCreateCategory };