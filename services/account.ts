import { ObjectId } from "mongoose";
import Account from "../schemas/account";

export async function getAllAccounts() {
  try {
    const accounts = await Account.find();
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
}

export async function getAccountById(id: string) {
  try {
    const account = await Account.findById(id);
    return account;
  } catch (error) {
    throw new Error("Error fetching account");
  }
}

export async function createAccount(name: string, balance: number, type: string, bankName: string, userId: ObjectId) {
  try {
    const newAccount = new Account({ name, balance, type, bankName, userId });
    await newAccount.save();
    return newAccount;
  } catch (error) {
    throw new Error("Error creating account");
  }
}

export async function updateAccount(id: string, updateData: Partial<typeof Account>) {
    const result = await Account.findById(id);
    if (!result) {
        throw new Error("Account not found");
    }

    const updateResult = await Account.updateOne(
        { _id: id },
        {
            $set: { ...updateData },
            $inc: { __v: 1 }
        }
    );
    console.log('Updated result:', updateResult);
    const updatedAccount = await Account.findById(id);

    return updatedAccount;
}