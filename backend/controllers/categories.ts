import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getCategoryByUserId, getCategorySpending, getCategoryIncome } from "../services/categories";
import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

export const categoriesControllers = {
    getAllCategories: async (req: Request, res: Response) => {
        try {
            // For GET requests, get userId from query params or headers
            const userId = req.query.userId || req.headers['user-id'];
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId is required",
                    message: "Please provide userId in query parameters or headers"
                });
            }
            
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(userId as string)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const categories = await getAllCategories(userId as any);
            
            if (!categories || categories.length === 0) {
                return res.status(404).json({ 
                    error: "No categories found",
                    message: "No categories exist for this user"
                });
            }

            res.json({
                success: true,
                count: categories.length,
                data: categories
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch categories"
            });
        }
    },

    getCategoryById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Category ID parameter is required",
                    message: "Please provide category ID in the URL"
                });
            }
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid category ID format",
                    message: "Category ID must be a valid MongoDB ObjectId"
                });
            }

            const category = await getCategoryById(id);
            if (!category) {
                return res.status(404).json({ 
                    error: "Category not found",
                    message: "Category with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            console.error("Error fetching category:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch category"
            });
        }
    },

    createCategory: async (req: Request, res: Response) => {
        try {
            const { name, type, userId, isDefault = false } = req.body;

            // Validation
            if (!name || !type || !userId) {
                return res.status(400).json({ 
                    error: "Missing required fields",
                    required: ["name", "type", "userId"],
                    received: { name, type, userId }
                });
            }

            // Validate name
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ 
                    error: "Invalid name",
                    message: "Category name must be a non-empty string"
                });
            }

            // Validate name length
            if (name.trim().length > 50) {
                return res.status(400).json({ 
                    error: "Name too long",
                    message: "Category name cannot exceed 50 characters"
                });
            }

            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({ 
                    error: "Invalid category type",
                    message: "Type must be either 'income' or 'expense'",
                    validTypes: ['income', 'expense']
                });
            }

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            // Validate isDefault
            if (typeof isDefault !== 'boolean') {
                return res.status(400).json({ 
                    error: "Invalid isDefault value",
                    message: "isDefault must be a boolean"
                });
            }

            const category = await createCategory(name, type, userId, isDefault);
            
            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category
            });
        } catch (error) {
            console.error("Error creating category:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("already exists")) {
                    return res.status(409).json({ 
                        error: "Category already exists",
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
                message: "Failed to create category"
            });
        }
    },

    updateCategory: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Category ID parameter is required",
                    message: "Please provide category ID in the URL"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid category ID format",
                    message: "Category ID must be a valid MongoDB ObjectId"
                });
            }

            // Validate update data
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({ 
                    error: "Update data is required",
                    message: "Please provide data to update"
                });
            }

            // Validate name if it's being updated
            if (updateData.name !== undefined) {
                if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
                    return res.status(400).json({ 
                        error: "Invalid name",
                        message: "Category name must be a non-empty string"
                    });
                }
                if (updateData.name.trim().length > 50) {
                    return res.status(400).json({ 
                        error: "Name too long",
                        message: "Category name cannot exceed 50 characters"
                    });
                }
            }

            // Validate type if it's being updated
            if (updateData.type && !['income', 'expense'].includes(updateData.type)) {
                return res.status(400).json({ 
                    error: "Invalid category type",
                    message: "Type must be either 'income' or 'expense'",
                    validTypes: ['income', 'expense']
                });
            }

            // Validate isDefault if it's being updated
            if (updateData.isDefault !== undefined && typeof updateData.isDefault !== 'boolean') {
                return res.status(400).json({ 
                    error: "Invalid isDefault value",
                    message: "isDefault must be a boolean"
                });
            }

            const updatedCategory = await updateCategory(id, updateData);
            if (!updatedCategory) {
                return res.status(404).json({ 
                    error: "Category not found",
                    message: "Category with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Category updated successfully",
                data: updatedCategory
            });
        } catch (error) {
            console.error("Error updating category:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message === "Category not found") {
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
                if (error.message.includes("cannot update")) {
                    return res.status(400).json({ 
                        error: "Cannot update category",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to update category"
            });
        }
    },

    deleteCategory: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate id parameter
            if (!id) {
                return res.status(400).json({ 
                    error: "Category ID parameter is required",
                    message: "Please provide category ID in the URL"
                });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    error: "Invalid category ID format",
                    message: "Category ID must be a valid MongoDB ObjectId"
                });
            }

            const deletedCategory = await deleteCategory(id);
            if (!deletedCategory) {
                return res.status(404).json({ 
                    error: "Category not found",
                    message: "Category with the specified ID does not exist"
                });
            }

            res.json({
                success: true,
                message: "Category deleted successfully",
                data: deletedCategory
            });
        } catch (error) {
            console.error("Error deleting category:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message === "Category not found") {
                    return res.status(404).json({ 
                        error: "Category not found",
                        message: error.message
                    });
                }
                if (error.message.includes("cannot delete")) {
                    return res.status(400).json({ 
                        error: "Cannot delete category",
                        message: error.message
                    });
                }
                if (error.message.includes("in use")) {
                    return res.status(409).json({ 
                        error: "Category in use",
                        message: error.message
                    });
                }
            }
            
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to delete category"
            });
        }
    },

    getCategoryByUserId: async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            
            // Validate userId parameter
            if (!userId) {
                return res.status(400).json({ 
                    error: "userId parameter is required",
                    message: "Please provide userId in the URL"
                });
            }
            
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ 
                    error: "Invalid userId format",
                    message: "userId must be a valid MongoDB ObjectId"
                });
            }

            const categories = await getCategoryByUserId(userId);
            
            if (!categories || categories.length === 0) {
                return res.status(404).json({ 
                    error: "No categories found",
                    message: "No categories exist for this user"
                });
            }

            res.json({
                success: true,
                count: categories.length,
                data: categories
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ 
                error: "Internal server error",
                message: "Failed to fetch categories"
            });
        }
    },

    getCategorySpending: async (req: Request, res: Response) => {
        try {
            const { categoryId, userId } = req.params;
            
            // Validate parameters
            if (!categoryId || !userId) {
                return res.status(400).json({ 
                    error: "Missing required parameters",
                    required: ["categoryId", "userId"],
                    message: "Please provide both categoryId and userId in the URL"
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

            const spending = await getCategorySpending(categoryId, userId);
            
            res.json({
                success: true,
                data: {
                    categoryId,
                    userId,
                    totalSpending: spending
                }
            });
        } catch (error) {
            console.error("Error fetching category spending:", error);
            
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
                message: "Failed to fetch category spending"
            });
        }
    },

    getCategoryIncome: async (req: Request, res: Response) => {
        try {
            const { categoryId, userId } = req.params;
            
            // Validate parameters
            if (!categoryId || !userId) {
                return res.status(400).json({ 
                    error: "Missing required parameters",
                    required: ["categoryId", "userId"],
                    message: "Please provide both categoryId and userId in the URL"
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

            const income = await getCategoryIncome(categoryId, userId);
            
            res.json({
                success: true,
                data: {
                    categoryId,
                    userId,
                    totalIncome: income
                }
            });
        } catch (error) {
            console.error("Error fetching category income:", error);
            
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
                message: "Failed to fetch category income"
            });
        }
    }
};
