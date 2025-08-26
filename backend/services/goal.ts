import Goal from "../models/goal";
import { Types } from "mongoose";


export function getAllGoals() {
    try {
        return Goal.find({});
    } catch (error) {
        throw new Error("Failed to get all goals");
    }
}

export function getGoalsByUserId(userId: string, limit?: number) {
    try {
        let query = Goal.find({ userId: new Types.ObjectId(userId) });
        if (limit) {
            query = query.limit(limit);
        }
        return query;
    } catch (error) {
        throw new Error("Failed to get goals by user id");
    }
}

export function getGoalById(id: string) {
    try {
        return Goal.findById(id);
    } catch (error) {
        throw new Error("Goal not found");
    }
}

export function createGoal(goalData: typeof Goal) {
    try {
        const goal = new Goal(goalData);
        return goal.save();
    } catch (error) {
        throw new Error("Failed to create goal");
    }
}

export function updateGoal(id: string, goalData: Partial<typeof Goal>) {
    try {
        return Goal.findByIdAndUpdate(id, goalData, { new: true });
    } catch (error) {
        console.error("Service error updating goal:", error);
        throw new Error("Failed to update goal");
    }
}

export function deleteGoal(id: string) {
    try {
        return Goal.findByIdAndDelete(id);
    } catch (error) {
        throw new Error("Failed to delete goal");
    }
}

export default {
    getAllGoals,
    getGoalsByUserId,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal
}

