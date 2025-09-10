import { Request, Response } from "express";
import { getBudgetsByUserId, getBudgetById, updateBudget, createBudget, deleteBudget, getBudgetProgress, getBudgetAlerts, recalculateBudgetProgress } from "../services/budget";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

export const budgetsController = {
    getBudgetsByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ error: "userId parameter is required" });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid userId format" });
            }

            const budgets = await getBudgetsByUserId(userId as unknown as ObjectId);
            
            if (!budgets || budgets.length === 0) {
                return res.status(404).json({ 
                    error: "No budgets found for this user",
                    message: "User has no budgets yet"
                });
            }

            res.json({
                success: true,
                count: budgets.length,
                data: budgets
            });
        } catch (error) {
            console.error("Error fetching budgets by userId:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch budgets"
            });
        }
    },

    getBudgetById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ error: "Budget ID parameter is required" });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid budget ID format" });
            }

            const budget = await getBudgetById(id);
            
            if (!budget) {
                return res.status(404).json({ 
                    error: "Budget not found",
                    message: "Budget with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                data: budget
            });
        } catch (error) {
            console.error("Error fetching budget by ID:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch budget"
            });
        }
    },
    
    updateBudget: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ error: "Budget ID parameter is required" });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid budget ID format" });
            }

            // Validate update data
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: "Update data is required" });
            }

            // Validate specific fields if they're being updated
            if (updateData.period && !['daily', 'weekly', 'monthly', 'yearly'].includes(updateData.period)) {
                return res.status(400).json({ 
                    error: "Period must be one of: daily, weekly, monthly, yearly" 
                });
            }

            if (updateData.totalAmount && (typeof updateData.totalAmount !== 'number' || updateData.totalAmount <= 0)) {
                return res.status(400).json({ 
                    error: "Total amount must be a positive number" 
                });
            }

            // Validate categories array if it's being updated
            if (updateData.categories && Array.isArray(updateData.categories)) {
                for (const category of updateData.categories) {
                    if (!category.categoryId || !mongoose.Types.ObjectId.isValid(category.categoryId)) {
                        return res.status(400).json({ 
                            error: "Invalid categoryId in categories array" 
                        });
                    }
                    if (category.allocatedAmount !== undefined && (typeof category.allocatedAmount !== 'number' || category.allocatedAmount < 0)) {
                        return res.status(400).json({ 
                            error: "Category allocated amount must be a non-negative number" 
                        });
                    }
                    if (category.spentAmount && (typeof category.spentAmount !== 'number' || category.spentAmount < 0)) {
                        return res.status(400).json({ 
                            error: "Category spent amount must be a non-negative number" 
                        });
                    }
                }
            }

            const budget = await updateBudget(id, updateData);
            
            if (!budget) {
                return res.status(404).json({ 
                    error: "Budget not found",
                    message: "Budget with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Budget updated successfully",
                data: budget
            });
        } catch (error) {
            console.error("Error updating budget:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Budget not found",
                        message: error.message
                    });
                }
                if (error.message.includes("validation")) {
                    return res.status(400).json({ 
                        error: "Validation error",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to update budget"
            });
        }
    },
    
    createBudget: async (req: Request, res: Response) => {
        try {
            const { name, period, startDate, endDate, totalAmount, categories, userId } = req.body;
            const userIdFromQuery = req.query.userId || req.headers['user-id'];
            const finalUserId = userId || userIdFromQuery;
            
            // Validate required fields
            if (!name || !period || !startDate || !endDate || !totalAmount || !finalUserId) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    required: ["name", "period", "startDate", "endDate", "totalAmount", "userId"],
                    received: { name, period, startDate, endDate, totalAmount, userId: finalUserId }
                });
            }

            // Validate field types and values
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ 
                    error: "Name must be a non-empty string" 
                });
            }

            if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
                return res.status(400).json({ 
                    error: "Period must be one of: daily, weekly, monthly, yearly" 
                });
            }

            if (typeof totalAmount !== 'number' || totalAmount <= 0) {
                return res.status(400).json({ 
                    error: "Total amount must be a positive number" 
                });
            }

            if (!mongoose.Types.ObjectId.isValid(finalUserId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format" 
                });
            }

            // Validate dates
            if (isNaN(Date.parse(startDate))) {
                return res.status(400).json({ 
                    error: "Invalid startDate format",
                    message: "startDate must be a valid date string"
                });
            }

            if (isNaN(Date.parse(endDate))) {
                return res.status(400).json({ 
                    error: "Invalid endDate format",
                    message: "endDate must be a valid date string"
                });
            }

            // Validate date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                return res.status(400).json({ 
                    error: "Invalid date range",
                    message: "endDate must be after startDate"
                });
            }

            // Validate categories array if provided
            if (categories && Array.isArray(categories)) {
                if (categories.length === 0) {
                    return res.status(400).json({ 
                        error: "Categories array cannot be empty if provided" 
                    });
                }

                for (const category of categories) {
                    if (!category.categoryId || !mongoose.Types.ObjectId.isValid(category.categoryId)) {
                        return res.status(400).json({ 
                            error: "Invalid categoryId in categories array" 
                        });
                    }
                    if (typeof category.allocatedAmount !== 'number' || category.allocatedAmount < 0) {
                        return res.status(400).json({ 
                            error: "Category allocated amount must be a non-negative number" 
                        });
                    }
                    if (category.spentAmount && (typeof category.spentAmount !== 'number' || category.spentAmount < 0)) {
                        return res.status(400).json({ 
                            error: "Category spent amount must be a non-negative number" 
                        });
                    }
                }

                // Validate total allocated amount doesn't exceed totalAmount
                const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
                if (totalAllocated > totalAmount) {
                    return res.status(400).json({ 
                        error: "Sum of category allocated amounts cannot exceed total budget amount",
                        totalAmount,
                        totalAllocated
                    });
                }
            }

            const budget = await createBudget(name, period, new Date(startDate), new Date(endDate), totalAmount, finalUserId as string, categories);
            
            res.status(201).json({
                success: true,
                message: "Budget created successfully",
                data: budget
            });
        } catch (error) {
            console.error("Error creating budget:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("already exists")) {
                    return res.status(409).json({ 
                        error: "Budget already exists",
                        message: error.message
                    });
                }
                if (error.message.includes("validation")) {
                    return res.status(400).json({ 
                        error: "Validation error",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to create budget"
            });
        }
    },
    
    deleteBudget: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ error: "Budget ID parameter is required" });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid budget ID format" });
            }

            const budget = await deleteBudget(id);
            
            if (!budget) {
                return res.status(404).json({ 
                    error: "Budget not found",
                    message: "Budget with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Budget deleted successfully",
                data: budget
            });
        } catch (error) {
            console.error("Error deleting budget:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Budget not found",
                        message: error.message
                    });
                }
                if (error.message.includes("cannot delete")) {
                    return res.status(400).json({ 
                        error: "Cannot delete budget",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to delete budget"
            });
        }
    },

    getBudgetProgress: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.query.userId || req.headers['user-id'];

            if (!userId) {
                return res.status(400).json({ error: "userId parameter is required" });
            }

            if (!mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ error: "Invalid userId format" });
            }

            const progress = await getBudgetProgress(id);
            res.json({
                success: true,
                data: progress
            });
        } catch (error) {
            console.error("Error fetching budget progress:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch budget progress"
            });
        }
    },

    getBudgetAlerts: async (req: Request, res: Response) => {
        try {
            const { budgetId } = req.params;
            const userId = req.query.userId || req.headers['user-id'];

            // Validate budgetId parameter
            if (!budgetId) {
                return res.status(400).json({ 
                    error: "Budget ID parameter is required",
                    message: "Please provide budgetId in the URL"
                });
            }

            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId parameter is required",
                    message: "Please provide userId in query parameters or headers"
                });
            }

            // Validate ObjectId formats
            if (!mongoose.Types.ObjectId.isValid(budgetId)) {
                return res.status(400).json({ 
                    error: "Invalid budget ID format",
                    message: "Budget ID must be a valid MongoDB ObjectId"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const alerts = await getBudgetAlerts(budgetId, userId as string);
            
            res.json({
                success: true,
                count: alerts.length,
                data: alerts
            });
        } catch (error) {
            console.error("Error fetching budget alerts:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message === "Budget not found") {
                    return res.status(404).json({ 
                        error: "Budget not found",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch budget alerts"
            });
        }
    },

    recalculateBudgetProgress: async (req: Request, res: Response) => {
        try {
            const { budgetId } = req.params;
            
            // Validate budgetId parameter
            if (!budgetId) {
                return res.status(400).json({ 
                    error: "Budget ID parameter is required",
                    message: "Please provide budgetId in the URL"
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(budgetId)) {
                return res.status(400).json({ 
                    error: "Invalid budget ID format",
                    message: "Budget ID must be a valid MongoDB ObjectId"
                });
            }

            const updatedBudget = await recalculateBudgetProgress(budgetId);
            
            res.json({
                success: true,
                message: "Budget progress recalculated successfully",
                data: updatedBudget
            });
        } catch (error) {
            console.error("Error recalculating budget progress:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Budget not found",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to recalculate budget progress"
            });
        }
    },

    testBudgetUpdate: async (req: Request, res: Response) => {
        try {
            const { userId, categoryId, amount } = req.body;
            
            if (!userId || !categoryId || !amount) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    required: ["userId", "categoryId", "amount"]
                });
            }

            const { updateBudgetSpentAmounts } = require("../services/budget");
            const result = await updateBudgetSpentAmounts(userId, categoryId, amount, 'add');
            
            res.json({
                success: true,
                message: "Budget update test completed",
                result
            });
        } catch (error) {
            console.error("Error testing budget update:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to test budget update"
            });
        }
    }
};