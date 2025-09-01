import { Request, Response } from "express";
import { createAccount, getAllAccounts, getAccountById, getAccountsByUserId, getAccountsByType, deleteAccount, deactivateAccount, activateAccount, transferBetweenAccounts, getTotalNetWorth, getAccountBalanceHistory, getAccountByUserId, updateAccount } from "../services/account";
import { createPaginatedResponse, applyPagination } from "../middleware/pagination";
import mongoose from "mongoose";

export const accountsControllers = {
    getAllAccounts: async (req: Request, res: Response) => {
        try {
            const accounts = await getAllAccounts();
            
            if (!accounts || accounts.length === 0) {
                return res.status(404).json({ 
                    error: "No accounts found",
                    message: "No accounts exist for this user"
                });
            }

            res.json({
                success: true,
                count: accounts.length,
                data: accounts
            });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch accounts"
            });
        }
    },

    getAccountByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.query;

            // Validate userId presence
            if (!userId) {
                return res.status(400).json({
                    error: "Missing userId parameter",
                    message: "Please provide userId in the query parameters"
                });
            }

            // Validate userId format
            if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const accounts = await getAccountByUserId(new mongoose.Types.ObjectId(userId));
            if (!accounts || accounts.length === 0) {
                return res.status(404).json({
                    error: "No accounts found",
                    message: "No accounts exist for this user"
                });
            }

            res.json({
                success: true,
                count: accounts.length,
                data: accounts
            });
        } catch (error) {
            console.error("Error fetching account by user ID:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch account by user ID"
            });
        }
    },

    getAccountById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Account ID parameter is required",
                    message: "Please provide account ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid account ID format",
                    message: "Account ID must be a valid MongoDB ObjectId"
                });
            }

            const account = await getAccountById(id);
            if (!account) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: "Account with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                data: account
            });
        } catch (error) {
            console.error("Error fetching account:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch account"
            });
        }
    },

    createAccount: async (req: Request, res: Response) => {
        try {
            const { name, balance, type, bankName, userId } = req.body;
            
            // Validate required fields
            if (!name || !type || !userId) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    required: ["name", "type", "userId"],
                    received: { name, type, userId }
                });
            }

            // Validate field types and values
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ 
                    error: "Name must be a non-empty string",
                    message: "Account name cannot be empty"
                });
            }

            if (!['checking', 'savings', 'credit_card', 'investment', 'cash'].includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid account type",
                    message: "Account type must be one of: checking, savings, credit, investment, cash",
                    validTypes: ['checking', 'savings', 'credit_card', 'investment', 'cash']
                });
            }

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Validate balance if provided
            if (balance !== undefined) {
                if (typeof balance !== 'number') {
                    return res.status(400).json({ 
                        error: "Invalid balance type",
                        message: "Balance must be a number"
                    });
                }
                
                if (balance < 0) {
                    return res.status(400).json({ 
                        error: "Invalid balance value",
                        message: "Balance cannot be negative"
                    });
                }
            }

            // Validate bankName if provided
            if (bankName !== undefined && (typeof bankName !== 'string' || bankName.trim().length === 0)) {
                return res.status(400).json({ 
                    error: "Invalid bank name",
                    message: "Bank name must be a non-empty string if provided"
                });
            }

            const newAccount = await createAccount(name, balance, type, bankName, userId);
            
            res.status(201).json({
                success: true,
                message: "Account created successfully",
                data: newAccount
            });
        } catch (error) {
            console.error("Error creating account:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("already exists")) {
                    return res.status(409).json({ 
                        error: "Account already exists",
                        message: error.message
                    });
                }
                if (error.message.includes("validation")) {
                    return res.status(400).json({ 
                        error: "Validation error",
                        message: error.message
                    });
                }
                if (error.message.includes("user not found")) {
                    return res.status(404).json({ 
                        error: "User not found",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to create account"
            });
        }
    },

    updateAccount: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, balance, type, bankName, userId, currency, isActive } = req.body;

            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Account ID parameter is required",
                    message: "Please provide account ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid account ID format",
                    message: "Account ID must be a valid MongoDB ObjectId"
                });
            }

            // Check if account exists before updating
            const existingAccount = await getAccountById(id);
            if (!existingAccount) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: "Account with the specified ID does not exist"
                });
            }

            // Validate required fields
            if (!name || !type || !userId) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    message: "Name, type, and userId are required fields"
                });
            }

            // Validate account type
            const validTypes = ['cash', 'checking', 'savings', 'credit_card', 'investment', 'other'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid account type",
                    message: `Account type must be one of: ${validTypes.join(', ')}`
                });
            }

            // Validate balance is a number
            if (typeof balance !== 'number' || isNaN(balance)) {
                return res.status(400).json({ 
                    error: "Invalid balance",
                    message: "Balance must be a valid number"
                });
            }

            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const updatedAccount = await updateAccount(id, { 
                name, 
                balance, 
                type, 
                bankName, 
                userId, 
                currency, 
                isActive 
            } as Partial<{ 
                name: string; 
                balance: number; 
                type: string; 
                bankName?: string; 
                userId: mongoose.Types.ObjectId; 
                currency: string; 
                isActive: boolean; 
            }>);

            if (!updatedAccount) {
                return res.status(500).json({ 
                    error: "Update failed",
                    message: "Failed to update account in database"
                });
            }

            res.json({
                success: true,
                message: "Account updated successfully",
                data: updatedAccount
            });
        }
        catch (error) {
            console.error("Error updating account:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to update account"
            });
        }
    },

    getAccountsByType: async (req: Request, res: Response) => {
        try {
            const { type } = req.params;
            const { userId, isActive } = req.query;
            
            // Validate required parameters
            if (!type) {
                return res.status(400).json({ 
                    error: "Account type parameter is required",
                    message: "Please provide account type in the URL"
                });
            }

            // userId is now optional - if not provided, get accounts for all users

            // Validate account type
            const validTypes = ['cash', 'checking', 'savings', 'credit_card', 'investment', 'other'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid account type",
                    message: `Account type must be one of: ${validTypes.join(', ')}`,
                    validTypes: validTypes
                });
            }

            // Validate userId format if provided
            if (userId && !mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Validate isActive parameter if provided
            let isActiveFilter: boolean | undefined = undefined;
            if (isActive !== undefined) {
                if (isActive === 'true') {
                    isActiveFilter = true;
                } else if (isActive === 'false') {
                    isActiveFilter = false;
                } else {
                    return res.status(400).json({ 
                        error: "Invalid isActive value",
                        message: "isActive must be 'true', 'false', or omitted"
                    });
                }
            }

            // Convert userId to ObjectId only if provided
            const userObjectId = userId ? new mongoose.Types.ObjectId(userId as string) : undefined;
            const accounts = await getAccountsByType(type, isActiveFilter, userObjectId);

            if (!accounts || accounts.length === 0) {
                const statusFilter = isActiveFilter !== undefined ? ` (${isActiveFilter ? 'active' : 'inactive'})` : '';
                const userFilter = userId ? ' for this user' : '';
                return res.status(404).json({ 
                    error: "No accounts found",
                    message: `No ${type}${statusFilter} accounts found${userFilter}`
                });
            }

            res.json({
                success: true,
                count: accounts.length,
                accountType: type,
                isActiveFilter: isActiveFilter,
                userIdProvided: !!userId,
                data: accounts
            });
        } catch (error) {
            console.error("Error fetching accounts by type:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch accounts by type"
            });
        }
    },

    activateAccount: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Account ID parameter is required",
                    message: "Please provide account ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid account ID format",
                    message: "Account ID must be a valid MongoDB ObjectId"
                });
            }

            const account = await activateAccount(id);
            
            if (!account) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: "Account with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Account activated successfully",
                data: account
            });
        } catch (error) {
            console.error("Error activating account:", error);
            
            if (error instanceof Error && error.message.includes("not found")) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: error.message
                });
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to activate account"
            });
        }
    },

    deactivateAccount: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Account ID parameter is required",
                    message: "Please provide account ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid account ID format",
                    message: "Account ID must be a valid MongoDB ObjectId"
                });
            }

            const account = await deactivateAccount(id);
            
            if (!account) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: "Account with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Account deactivated successfully",
                data: account
            });
        } catch (error) {
            console.error("Error deactivating account:", error);
            
            if (error instanceof Error && error.message.includes("not found")) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: error.message
                });
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to deactivate account"
            });
        }
    },

    deleteAccount: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Account ID parameter is required",
                    message: "Please provide account ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid account ID format",
                    message: "Account ID must be a valid MongoDB ObjectId"
                });
            }

            const account = await deleteAccount(id);
            
            if (!account) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: "Account with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Account deleted successfully",
                data: account
            });
        } catch (error) {
            console.error("Error deleting account:", error);
            
            if (error instanceof Error && error.message.includes("not found")) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: error.message
                });
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to delete account"
            });
        }
    },

    getAccountsByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId parameter is required",
                    message: "Please provide userId in the URL"
                });
            }

            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Check if pagination middleware is attached
            if (!req.pagination) {
                return res.status(500).json({ 
                    error: "Pagination middleware not configured",
                    message: "Pagination is required for this endpoint"
                });
            }

            // Get paginated accounts
            const { data: accounts, totalCount } = await applyPagination(
                { userId: new mongoose.Types.ObjectId(userId) },
                req.pagination,
                require("../models/account").default
            );
            
            if (!accounts || accounts.length === 0) {
                return res.status(404).json({ 
                    error: "No accounts found",
                    message: "No accounts found for this user"
                });
            }

            // Create paginated response
            const paginatedResponse = createPaginatedResponse(accounts, req.pagination, totalCount);

            res.json(paginatedResponse);
        } catch (error) {
            console.error("Error fetching accounts by user ID:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch accounts by user ID"
            });
        }
    },

    transferBetweenAccounts: async (req: Request, res: Response) => {
        try {
            const { fromAccountId, toAccountId, amount } = req.body;
            
            // Validate required fields
            if (!fromAccountId || !toAccountId || amount === undefined) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    message: "fromAccountId, toAccountId, and amount are required",
                    required: ["fromAccountId", "toAccountId", "amount"]
                });
            }

            // Validate account IDs format
            if (!mongoose.Types.ObjectId.isValid(fromAccountId)) {
                return res.status(400).json({ 
                    error: "Invalid fromAccountId format",
                    message: "fromAccountId must be a valid MongoDB ObjectId"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(toAccountId)) {
                return res.status(400).json({ 
                    error: "Invalid toAccountId format",
                    message: "toAccountId must be a valid MongoDB ObjectId"
                });
            }

            // Validate accounts are different
            if (fromAccountId === toAccountId) {
                return res.status(400).json({ 
                    error: "Invalid transfer request",
                    message: "Cannot transfer to the same account"
                });
            }

            // Validate amount
            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ 
                    error: "Invalid amount",
                    message: "Amount must be a positive number"
                });
            }

            if (amount > 1000000) { // Example max transfer limit
                return res.status(400).json({ 
                    error: "Transfer limit exceeded",
                    message: "Transfer amount cannot exceed 1,000,000"
                });
            }

            const { fromAccount, toAccount } = await transferBetweenAccounts(fromAccountId, toAccountId, amount);
            
            res.json({
                success: true,
                message: "Transfer between accounts successful",
                transferAmount: amount,
                data: { 
                    fromAccount: {
                        id: fromAccount._id,
                        name: fromAccount.name,
                        newBalance: fromAccount.balance
                    },
                    toAccount: {
                        id: toAccount._id,
                        name: toAccount.name,
                        newBalance: toAccount.balance
                    }
                }
            });
        } catch (error) {
            console.error("Error transferring between accounts:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("Account not found")) {
                    return res.status(404).json({ 
                        error: "Account not found",
                        message: "One or both accounts do not exist"
                    });
                }
                if (error.message.includes("Insufficient balance")) {
                    return res.status(400).json({ 
                        error: "Insufficient balance",
                        message: "The source account does not have enough funds for this transfer"
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to transfer between accounts"
            });
        }
    },

    totalNetWorth: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId parameter is required",
                    message: "Please provide userId in the URL"
                });
            }

            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Validate userId is not empty string after trim
            if (userId.trim().length === 0) {
                return res.status(400).json({ 
                    error: "Invalid userId",
                    message: "userId cannot be empty"
                });
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);
            const netWorth = await getTotalNetWorth(userObjectId);
            
            // Validate that we got a valid number back
            if (typeof netWorth !== 'number' || isNaN(netWorth)) {
                return res.status(500).json({ 
                    error: "Calculation error",
                    message: "Failed to calculate net worth - invalid result"
                });
            }

            // Check if user has any accounts (optional business logic)
            if (netWorth === 0) {
                // This could be legitimate (zero balance) or no accounts
                // You might want to distinguish between these cases
                return res.json({
                    success: true,
                    message: "Total net worth calculated successfully",
                    data: {
                        netWorth: netWorth,
                        formattedNetWorth: `$${netWorth.toFixed(2)}`,
                        note: "Zero net worth - user may have no accounts or all balances sum to zero"
                    }
                });
            }

            res.json({
                success: true,
                message: "Total net worth calculated successfully",
                data: {
                    netWorth: netWorth,
                    formattedNetWorth: `$${netWorth.toFixed(2)}`,
                    isPositive: netWorth > 0,
                    absoluteValue: Math.abs(netWorth)
                }
            });
        } catch (error) {
            console.error("Error fetching total net worth:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "User not found",
                        message: "No user found with the specified ID"
                    });
                }
                if (error.message.includes("fetching total net worth")) {
                    return res.status(500).json({ 
                        error: "Database error",
                        message: "Failed to retrieve account data for net worth calculation"
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch total net worth"
            });
        }
    },

    getAccountBalanceHistory: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId parameter is required",
                    message: "Please provide userId in the URL"
                });
            }

            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const { startDate, endDate } = req.query;
            
            // Validate date parameters
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: "Missing date parameters",
                    message: "Please provide startDate and endDate in the query parameters"
                });
            }
                
            // Validate dates
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            
                return res.status(400).json({ 
                    error: "Invalid date format",
                    message: "Dates must be valid Date objects"
                });
            }

            if (end <= start) {
            
                return res.status(400).json({ 
                    error: "Invalid date range",
                    message: "End date must be after start date"
                });
            }

            const history = await getAccountBalanceHistory(new mongoose.Types.ObjectId(userId), start, end);
            
            res.json({
                success: true,
                message: "Account balance history fetched successfully",
                data: history
            });
        } catch (error) {
            console.error("Error fetching account balance history:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch account balance history"
            });
        }
    }
};
