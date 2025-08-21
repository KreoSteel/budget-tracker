import Budget from "../models/budget";
import { ObjectId } from "mongoose";
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


