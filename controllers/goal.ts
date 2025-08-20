import { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal } from "../services/goal";
import { Request, Response } from "express";

export const goalsControllers = {
    getAllGoals: async (req: Request, res: Response) => {
        try {
            const goals = await getAllGoals();
            res.status(200).json({
                success: true,
                data: goals
            });
        } catch (error) {
            console.error("Error getting all goals:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get all goals"
            });
        }
    },
    getGoalById: async (req: Request, res: Response) => {
        try {
            const goal = await getGoalById(req.params.id);
            res.status(200).json({
                success: true,
                data: goal
            });
        } catch (error) {
            console.error("Error getting goal by id:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get goal"
            });
        }
    },
    createGoal: async (req: Request, res: Response) => {
        try {
            const goal = await createGoal(req.body);
            res.status(201).json({
                success: true,
                message: "Goal created successfully",
                data: goal
            });
        } catch (error) {
            console.error("Error creating goal:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("already exists")) {
                    return res.status(409).json({ 
                        error: "Goal already exists",
                        message: error.message
                    });
                }
            }
            res.status(500).json({
                success: false,
                error: "Failed to create goal"
            });
        }
    },
    updateGoal: async (req: Request, res: Response) => {
        try {
            const goal = await updateGoal(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: "Goal updated successfully",
                data: goal
            });
        } catch (error) {
            console.error("Error updating goal:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Goal not found",
                        message: error.message
                    });
                }
            }
            res.status(500).json({
                success: false,
                error: "Failed to update goal"
            });
        }
    },
    deleteGoal: async (req: Request, res: Response) => {
        try {
            await deleteGoal(req.params.id);
            res.status(200).json({
                success: true,
                message: "Goal deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting goal:", error);
            
            // Handle specific service errors
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    return res.status(404).json({ 
                        error: "Goal not found",
                        message: error.message
                    });
                }
            }
            res.status(500).json({
                success: false,
                error: "Failed to delete goal"
            });
        }
    }
}