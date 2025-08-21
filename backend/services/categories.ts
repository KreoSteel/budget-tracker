import Category from '../models/category';
import mongoose, { ObjectId } from 'mongoose';
import Transaction from '../models/transaction';

export function getAllCategories(userId: ObjectId) {
    return Category.find({ userId: userId, isActive: true });
}

export function getCategoryById(id: string) {
    return Category.findById(id);
}

export function createCategory(name: string, type: string, userId: ObjectId, isDefault: boolean = false) {
    const category = new Category({ name, type, userId, isDefault });
    return category.save();
}

export async function updateCategory(id: string, updateData: Partial<typeof Category>) {
    const result = await Category.findById(id);
    if (!result) {
        throw new Error("Category not found");
    }

    const updateResult = await Category.updateOne(
        { _id: id },
        {
            $set: { ...updateData },
            $inc: { __v: 1 }
        }
    );
    console.log('Updated result:', updateResult);
    const updatedCategory = await Category.findById(id);

    return updatedCategory;
}

export async function deleteCategory(id: string) {
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
        throw new Error("Category not found");
    }
    return result;
}

export async function getCategoryByUserId(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const categories = await Category.find({ userId: new mongoose.Types.ObjectId(userId) });
    return categories;
}

export async function getCategorySpending(categoryId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const transactions = await Transaction.find({ categoryId: new mongoose.Types.ObjectId(categoryId), userId: new mongoose.Types.ObjectId(userId) });
    const spending = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    return spending;
}

export async function getCategoryIncome(categoryId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId format");
    }
    const transactions = await Transaction.find({ categoryId: new mongoose.Types.ObjectId(categoryId), userId: new mongoose.Types.ObjectId(userId) });
    const income = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    return income;
}