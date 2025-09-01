import { useQuery } from "@tanstack/react-query";
import http from "~/lib/http";
import type { User } from "~/types/User";
import { authService } from "~/services/authService";

export const useCurrentUser = () => {
    const currentUser = authService.getCurrentUser();
    
    return useQuery({
        queryKey: ["currentUser", currentUser?._id],
        queryFn: async (): Promise<User> => {
            if (!currentUser?._id) {
                throw new Error("No user ID available");
            }
            const response = await http.get<User>(`/users/${currentUser._id}`);
            return response.data;
        },
        enabled: Boolean(currentUser?._id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};
