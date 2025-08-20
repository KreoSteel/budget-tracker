import Transaction from "../models/transaction";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import Account from "../models/account";

export async function getAllTransactions() {
    const transactions = await Transaction.find();
    return transactions;
}

export async function getTransactionById(id: string) {
    const transaction = await Transaction.findById(id);
    return transaction;
}

export async function createTransaction(
    accountId: ObjectId,
    categoryId: ObjectId,
    amount: number,
    type: string,
    description: string,
    date: Date,
    paymentMethod: string,
    isRecurring: boolean,
    recurringDetails?: any
) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // BUSINESS LOGIC VALIDATIONS
        
        // 1. Check if account exists
        const account = await Account.findById(accountId).session(session);
        if (!account) {
            throw new Error("Account not found");
        }

        // 2. Check if account is active
        if (!account.isActive) {
            throw new Error("Account is inactive");
        }

        // 3. Business rule: Check sufficient funds (except for credit cards)
        if (type === 'expense' && account.type !== 'credit_card') {
            if (account.balance < amount) {
                throw new Error(`Insufficient funds. Available: €${account.balance.toFixed(2)}, Required: €${amount.toFixed(2)}`);
            }
        }

        // 4. Business rule: Credit card spending limit (optional)
        if (type === 'expense' && account.type === 'credit_card') {
            const newBalance = account.balance - amount;
            const creditLimit = -5000; // €5000 credit limit
            if (newBalance < creditLimit) {
                throw new Error(`Credit limit exceeded. Current balance: €${account.balance.toFixed(2)}, Credit limit: €${Math.abs(creditLimit).toFixed(2)}`);
            }
        }

        // CREATE TRANSACTION
        const transactionData = {
            accountId,
            categoryId,
            amount,
            type,
            description,
            date,
            paymentMethod,
            isRecurring,
            recurringDetails
        };

        const [newTransaction] = await Transaction.create([transactionData], { session });

        // UPDATE ACCOUNT BALANCE
        if (type === 'expense') {
            account.balance -= amount;
        } else if (type === 'income') {
            account.balance += amount;
        }

        await account.save({ session });
        await session.commitTransaction();
        
        return newTransaction;

    } catch (error) {
        await session.abortTransaction();
        throw error; // Re-throw for controller to handle
    } finally {
        session.endSession();
    }
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
