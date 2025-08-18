import Transaction from "../schemas/transaction";
import { ObjectId } from "mongoose";

export async function getAllTransactions() {
    const transactions = await Transaction.find();
    return transactions;
}

export async function getTransactionById(id: string) {
    const transaction = await Transaction.findById(id);
    return transaction;
}

export async function createTransaction(accountId: ObjectId, categoryId: ObjectId, amount: number, type: string, description: string, date: Date, paymentMethod: string, isRecurring: boolean, recurringDetails?: any) {
    const transaction = new Transaction({
        accountId,
        categoryId,
        amount,
        type,
        description,
        date,
        paymentMethod,
        isRecurring,
        recurringDetails
    });
    return transaction.save();
}

export async function deleteTransaction(id: string) {
    const result = await Transaction.findByIdAndDelete(id);
    return result;
}

export async function updateTransaction(id: string, updateData: Partial<typeof Transaction>) {
    const result = await Transaction.findById(id);
    if (!result) {
        throw new Error("Transaction not found");
    }

    const updateResult = await Transaction.updateOne(
        { _id: id },
        {
            $set: { ...updateData },
            $inc: { __v: 1 }
        }
    );
    console.log('Updated result:', updateResult);
    const updatedTransaction = await Transaction.findById(id);

    return updatedTransaction;
}
