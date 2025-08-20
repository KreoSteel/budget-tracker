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
