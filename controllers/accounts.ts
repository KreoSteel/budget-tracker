import { Request, Response } from "express";
import { createAccount, getAllAccounts, getAccountById, getAccountsByUserId, getAccountsByType, deleteAccount, deactivateAccount, activateAccount } from "../services/account";
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

            if (!['checking', 'savings', 'credit', 'investment', 'cash'].includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid account type",
                    message: "Account type must be one of: checking, savings, credit, investment, cash",
                    validTypes: ['checking', 'savings', 'credit', 'investment', 'cash']
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
    }
};
