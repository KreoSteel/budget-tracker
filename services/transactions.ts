import Transaction from "../schemas/transaction";
import { ObjectId } from "mongoose";

export async function getAllTransactions() {
    const transactions = await Transaction.find();
    return transactions;
}

export async function getTransactionById(id: ObjectId) {
    const transaction = await Transaction.findById(id);
    return transaction;
}

export async function createTransaction(accountId: ObjectId, categoryId: ObjectId, amount: number, type: string, date: Date, paymentMethod: string, isRecurring: boolean, recurringDetails?: any) {
    const transaction = new Transaction({
        accountId,
        categoryId,
        amount,
        type,
        date,
        paymentMethod,
        isRecurring,
        recurringDetails
    });
    return transaction.save();
}

export async function deleteTransaction(id: ObjectId) {
    const result = await Transaction.findByIdAndDelete(id);
    return result;
}

export async function updateTransaction(id: ObjectId, updateData: Partial<typeof Transaction>) {
    const result = await Transaction.findByIdAndUpdate(id, updateData, { new: true });
    return result;
}