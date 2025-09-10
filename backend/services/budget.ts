import Budget from "../models/budget";
import mongoose, { ObjectId } from "mongoose";
import { ICategory } from "../models/budget";

export async function getBudgetsByUserId(userId: ObjectId) {
    try {
        const budgets = await Budget.find({ userId: userId });
        return budgets;
    } catch (error) {
        throw new Error("Error fetching budgets");
    }
}

export async function getBudgetById(id: string) {

    try {
        const budget = await Budget.findById(id);
        return budget;
    } catch (error) {
        throw new Error("Error fetching budget");
    }
}

export async function updateBudget(id: string, updateData: Partial<typeof Budget>) {

    try {
        const updatedBudget = await Budget.findByIdAndUpdate(id, updateData, { new: true });
        return updatedBudget;
    } catch (error) {
        throw new Error("Error updating budget");
    }
}

export async function createBudget(name: string, period: string, startDate: Date, endDate: Date, totalAmount: number, userId: string, categories: ICategory[]) {
    try {
        const newBudget = new Budget({ name, period, startDate, endDate, totalAmount, userId, categories });
        await newBudget.save();
        return newBudget;
    } catch (error) {
        console.error("Service error creating budget:", error);
        throw new Error(`Error creating budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteBudget(id: string) {
    try {
        const deletedBudget = await Budget.findByIdAndDelete(id);
        return deletedBudget;
    } catch (error) {
        throw new Error("Error deleting budget");
    }
}

// Update budget spent amounts when transactions are created/updated/deleted
export async function updateBudgetSpentAmounts(userId: string, categoryId: string, amount: number, operation: 'add' | 'subtract' = 'add', transactionDate?: Date) {
    try {
        const checkDate = transactionDate || new Date();
        
        // Find active budgets for the user that contain this category and are within the date range
        const budgets = await Budget.find({
            userId: new mongoose.Types.ObjectId(userId),
            isActive: true,
            'categories.categoryId': new mongoose.Types.ObjectId(categoryId),
            startDate: { $lte: checkDate },
            endDate: { $gte: checkDate }
        });

        // Update spent amounts for matching budgets
        for (const budget of budgets) {
            const categoryIndex = budget.categories.findIndex(
                cat => cat.categoryId.toString() === categoryId
            );

            if (categoryIndex !== -1) {
                if (operation === 'add') {
                    budget.categories[categoryIndex].spentAmount += amount;
                } else {
                    budget.categories[categoryIndex].spentAmount = Math.max(0, budget.categories[categoryIndex].spentAmount - amount);
                }
                await budget.save();
            }
        }

        return { success: true, updatedBudgets: budgets.length };
    } catch (error) {
        console.error("Error updating budget spent amounts:", error);
        throw new Error("Error updating budget spent amounts");
    }
}

// Recalculate budget progress for a specific budget
export async function recalculateBudgetProgress(budgetId: string) {
    try {
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new Error("Budget not found");
        }

        // Reset all spent amounts to 0
        budget.categories.forEach(category => {
            category.spentAmount = 0;
        });

        // Get all transactions for this user within the budget period
        const Transaction = require("../models/transaction");
        const transactions = await Transaction.find({
            userId: budget.userId,
            type: 'expense',
            date: {
                $gte: budget.startDate,
                $lte: budget.endDate
            }
        });

        // Add spent amounts back based on transactions
        for (const transaction of transactions) {
            if (transaction.categoryId) {
                const categoryIndex = budget.categories.findIndex(
                    cat => cat.categoryId.toString() === transaction.categoryId.toString()
                );

                if (categoryIndex !== -1) {
                    budget.categories[categoryIndex].spentAmount += transaction.amount;
                }
            }
        }

        await budget.save();
        return budget;
    } catch (error) {
        console.error("Error recalculating budget progress:", error);
        throw new Error("Error recalculating budget progress");
    }
}

export async function getBudgetProgress(id: string) {
    try {
        const budget = await Budget.findById(id);
        if (!budget) {
            throw new Error("Budget not found");
        }
        
        const totalAmount = budget.totalAmount;
        if (totalAmount === 0) {
            return 0; // Avoid division by zero
        }
        
        const spentAmount = budget.categories.reduce((acc, category) => acc + category.spentAmount, 0);
        const progress = (spentAmount / totalAmount) * 100;
        return Math.min(progress, 100); // Cap at 100%
    } catch (error) {
        throw new Error("Error fetching budget progress");
    }
}

export async function getBudgetAlerts(budgetId: string, userId: string) {
    try {
        const budget = await Budget.findById(budgetId);
        if (!budget) {
            throw new Error("Budget not found");
        }
        
        // Filter categories where spending exceeds allocation
        const alerts = budget.categories.filter((category) => 
            category.spentAmount > category.allocatedAmount
        );
        
        return alerts;
    } catch (error) {
        throw new Error("Error fetching budget alerts");
    }
}


