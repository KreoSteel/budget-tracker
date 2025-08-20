import Category from '../models/category';
import { ObjectId } from 'mongoose';

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