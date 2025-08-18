import { Request, Response } from "express";
import { createAccount, getAllAccounts, getAccountById } from "../services/account";
import { ObjectId } from "mongoose";

export const accountsController = {
    getAllAccounts: async (req: Request, res: Response) => {
        try {
            const accounts = await getAllAccounts();
            res.json(accounts);
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getAccountById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const account = await getAccountById(id);
            if (!account) {
                return res.status(404).json({ error: "Account not found" });
            }
            res.json(account);
        } catch (error) {
            console.error("Error fetching account:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    createAccount: async (req: Request, res: Response) => {
        const { name, balance, type, bankName, userId } = req.body;
        try {
            const newAccount = await createAccount(name, balance, type, bankName, userId);
            res.status(201).json(newAccount);
        } catch (error) {
            console.error("Error creating account:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};
