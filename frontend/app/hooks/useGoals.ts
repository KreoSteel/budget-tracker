import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Goal } from "~/types/Goal";

const useGoals = (userId?: string, options?: {
    limit?: number;
}) => {
    const { limit = 5 } = options || {};
    return useQuery({
        queryKey: ["goals", userId, limit],
        queryFn: async (): Promise<Goal[]> => {
            const response = await http.get(`/goals/user/${userId}?limit=${limit}`);
            return response.data.data;
        },
        enabled: !!userId,
    });
};

export { useGoals };