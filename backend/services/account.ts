import mongoose, { ObjectId } from "mongoose";
import Account from "../models/account";
import Transaction from "../models/transaction";

export async function getAllAccounts() {
  try {
    const accounts = await Account.find();
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
}

export async function getAccountByUserId(userId: mongoose.Types.ObjectId) {
  try {
    const accounts = await Account.find({ userId });
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

export async function createAccount(name: string, balance: number, type: string, bankName: string, userId: mongoose.Types.ObjectId) {
  try {
    const newAccount = new Account({ name, balance, type, bankName, userId });
    await newAccount.save();
    return newAccount;
  } catch (error) {
    throw new Error("Error creating account");
  }
}

export async function updateAccount(id: string, updateData: {
    name?: string;
    balance?: number;
    type?: string;
    bankName?: string;
    userId?: mongoose.Types.ObjectId;
    currency?: string;
    isActive?: boolean;
}) {
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
    const updatedAccount = await Account.findById(id);

    return updatedAccount;
}


export async function deleteAccount(id: string) {
  try {
    const deletedAccount = await Account.findByIdAndDelete(id);
    return deletedAccount;
  } catch (error) {
    throw new Error("Error deleting account");
  }
}

export async function getAccountsByUserId(userId: mongoose.Types.ObjectId) {
  try {
    const accounts = await Account.find({ userId });
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
}

export async function deactivateAccount(id: string) {
  try {
    const account = await Account.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error deactivating account");
  }
}

export async function activateAccount(id: string) {
  try {
    const account = await Account.findByIdAndUpdate(id, { isActive: true }, { new: true });
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error activating account");
  }
}

export async function getAccountsByType(type: string, isActive: boolean | undefined, userId?: mongoose.Types.ObjectId) {
  try {
    const query: any = { type };
    
    // This are optional parameters
    if (userId) {
      query.userId = userId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    const accounts = await Account.find(query);
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
}

export async function transferBetweenAccounts(fromAccountId: string, toAccountId: string, amount: number) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromAccount = await Account.findById(fromAccountId).session(session);
    const toAccount = await Account.findById(toAccountId).session(session);
    if (!fromAccount || !toAccount) {
      throw new Error("Account not found");
    }
    if (fromAccount.balance < amount) {
      throw new Error("Insufficient balance");
    }
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save();
    await toAccount.save();
    await session.commitTransaction();
    session.endSession();
    return { fromAccount, toAccount };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error transferring between accounts");
  }
}

export async function getTotalNetWorth(userId: mongoose.Types.ObjectId) {
  try {
    const accounts = await Account.find({ userId });
    const totalNetWorth = accounts.reduce((acc, account) => acc + account.balance, 0);
    return totalNetWorth;
  } catch (error) {
    throw new Error("Error fetching total net worth");
  }
}

export async function getAccountBalanceHistory(userId: mongoose.Types.ObjectId, startDate: Date, endDate: Date) {
  try {
    const transactions = await Transaction.find({ userId, date: { $gte: startDate, $lte: endDate } });
    return transactions;
  } catch (error) {
    throw new Error("Error fetching account balance history");
  }
}