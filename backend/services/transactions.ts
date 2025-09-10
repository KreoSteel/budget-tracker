import Transaction from "../models/transaction";
import mongoose, { ObjectId } from "mongoose";
import Account from "../models/account";
import { updateBudgetSpentAmounts } from "./budget";

interface TransactionUpdateData {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    categoryId?: ObjectId;
    date?: Date;
    paymentMethod?: string;
    isRecurring?: boolean;
    recurringDetails?: any;
}

export async function getAllTransactions() {
    const transactions = await Transaction.find();
    return transactions;
}

export async function getTransactionsByUserId(userId: string) {
    // First, get all accounts for this user
    const userAccounts = await Account.find({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!userAccounts || userAccounts.length === 0) {
        return [];
    }
    
    // Get account IDs
    const accountIds = userAccounts.map(account => account._id);
    
    // Query transactions for these accounts
    const transactions = await Transaction.find({ accountId: { $in: accountIds } })
        .populate('accountId', 'name type balance')
        .populate('categoryId', 'name type')
        .sort({ date: -1 })
        .lean();
    
    return transactions;
}

export async function getAllTransactionsWithPagination(
    query: any = {},
    page: number = 1,
    limit: number = 10,
    sort: any = { date: -1 }
) {
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);
    
    // Get paginated results
    const transactions = await Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('accountId', 'name type balance')
        .populate('categoryId', 'name type')
        .lean();
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
        transactions,
        totalCount,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
}

export async function getRecentTransactions(
    userId: string,
    limit: number = 6,
    days: number = 30
) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // First, get all accounts for this user
    const userAccounts = await Account.find({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!userAccounts || userAccounts.length === 0) {
        return [];
    }
    
    // Get account IDs
    const accountIds = userAccounts.map(account => account._id);
    
    // Query transactions for these accounts
    const query = {
        accountId: { $in: accountIds },
        date: { $gte: startDate }
    };
    
    const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .populate('accountId', 'name type balance')
        .populate('categoryId', 'name type')
        .lean();
    
    return transactions;
}

export async function getTransactionsSummary(
    userId: string,
    days: number = 30
) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // First, get all accounts for this user
    const userAccounts = await Account.find({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!userAccounts || userAccounts.length === 0) {
        return {
            income: { total: 0, count: 0, average: 0 },
            expense: { total: 0, count: 0, average: 0 }
        };
    }
    
    // Get account IDs
    const accountIds = userAccounts.map(account => account._id);
    
    // Query transactions for these accounts
    const query = {
        accountId: { $in: accountIds },
        date: { $gte: startDate }
    };
    
    const summary = await Transaction.aggregate([
        { $match: query },
        {
            $group: {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 },
                averageAmount: { $avg: "$amount" }
            }
        }
    ]);
    
    const result = {
        income: { total: 0, count: 0, average: 0 },
        expense: { total: 0, count: 0, average: 0 }
    };
    
    summary.forEach(item => {
        if (item._id === 'income') {
            result.income = {
                total: item.totalAmount,
                count: item.count,
                average: item.averageAmount
            };
        } else if (item._id === 'expense') {
            result.expense = {
                total: item.totalAmount,
                count: item.count,
                average: item.averageAmount
            };
        }
    });
    
    return result;
}

export async function getTransactionById(id: string) {
    const transaction = await Transaction.findById(id);
    return transaction;
}

