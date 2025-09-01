import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import http from "~/lib/http";
import type { Account } from "~/types/Account";
import { authService } from "~/services/authService";


const useAccounts = () => {
    const currentUser = authService.getCurrentUser();
    const {data, isPending, error} = useQuery({
        queryKey: ["accounts"],
        queryFn: async (): Promise<Account[]> => {
            const response = await http.get<Account[]>("/accounts");
            return response.data;
        },
        enabled: Boolean(currentUser?._id), // Only fetch when user is authenticated
    })

    return {data, isPending, error};
}

const useAccountByUserId = (options?: {
    limit?: number;
    page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}) => {
    const { limit = 10, page = 1, sort = 'createdAt', order = 'desc' } = options || {};
    const currentUser = authService.getCurrentUser();
    
    return useQuery({
        queryKey: ["accounts", currentUser?._id, limit, page, sort, order],
        queryFn: async (): Promise<{
            success: boolean;
            pagination: {
                page: number;
                limit: number;
                totalPages: number;
                totalCount: number;
                hasNextPage: boolean;
                hasPrevPage: boolean;
            };
            count: number;
            data: Account[];
        }> => {
            if (!currentUser?._id) return {
                success: false,
                pagination: { page: 1, limit: 10, totalPages: 0, totalCount: 0, hasNextPage: false, hasPrevPage: false },
                count: 0,
                data: []
            };
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort,
                order
            });
            
            const response = await http.get(`/accounts/user/${currentUser._id}?${params}`);
            return response.data;
        },
        enabled: Boolean(currentUser?._id),
        retry: false,
    });
};

const useCreateAccount = () => {
    const client = useQueryClient();
    const {mutate, isPending, error} = useMutation({
        mutationFn: async (account: Account) => {
            const response = await http.post<Account>("/accounts", account);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["netWorth"] });
        },
        onError: (error) => {
            console.error("Error creating account:", error);
        }
    })

    return {mutate, isPending, error};
}

const useGetNetWorth = () => {
    const currentUser = authService.getCurrentUser();
    const {data, isPending, error} = useQuery({
        queryKey: ["netWorth", currentUser?._id],
        queryFn: async (): Promise<number> => {
            if (!currentUser?._id) return 0;
            const response = await http.get<{data: {netWorth: number}}>(`/accounts/user/${currentUser._id}/networth`);
            return response.data.data.netWorth;
        },
        enabled: Boolean(currentUser?._id), // Only fetch when user is authenticated
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    return {data, isPending, error};
};

const useUpdateAccount = () => {
    const client = useQueryClient();
    const {mutate, isPending, error, isError, isSuccess} = useMutation({
        mutationFn: async (account: Account) => {
            const response = await http.put<Account>(`/accounts/${account._id}`, account);
            return response.data;
        },
        onMutate: async (updatedAccount) => {
            // Cancel any outgoing refetches
            await client.cancelQueries({ queryKey: ["accounts"] });
            await client.cancelQueries({ queryKey: ["netWorth"] });

            // Snapshot the previous value
            const previousAccounts = client.getQueryData(["accounts"]);
            const previousNetWorth = client.getQueryData(["netWorth"]);

            // Debug: Log what's in the cache
            console.log("Cache debug:", {
                accounts: previousAccounts,
                accountsType: typeof previousAccounts,
                isArray: Array.isArray(previousAccounts),
                netWorth: previousNetWorth
            });

            // Optimistically update the accounts cache - handle different data structures
            client.setQueryData(["accounts"], (old: any) => {
                // If old data is an array, update it
                if (Array.isArray(old)) {
                    return old.map(acc => 
                        acc._id === updatedAccount._id ? updatedAccount : acc
                    );
                }
                
                // If old data has a data property that's an array, update that
                if (old?.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.map((acc: Account) => 
                            acc._id === updatedAccount._id ? updatedAccount : acc
                        )
                    };
                }
                
                // If no valid structure found, return the new account
                return [updatedAccount];
            });

            // Optimistically update net worth if we have the data
            if (previousNetWorth) {
                client.setQueryData(["netWorth"], (old: any) => {
                    if (!old) return old;
                    // Update net worth calculation based on account changes
                    return {
                        ...old,
                        // Add your net worth calculation logic here
                        lastUpdated: new Date().toISOString()
                    };
                });
            }

            // Return context with the snapshotted value
            return { previousAccounts, previousNetWorth };
        },
        onSuccess: (updatedAccount) => {
            // Invalidate and refetch to ensure data consistency
            client.invalidateQueries({ queryKey: ["netWorth"] });
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["financial-metrics"] });
            client.invalidateQueries({ queryKey: ["netWorth"] });
            client.invalidateQueries({ queryKey: ["transactions"] });
            
            // You could also show a success toast here
            console.log("Account updated successfully:", updatedAccount.name);
        },
        onError: (error, updatedAccount, context) => {
            try {
                // Rollback optimistic updates on error
                if (context?.previousAccounts) {
                    client.setQueryData(["accounts"], context.previousAccounts);
                }
                if (context?.previousNetWorth) {
                    client.setQueryData(["netWorth"], context.previousNetWorth);
                }
            } catch (rollbackError) {
                console.error("Failed to rollback optimistic updates:", rollbackError);
            }

            // Enhanced error logging
            console.error("Error updating account:", {
                accountId: updatedAccount._id,
                accountName: updatedAccount.name,
                error: error.message || error,
                stack: error.stack
            });

            // You could show an error toast here
            // toast.error("Failed to update account. Please try again.");
        },
        onSettled: () => {
            // Always refetch after mutation settles (success or error)
            client.invalidateQueries({ queryKey: ["accounts"] });
        }
    });

    return {
        mutate, 
        isPending, 
        error, 
        isError, 
        isSuccess,
        // Helper function for better error handling
        updateAccount: (account: Account) => {
            mutate(account, {
                onSuccess: () => {
                    // Additional success handling if needed
                },
                onError: (error) => {
                    // Additional error handling if needed
                }
            });
        }
    };
}

const useDeleteAccount = () => {
    const client = useQueryClient();
    const {mutate, isPending, error} = useMutation({
        mutationFn: async (accountId: string) => {
            const response = await http.delete(`/accounts/${accountId}`);
            return response.data;
        },
        onSuccess: () => {
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["netWorth"] });
        },
        onError: (error) => {
            console.error("Error deleting account:", error);
        }
    });

    return {mutate}

}

const useTransferMoney = () => {
    const client = useQueryClient();
    
    return useMutation({
        mutationFn: async (transferData: {
            fromAccountId: string;
            toAccountId: string;
            amount: number;
        }) => {
            const response = await http.patch<{ success: boolean; message: string }>("/accounts/transfer", transferData);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate accounts queries to refresh data
            client.invalidateQueries({ queryKey: ["accounts"] });
            client.invalidateQueries({ queryKey: ["netWorth"] });
        },
        onError: (error) => {
            alert("Error transferring money: " + error.message);
        }
    });
};

export {
    useAccounts,
    useAccountByUserId,
    useCreateAccount,
    useGetNetWorth,
    useTransferMoney,
    useUpdateAccount,
    useDeleteAccount
};