import { useState, useEffect } from "react";
import { useCreateBudget, useUpdateBudget } from "~/hooks/useBudgets";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { useGetUserCategories } from "~/hooks/useCategories";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "~/components/ui/dialog";
import type { CreateBudgetRequest, BudgetCategory } from "~/types/Budget";

interface BudgetFormProps {
    isOpen: boolean;
    onClose: () => void;
    budget?: any;
}

export default function BudgetForm({ isOpen, onClose, budget }: BudgetFormProps) {
    const { data: user } = useCurrentUser();
    const { data: categories } = useGetUserCategories(user?._id || "");
    const { mutate: createBudget, isPending: isCreating } = useCreateBudget();
    const { mutate: updateBudget, isPending: isUpdating } = useUpdateBudget();

    const [formData, setFormData] = useState<CreateBudgetRequest>({
        name: "",
        period: "monthly",
        startDate: "",
        endDate: "",
        totalAmount: 0,
        categories: [],
        userId: user?._id || ""
    });

    const [categoryAllocations, setCategoryAllocations] = useState<{ [key: string]: number }>({});
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [newCategoryId, setNewCategoryId] = useState<string>("");

    useEffect(() => {
        if (budget) {
            setFormData({
                name: budget.name,
                period: budget.period,
                startDate: new Date(budget.startDate).toISOString().split('T')[0],
                endDate: new Date(budget.endDate).toISOString().split('T')[0],
                totalAmount: budget.totalAmount,
                categories: budget.categories || [],
                userId: user?._id || ""
            });
            
            // Set category allocations and selected categories
            const allocations: { [key: string]: number } = {};
            const selected: string[] = [];
            budget.categories?.forEach((cat: BudgetCategory) => {
                allocations[cat.categoryId] = cat.allocatedAmount;
                selected.push(cat.categoryId);
            });
            setCategoryAllocations(allocations);
            setSelectedCategories(selected);
        } else {
            // Reset form for new budget
            setFormData({
                name: "",
                period: "monthly",
                startDate: "",
                endDate: "",
                totalAmount: 0,
                categories: [],
                userId: user?._id || ""
            });
            setCategoryAllocations({});
            setSelectedCategories([]);
        }
    }, [budget, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?._id) return;

        // Calculate remaining amount for unallocated categories
        const allocatedTotal = Object.values(categoryAllocations).reduce((sum, amount) => sum + amount, 0);
        const remainingAmount = formData.totalAmount - allocatedTotal;

        // Create categories array for all selected categories (including 0 amounts)
        const budgetCategories: BudgetCategory[] = selectedCategories
            .map(categoryId => ({
                categoryId,
                allocatedAmount: categoryAllocations[categoryId] || 0,
                spentAmount: 0
            }));

        // Note: We don't add unallocated money as a separate category
        // The remaining amount will be tracked separately or can be allocated to existing categories

        const budgetData: CreateBudgetRequest = {
            ...formData,
            categories: budgetCategories,
            userId: user._id
        };

        if (budget) {
            updateBudget({ budgetId: budget._id, budgetData });
        } else {
            createBudget(budgetData);
        }
        
        onClose();
    };

    const handleCategoryAllocationChange = (categoryId: string, amount: number) => {
        setCategoryAllocations(prev => ({
            ...prev,
            [categoryId]: amount
        }));
    };

    const handleAddCategory = () => {
        if (newCategoryId && !selectedCategories.includes(newCategoryId)) {
            setSelectedCategories(prev => [...prev, newCategoryId]);
            setNewCategoryId("");
        }
    };

    const handleRemoveCategory = (categoryId: string) => {
        setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        setCategoryAllocations(prev => {
            const newAllocations = { ...prev };
            delete newAllocations[categoryId];
            return newAllocations;
        });
    };

    const calculateAllocatedTotal = () => {
        return selectedCategories.reduce((sum, categoryId) => sum + (categoryAllocations[categoryId] || 0), 0);
    };

    const remainingAmount = formData.totalAmount - calculateAllocatedTotal();

    const availableCategories = categories?.data?.filter(cat => !selectedCategories.includes(cat._id)) || [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-gray-700 shadow-2xl">
                <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        {budget ? "Edit Budget" : "Create New Budget"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-300 mt-1">
                        {budget ? "Update your budget settings and allocations." : "Create a new budget to track your spending and save money."}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    Budget Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Monthly Budget"
                                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-9"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                    Period
                                </Label>
                                <Select
                                    value={formData.period}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, period: value as any }))}
                                >
                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                        <SelectItem value="weekly" className="text-white hover:bg-gray-700">Weekly</SelectItem>
                                        <SelectItem value="monthly" className="text-white hover:bg-gray-700">Monthly</SelectItem>
                                        <SelectItem value="quarterly" className="text-white hover:bg-gray-700">Quarterly</SelectItem>
                                        <SelectItem value="yearly" className="text-white hover:bg-gray-700">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                    Start Date
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-9"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                    End Date
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 h-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                Total Budget Amount
                            </Label>
                            <Input
                                id="totalAmount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.totalAmount || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00"
                                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 h-9"
                                required
                            />
                        </div>

                        {/* Category Selection */}
                        {categories?.data && categories.data.length > 0 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                                        Add Categories
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 h-9">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-600">
                                                {availableCategories.map((category) => (
                                                    <SelectItem key={category._id} value={category._id} className="text-white hover:bg-gray-700">
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={!newCategoryId}
                                            className="bg-pink-600 hover:bg-pink-700 text-white h-9 px-4"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Selected Categories and Allocations */}
                                {selectedCategories.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-semibold text-gray-200">Category Allocations</Label>
                                            <div className="text-xs text-gray-300">
                                                Allocated: ${calculateAllocatedTotal().toFixed(2)} / ${formData.totalAmount.toFixed(2)}
                                                {remainingAmount !== 0 && (
                                                    <span className={remainingAmount > 0 ? "text-green-400" : "text-red-400"}>
                                                        {" "}({remainingAmount > 0 ? "+" : ""}${remainingAmount.toFixed(2)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {selectedCategories.map((categoryId) => {
                                                const category = categories.data.find(cat => cat._id === categoryId);
                                                if (!category) return null;
                                                
                                                return (
                                                    <div key={categoryId} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                                                        <div className="flex-1">
                                                            <Label htmlFor={`category-${categoryId}`} className="text-sm font-medium text-gray-200">
                                                                {category.name}
                                                            </Label>
                                                        </div>
                                                        <div className="w-32">
                                                            <Input
                                                                id={`category-${categoryId}`}
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={categoryAllocations[categoryId] || ''}
                                                                onChange={(e) => handleCategoryAllocationChange(categoryId, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                                                placeholder="0.00"
                                                                className="bg-gray-600/50 border-gray-500 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 h-8"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleRemoveCategory(categoryId)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white h-8 w-8 p-0"
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-3 pt-4">
                        <DialogClose asChild>
                            <Button 
                                type="button" 
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={isCreating || isUpdating || !formData.name}
                            variant="default"
                            className="flex-1"
                        >
                            {isCreating || isUpdating ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}