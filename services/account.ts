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

export async function getAccountById(id: ObjectId) {
  try {
    const account = await Account.findById(id);
    return account;
  } catch (error) {
    throw new Error("Error fetching account");
  }
}

export async function createAccount(name: string, balance:number, type: string, bankName: string) {
  try {
    const newAccount = new Account({ name, balance, type, bankName });
    await newAccount.save();
    return newAccount;
  } catch (error) {
    throw new Error("Error creating account");
  }
}
