import { getAllTransactions, getRecentTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction, getTransactionsByDateRange, getTransactionsByCategory, getTransactionsByAccount, getFinancialMetrics, getTransactionsByUserId } from "../services/transactions";
import { Request, Response } from "express";
import Transaction from "../models/transaction";
import mongoose from "mongoose";
import { createPaginatedResponse, applyPagination } from "../middleware/pagination";
const { ObjectId } = mongoose.Types;

export const transactionsControllers = {
    getAllTransactions: async (req: Request, res: Response) => {
        try {
            // Validate query parameters if they exist
            const { 
                userId, 
                accountId, 
                categoryId, 
                type, 
                startDate, 
                endDate,
                search
            } = req.query;
            
            // Validate userId if provided
            if (userId && !mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Validate accountId if provided
            if (accountId && !mongoose.Types.ObjectId.isValid(accountId as string)) {
                return res.status(400).json({ 
                    error: "Invalid accountId format",
                    message: "accountId must be a valid MongoDB ObjectId"
                });
            }

            // Validate categoryId if provided
            if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId as string)) {
                return res.status(400).json({ 
                    error: "Invalid categoryId format",
                    message: "categoryId must be a valid MongoDB ObjectId"
                });
            }

            // Validate type if provided
            if (type && !['income', 'expense'].includes(type as string)) {
                return res.status(400).json({ 
                    error: "Invalid transaction type",
                    message: "Type must be either 'income' or 'expense'",
                    validTypes: ['income', 'expense']
                });
            }

            // Validate dates if provided
            if (startDate && isNaN(Date.parse(startDate as string))) {
                return res.status(400).json({ 
                    error: "Invalid startDate format",
                    message: "startDate must be a valid date string"
                });
            }

            if (endDate && isNaN(Date.parse(endDate as string))) {
                return res.status(400).json({ 
                    error: "Invalid endDate format",
                    message: "endDate must be a valid date string"
                });
            }

            // Build query object
            const query: any = {};
            if (userId) query.userId = new ObjectId(userId as string);
            if (accountId) query.accountId = new ObjectId(accountId as string);
            if (categoryId) query.categoryId = new ObjectId(categoryId as string);
            if (type) query.type = type;
            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate as string);
                if (endDate) query.date.$lte = new Date(endDate as string);
            }
            
            // Add search functionality
            if (search && typeof search === 'string' && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { description: searchRegex },
                    { amount: isNaN(Number(search)) ? null : Number(search) }
                ];
            }

            // Sort is now handled by pagination middleware

            // Use global pagination from middleware
            if (!req.pagination) {
                return res.status(400).json({
                    error: "Pagination middleware not applied",
                    message: "Please ensure pagination middleware is applied to this route"
                });
            }

            const { data, totalCount } = await applyPagination(
                query,
                req.pagination,
                Transaction
            );
            
            if (!data || data.length === 0) {
                return res.status(404).json({ 
                    error: "No transactions found",
                    message: "No transactions match the specified criteria"
                });
            }

            // Create paginated response using utility function
            const response = createPaginatedResponse(data, req.pagination, totalCount);
            res.json(response);
        } catch (error) {
            console.error("Error fetching transactions", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transactions"
            });
        }
    },

    getTransactionsByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const transactions = await getTransactionsByUserId(userId);
            res.json(transactions);
        }
        catch (error) {
            console.error("Error fetching transactions by user ID:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transactions by user ID"
            });
        }
    },

    getTransactionById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Transaction ID parameter is required",
                    message: "Please provide transaction ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid transaction ID format",
                    message: "Transaction ID must be a valid MongoDB ObjectId"
                });
            }

            const transaction = await getTransactionById(id);
            if (!transaction) {
                return res.status(404).json({ 
                    error: "Transaction not found",
                    message: "Transaction with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                data: transaction
            });
        } catch (error) {
            console.error("Error fetching transaction", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transaction"
            });
        }
    },

    getRecentTransactions: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const { limit = '5', days = '30' } = req.query;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "UserId parameter is required",
                    message: "Please provide userId in path parameters"
                });
            }
            
            if (!mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }
            
            // Validate limit parameter
            const limitNum = parseInt(limit as string, 10);
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
                return res.status(400).json({ 
                    error: "Invalid limit parameter",
                    message: "Limit must be between 1 and 50"
                });
            }
            
            // Validate days parameter
            const daysNum = parseInt(days as string, 10);
            if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
                return res.status(400).json({ 
                    error: "Invalid days parameter",
                    message: "Days must be between 1 and 365"
                });
            }
            
            const transactions = await getRecentTransactions(
                userId as string,
                limitNum,
                daysNum
            );
            
            if (!transactions || transactions.length === 0) {
                return res.status(404).json({ 
                    error: "No recent transactions found",
                    message: "No transactions found for the specified user and time period"
                });
            }
            
            res.json({
                success: true,
                count: transactions.length,
                data: transactions,
                query: {
                    userId,
                    limit: limitNum,
                    days: daysNum
                }
            });
        } catch (error) {
            console.error("Error fetching recent transactions", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch recent transactions"
            });
        }
    },

    createTransaction: async (req: Request, res: Response) => {
        try {
            const { accountId, categoryId, type, amount, description, date, paymentMethod, isRecurring, recurringDetails } = req.body;

            // Validate required fields
            if (!accountId || !type || !amount || !description) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    required: ["accountId", "type", "amount", "description"],
                    received: { accountId, type, amount, description }
                });
            }

            // Validate amount
            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({ 
                    error: "Invalid amount",
                    message: "Amount must be a positive number"
                });
            }

            // Validate amount precision (max 2 decimal places)
            const decimalPlaces = (amount.toString().split('.')[1] || '').length;
            if (decimalPlaces > 2) {
                return res.status(400).json({ 
                    error: "Invalid amount precision",
                    message: "Amount can have maximum 2 decimal places"
                });
            }

            // Validate type
            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid transaction type",
                    message: "Type must be 'income' or 'expense'",
                    validTypes: ['income', 'expense']
                });
            }

            // Validate ObjectIds
            if (!ObjectId.isValid(accountId)) {
                return res.status(400).json({ 
                    error: "Invalid ID format",
                    message: "accountId must be a valid MongoDB ObjectId"
                });
            }

            if (categoryId && !ObjectId.isValid(categoryId)) {
                return res.status(400).json({ 
                    error: "Invalid ID format",
                    message: "categoryId must be a valid MongoDB ObjectId"
                });
            }

            // Validate description
            if (typeof description !== 'string' || description.trim().length === 0) {
                return res.status(400).json({ 
                    error: "Invalid description",
                    message: "Description must be a non-empty string"
                });
            }

            if (description.trim().length > 200) {
                return res.status(400).json({ 
                    error: "Description too long",
                    message: "Description cannot exceed 200 characters"
                });
            }

            // Validate date if provided
            let transactionDate = new Date();
            if (date) {
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({ 
                        error: "Invalid date format",
                        message: "Date must be a valid date string"
                    });
                }
                transactionDate = parsedDate;
            }

            // Validate paymentMethod if provided
            if (paymentMethod && typeof paymentMethod !== 'string') {
                return res.status(400).json({ 
                    error: "Invalid payment method",
                    message: "Payment method must be a string"
                });
            }

            // Validate isRecurring if provided
            if (isRecurring !== undefined && typeof isRecurring !== 'boolean') {
                return res.status(400).json({ 
                    error: "Invalid isRecurring value",
                    message: "isRecurring must be a boolean"
                });
            }

            // Validate recurringDetails if provided
            if (recurringDetails && typeof recurringDetails !== 'object') {
                return res.status(400).json({ 
                    error: "Invalid recurring details",
                    message: "Recurring details must be an object"
                });
            }

            // CALL SERVICE LAYER
            const newTransaction = await createTransaction(
                accountId,
                amount,
                type,
                description,
                categoryId,
                transactionDate,
                paymentMethod,
                isRecurring,
                recurringDetails
            );

            res.status(201).json({
                success: true,
                message: "Transaction created successfully",
                data: newTransaction
            });

        } catch (error: any) {
            // HANDLE SERVICE ERRORS
            console.error("Controller: Transaction creation failed:", error.message);

            // Map business logic errors to appropriate HTTP status codes
            if (error.message.includes("Account not found")) {
                return res.status(404).json({ 
                    error: "Account not found",
                    message: error.message
                });
            }

            if (error.message.includes("Insufficient funds")) {
                return res.status(400).json({ 
                    error: "Insufficient funds",
                    message: error.message
                });
            }

            if (error.message.includes("Category not found")) {
                return res.status(404).json({ 
                    error: "Category not found",
                    message: error.message
                });
            }

            if (error.message.includes("validation")) {
                return res.status(400).json({ 
                    error: "Validation error",
                    message: error.message
                });
            }

            // Generic server error for unexpected issues
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to create transaction"
            });
        }
    },

    updateTransaction: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Transaction ID parameter is required",
                    message: "Please provide transaction ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid transaction ID format",
                    message: "Transaction ID must be a valid MongoDB ObjectId"
                });
            }

            // Validate update data
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({ 
                    error: "Update data is required",
                    message: "Please provide data to update"
                });
            }

            // Validate specific fields if they're being updated
            if (updateData.amount !== undefined) {
                if (typeof updateData.amount !== 'number' || updateData.amount <= 0) {
                    return res.status(400).json({ 
                        error: "Invalid amount",
                        message: "Amount must be a positive number"
                    });
                }
                if (updateData.amount % 0.01 !== 0) {
                    return res.status(400).json({ 
                        error: "Invalid amount precision",
                        message: "Amount can have maximum 2 decimal places"
                    });
                }
            }

            if (updateData.type && !['income', 'expense'].includes(updateData.type)) {
                return res.status(400).json({ 
                    error: "Invalid transaction type",
                    message: "Type must be 'income' or 'expense'",
                    validTypes: ['income', 'expense']
                });
            }

            if (updateData.description !== undefined) {
                if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
                    return res.status(400).json({ 
                        error: "Invalid description",
                        message: "Description must be a non-empty string"
                    });
                }
                if (updateData.description.trim().length > 200) {
                    return res.status(400).json({ 
                        error: "Description too long",
                        message: "Description cannot exceed 200 characters"
                    });
                }
            }

            if (updateData.date !== undefined) {
                const parsedDate = new Date(updateData.date);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({ 
                        error: "Invalid date format",
                        message: "Date must be a valid date string"
                    });
                }
            }

            if (updateData.accountId && !mongoose.Types.ObjectId.isValid(updateData.accountId)) {
                return res.status(400).json({ 
                    error: "Invalid accountId format",
                    message: "accountId must be a valid MongoDB ObjectId"
                });
            }

            if (updateData.categoryId && !mongoose.Types.ObjectId.isValid(updateData.categoryId)) {
                return res.status(400).json({ 
                    error: "Invalid categoryId format",
                    message: "categoryId must be a valid MongoDB ObjectId"
                });
            }

            const updatedTransaction = await updateTransaction(id, updateData);
            if (!updatedTransaction) {
                return res.status(404).json({ 
                    error: "Transaction not found",
                    message: "Transaction with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Transaction updated successfully",
                data: updatedTransaction
            });
        } catch (error) {
            console.error("Error updating transaction", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Transaction not found",
                        message: error.message
                    });
                }
                if (error.message.includes("validation")) {
                    return res.status(400).json({ 
                        error: "Validation error",
                        message: error.message
                    });
                }
                if (error.message.includes("cannot update")) {
                    return res.status(400).json({ 
                        error: "Cannot update transaction",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to update transaction"
            });
        }
    },

    getTransactionsByDateRange: async (req: Request, res: Response) => {
        try {
            const { startDate, endDate, userId } = req.params;
            
            // Validate parameters
            if (!startDate || !endDate || !userId) {
                return res.status(400).json({ 
                    error: "Missing required parameters",
                    required: ["startDate", "endDate", "userId"],
                    message: "Please provide startDate, endDate, and userId in the URL"
                });
            }
            
            // Validate userId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }
            
            // Validate date formats
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ 
                    error: "Invalid date format",
                    message: "startDate and endDate must be valid date strings"
                });
            }
            
            if (start > end) {
                return res.status(400).json({ 
                    error: "Invalid date range",
                    message: "startDate must be before or equal to endDate"
                });
            }

            const transactions = await getTransactionsByDateRange(start, end, userId);
            
            res.json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            console.error("Error fetching transactions by date range:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("Invalid userId format")) {
                    return res.status(400).json({ 
                        error: "Invalid userId format",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transactions by date range"
            });
        }
    },

    getTransactionsByCategory: async (req: Request, res: Response) => {
        try {
            const { categoryId, period, userId } = req.params;
            
            // Validate parameters
            if (!categoryId || !userId) {
                return res.status(400).json({ 
                    error: "Missing required parameters",
                    required: ["categoryId", "userId"],
                    message: "Please provide categoryId and userId in the URL"
                });
            }
            
            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ 
                    error: "Invalid categoryId format",
                    message: "categoryId must be a valid MongoDB ObjectId"
                });
            }
            
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const transactions = await getTransactionsByCategory(categoryId, period || 'all', userId);
            
            res.json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            console.error("Error fetching transactions by category:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("Invalid userId format")) {
                    return res.status(400).json({ 
                        error: "Invalid userId format",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transactions by category"
            });
        }
    },

    getTransactionsByAccount: async (req: Request, res: Response) => {
        try {
            const { accountId, period, userId } = req.params;
            
            // Validate parameters
            if (!accountId || !userId) {
                return res.status(400).json({ 
                    error: "Missing required parameters",
                    required: ["accountId", "userId"],
                    message: "Please provide accountId and userId in the URL"
                });
            }
            
            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(accountId)) {
                return res.status(400).json({ 
                    error: "Invalid accountId format",
                    message: "accountId must be a valid MongoDB ObjectId"
                });
            }
            
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const transactions = await getTransactionsByAccount(accountId, period || 'all', userId);
            
            res.json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            console.error("Error fetching transactions by account:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("Invalid userId format")) {
                    return res.status(400).json({ 
                        error: "Invalid userId format",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch transactions by account"
            });
        }
    },

    deleteTransaction: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Transaction ID parameter is required",
                    message: "Please provide transaction ID in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid transaction ID format",
                    message: "Transaction ID must be a valid MongoDB ObjectId"
                });
            }

            const deletedTransaction = await deleteTransaction(id);
            if (!deletedTransaction) {
                return res.status(404).json({ 
                    error: "Transaction not found",
                    message: "Transaction with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Transaction deleted successfully",
                data: deletedTransaction
            });
        } catch (error) {
            console.error("Error deleting transaction:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Transaction not found",
                        message: error.message
                    });
                }
                if (error.message.includes("cannot delete")) {
                    return res.status(400).json({ 
                        error: "Cannot delete transaction",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to delete transaction"
            });
        }
    },

    getFinancialMetrics: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params; // Use path parameter, not query
            const { period = 'month' } = req.query;
            
            if (!userId) {
                return res.status(400).json({
                    error: "UserId parameter is required"
                });
            }
            
            const metrics = await getFinancialMetrics(userId, period as string);
            
            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            console.error("Error fetching financial metrics:", error);
            res.status(500).json({
                error: "Internal server error",
                message: "Failed to fetch financial metrics"
            });
        }
    }
};