export async function createTransaction(
    accountId: ObjectId,
    amount: number,
    type: string,
    description: string,
    categoryId?: ObjectId,
    date?: Date,
    paymentMethod?: string,
    isRecurring?: boolean,
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
            amount,
            type,
            description,
            ...(categoryId && { categoryId }),
            ...(date && { date }),
            ...(paymentMethod && { paymentMethod }),
            ...(isRecurring !== undefined && { isRecurring }),
            ...(recurringDetails && { recurringDetails })
        };

        const [newTransaction] = await Transaction.create([transactionData], { session });

        // UPDATE ACCOUNT BALANCE
        if (type === 'expense') {
            account.balance -= amount;
        } else if (type === 'income') {
            account.balance += amount;
        }

        await account.save({ session });

        // UPDATE BUDGET SPENT AMOUNTS (only for expense transactions with category)
        if (type === 'expense' && categoryId) {
            // Get the account's userId to update budgets
            const accountWithUser = await Account.findById(accountId).populate('userId').session(session);
            if (accountWithUser && accountWithUser.userId) {
                try {
                    // Extract the userId properly - handle both string and ObjectId cases
                    const userId = typeof accountWithUser.userId === 'string' 
                        ? accountWithUser.userId 
                        : accountWithUser.userId._id.toString();
                    
                    await updateBudgetSpentAmounts(
                        userId,
                        categoryId.toString(),
                        amount,
                        'add',
                        date || new Date()
                    );
                } catch (budgetError) {
                    console.error("Error updating budget spent amounts:", budgetError);
                    // Don't fail the transaction if budget update fails
                }
            }
        }

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Get the transaction details before deleting
        const transaction = await Transaction.findById(id).session(session);
        if (!transaction) {
            throw new Error("Transaction not found");
        }

        // 2. Get the account to update its balance
        const account = await Account.findById(transaction.accountId).session(session);
        if (!account) {
            throw new Error("Account not found");
        }

        // 3. Reverse the account balance change
        if (transaction.type === 'expense') {
            account.balance += transaction.amount; // Add back the expense
        } else if (transaction.type === 'income') {
            account.balance -= transaction.amount; // Subtract the income
        }

        // 4. Save the updated account balance
        await account.save({ session });

        // 5. UPDATE BUDGET SPENT AMOUNTS (subtract the deleted expense)
        if (transaction.type === 'expense' && transaction.categoryId) {
            try {
                // Extract the userId properly - handle both string and ObjectId cases
                const userId = typeof account.userId === 'string' 
                    ? account.userId 
                    : account.userId.toString();
                    
                await updateBudgetSpentAmounts(
                    userId,
                    transaction.categoryId.toString(),
                    transaction.amount,
                    'subtract'
                );
            } catch (budgetError) {
                console.error("Error updating budget spent amounts on deletion:", budgetError);
                // Don't fail the transaction if budget update fails
            }
        }

        // 6. Delete the transaction
        const result = await Transaction.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        return result;

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function updateTransaction(id: string, updateData: TransactionUpdateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get the original transaction
        const originalTransaction = await Transaction.findById(id).session(session);
        if (!originalTransaction) {
            throw new Error("Transaction not found");
        }

        // Get the account to access userId
        const account = await Account.findById(originalTransaction.accountId).session(session);
        if (!account) {
            throw new Error("Account not found");
        }

        // If updating amount, type, or category, we need to handle budget updates
        const needsBudgetUpdate = 
            updateData.amount !== undefined || 
            updateData.type !== undefined || 
            updateData.categoryId !== undefined;

        // If this is an expense transaction with a category, subtract the old amount from budget
        if (needsBudgetUpdate && originalTransaction.type === 'expense' && originalTransaction.categoryId) {
            try {
                await updateBudgetSpentAmounts(
                    account.userId.toString(),
                    originalTransaction.categoryId.toString(),
                    originalTransaction.amount,
                    'subtract'
                );
            } catch (budgetError) {
                console.error("Error removing old budget amount:", budgetError);
            }
        }

        // Update the transaction
        const updateResult = await Transaction.updateOne(
            { _id: id },
            {
                $set: { ...updateData },
                $inc: { __v: 1 }
            },
            { session }
        );

        // If the updated transaction is an expense with a category, add the new amount to budget
        if (needsBudgetUpdate && updateData.type === 'expense' && updateData.categoryId) {
            try {
                await updateBudgetSpentAmounts(
                    account.userId.toString(),
                    updateData.categoryId.toString(),
                    updateData.amount || originalTransaction.amount,
                    'add',
                    updateData.date || (originalTransaction.date ? new Date(originalTransaction.date) : new Date())
                );
            } catch (budgetError) {
                console.error("Error adding new budget amount:", budgetError);
            }
        }

        await session.commitTransaction();
        
        const updatedTransaction = await Transaction.findById(id).session(session);
        return updatedTransaction;

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function getTransactionsByDateRange(startDate: Date, endDate: Date, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const transactions = await Transaction.find({ date: { $gte: startDate, $lte: endDate }, userId: new mongoose.Types.ObjectId(userId) });
    return transactions;
}


export async function getTransactionsByCategory(categoryId: string, period: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const transactions = await Transaction.find({ categoryId: new mongoose.Types.ObjectId(categoryId), userId: new mongoose.Types.ObjectId(userId) });
    return transactions;
}

export async function getTransactionsByAccount(accountId: string, period: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const transactions = await Transaction.find({ accountId: new mongoose.Types.ObjectId(accountId), userId: new mongoose.Types.ObjectId(userId) });
    return transactions;
}


export async function getFinancialMetrics(userId: string, currentPeriod: string = 'month') {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    if (currentPeriod === 'month') {
        // Current month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Previous month
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    // Add more periods (week, quarter, year) as needed
    
    // Get user accounts
    const userAccounts = await Account.find({ userId: new mongoose.Types.ObjectId(userId) });
    const accountIds = userAccounts.map(account => account._id);
    
    // Current period metrics
    const currentMetrics = await getTransactionsSummary(userId, 30);
    
    // Previous period metrics (different time range)
    const previousMetrics = await getTransactionsSummary(userId, 60); // 30-60 days ago
    
    // Calculate percentages
    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    
    return {
        totalBalance: {
            current: userAccounts.reduce((sum, acc) => sum + acc.balance, 0),
            change: calculatePercentageChange(
                userAccounts.reduce((sum, acc) => sum + acc.balance, 0),
                userAccounts.reduce((sum, acc) => sum + acc.balance, 0) - (currentMetrics.income.total - currentMetrics.expense.total)
            )
        },
        monthlyIncome: {
            current: currentMetrics.income.total,
            change: calculatePercentageChange(
                currentMetrics.income.total,
                previousMetrics.income.total
            )
        },
        monthlyExpenses: {
            current: currentMetrics.expense.total,
            change: calculatePercentageChange(
                currentMetrics.expense.total,
                previousMetrics.expense.total
            )
        },
        savings: {
            current: currentMetrics.income.total - currentMetrics.expense.total,
            change: calculatePercentageChange(
                currentMetrics.income.total - currentMetrics.expense.total,
                previousMetrics.income.total - previousMetrics.expense.total
            )
        }
    };
}