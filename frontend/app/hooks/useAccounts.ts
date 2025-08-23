import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "~/contexts/AuthContext";
import http from "~/lib/http";
import type { Account } from "~/types/Account";


const useAccounts = () => {
    const {data, isPending, error} = useQuery({
        queryKey: ["accounts"],
        queryFn: async (): Promise<Account[]> => {
            const response = await http.get<Account[]>("/accounts");
            return response.data;
        }
    })

    return {data, isPending, error};
}

const useCreateAccount = () => {
    const client = useQueryClient();
    const {mutate, isPending, error} = useMutation({
        mutationFn: async (account: Account) => {
            const response = await http.post<Account>("/accounts", account);
            return response.data;
        }
    })

    return {mutate, isPending, error};
}

const useGetNetWorth = (userId: string | undefined) => {
    const {data, isPending, error} = useQuery({
        queryKey: ["netWorth", userId],
        queryFn: async (): Promise<number> => {
            if (!userId) throw new Error("User ID is required");
            const response = await http.get<{data: {netWorth: number}}>(`/accounts/user/${userId}/networth`);
            return response.data.data.netWorth; // Backend returns {data: {netWorth: number}}
        },
        enabled: !!userId // Only run query when userId exists
    });
    return {data, isPending, error};
};


export { useAccounts, useCreateAccount, useGetNetWorth };