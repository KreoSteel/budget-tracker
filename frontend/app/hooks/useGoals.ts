import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Goal, CreateGoalRequest, UpdateGoalRequest } from "~/types/Goal";

const useGoals = (userId?: string, options?: {
    limit?: number;
}) => {
    const { limit } = options || {};
    return useQuery({
        queryKey: ["goals", userId, limit],
        queryFn: async (): Promise<Goal[]> => {
            const url = limit ? `/goals/user/${userId}?limit=${limit}` : `/goals/user/${userId}`;
            const response = await http.get(url);
            return response.data.data;
        },
        enabled: !!userId,
    });
};

const useCreateGoal = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (goalData: CreateGoalRequest) => {
            const response = await http.post("/goals", goalData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["goals"] });
        },
        onError: (error) => {
            console.error("Error creating goal:", error);
        },
    });
};

const useUpdateGoal = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (goalData: UpdateGoalRequest) => {
            const response = await http.put(`/goals/${goalData._id}`, goalData);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["goals"] });
        },
        onError: (error) => {
            console.error("Error updating goal:", error);
        },
    });
};

const useDeleteGoal = () => {
    const client = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: async (goalId: string) => {
            const response = await http.delete(`/goals/${goalId}`);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["goals"] });
            client.invalidateQueries({ queryKey: ["user-goals"] });
            alert("Goal deleted successfully");
        },
        onError: (error) => {
            console.error("Error deleting goal:", error);
        }
    });

    return { mutate }

}


export { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal };