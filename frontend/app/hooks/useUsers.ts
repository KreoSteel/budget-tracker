import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { User } from "~/types/User";

const useUsers = () => {
    const data = useQuery({
        queryKey: ["users"],
        queryFn: async (): Promise<User[]> => {
            const response = await http.get<User[]>("/users");
            return response.data;
        }
    })

}

const useCreateUser = () => {
    const client = useQueryClient();
    const {mutate, isPending, error} = useMutation({
        mutationFn: async (user: User) => {
            const response = await http.post<User>("/users", user);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            console.error("Error creating user:", error);
        },
    });

    return { mutate, isPending, error };
}

