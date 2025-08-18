import { getAllTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction } from "../services/transactions";
import { Request, Response } from "express";
import Transaction from "../schemas/transaction";
import mongoose from "mongoose";

export const transactionsControllers = {
    getAllTransactions: async (req: Request, res: Response) => {
        try {
            const transactions = await getAllTransactions();
            res.json(transactions);
        } catch (error) {
            console.error("Error fetching transactions", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getTransactionById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const transaction = await getTransactionById(id);
            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }
            res.json(transaction);
        } catch (error) {
            console.error("Error fetching transaction", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    createTransaction: async (req: Request, res: Response) => {
        const { accountId, categoryId, type, amount, description, date, paymentMethod, isRecurring, recurringDetails } = req.body;
        try {
            const newTransaction = await createTransaction(accountId, categoryId, amount, type, description, date, paymentMethod, isRecurring, recurringDetails);
            res.status(201).json(newTransaction);
        } catch (error) {
            console.error("Error creating transaction", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    updateTransaction: async (req: Request, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            const updatedTransaction = await updateTransaction(id, updateData);
            if (!updatedTransaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }
            res.json(updatedTransaction);
        } catch (error) {
            console.error("Error updating transaction", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

}