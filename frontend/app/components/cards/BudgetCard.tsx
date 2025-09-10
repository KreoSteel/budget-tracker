import { useBudgets, useDeleteBudget, useUpdateBudget } from "~/hooks/useBudgets";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { useGetUserCategories } from "~/hooks/useCategories";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { formatCurrency } from "~/lib/utils";
import BudgetForm from "../forms/BudgetForm";
import {
    Target,
    Calendar,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Home,
    Car,
    Utensils,
    Gamepad2,
    PiggyBank,
    ShoppingBag,
    Heart,
    Zap,
    Wallet,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

interface BudgetCardProps {
    showHidden?: boolean;
    onToggleHidden?: () => void;
}

export default function BudgetCard({ showHidden = false, onToggleHidden }: BudgetCardProps) {
    const { data: currentUser } = useCurrentUser();
    const { data: budgets } = useBudgets(currentUser?._id || '', { limit: undefined });
    const { data: categoriesResponse } = useGetUserCategories(currentUser?._id || '');
    const { mutate: deleteBudget } = useDeleteBudget();
    const [editingBudget, setEditingBudget] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const budgetsPerPage = 2;

    const categories = categoriesResponse?.data || [];
    const categoryMap = new Map(categories.map(cat => [cat._id, cat.name]));


    const handleDeleteBudget = (budgetId: string) => {
        if (confirm("Are you sure you want to delete this budget?")) {
            deleteBudget(budgetId);
        }
    };

    const handleEditBudget = (budget: any) => {
        setEditingBudget(budget);
    };

    const filteredBudgets = budgets?.data?.filter(budget =>
        showHidden ? true : budget.isActive
    ) || [];

    // Update pagination to work with filtered budgets
    const totalFilteredBudgets = filteredBudgets.length;
    const totalPages = Math.ceil(totalFilteredBudgets / budgetsPerPage);
    
    // Reset to page 1 if current page is beyond available pages
    const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
    if (validCurrentPage !== currentPage) {
        setCurrentPage(validCurrentPage);
    }
    
    const startIndex = (validCurrentPage - 1) * budgetsPerPage;
    const endIndex = startIndex + budgetsPerPage;
    const currentBudgets = filteredBudgets.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };
    
    const hasPrevPage = validCurrentPage > 1;
    const hasNextPage = validCurrentPage < totalPages;

    if (!budgets?.data || budgets.data.length === 0) {
        return (
            <div className="flex flex-col gap-7 w-full bg-gray-900 from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl hover:translate-y-[-5px] transition-all duration-300 border border-gray-800/80 shadow-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-white">Your Budgets</h1>
                </div>
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                        <Target className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No budgets found</h3>
                    <p className="text-gray-500 text-sm">Create your first budget to start tracking your spending.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-7 w-full bg-gray-900 from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl hover:translate-y-[-5px] transition-all duration-300 border border-gray-800/80 shadow-xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">Your Budgets</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        Showing {currentBudgets.length} of {totalFilteredBudgets} budgets
                    </span>
                    {onToggleHidden && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onToggleHidden}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            {showHidden ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {showHidden ? 'Hide' : 'Show'} Inactive
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentBudgets.map((budget) => {
                    const totalSpent = budget.categories.reduce((sum: number, cat: any) => sum + cat.spentAmount, 0);
                    const progress = budget.totalAmount > 0 ? (totalSpent / budget.totalAmount) * 100 : 0;
                    const remaining = budget.totalAmount - totalSpent;
                    const isOverBudget = totalSpent > budget.totalAmount;

                    return (
                        <div key={budget._id} className={`border rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:border-gray-600 ${budget.isActive
                                ? 'border-gray-700/50 bg-gray-800/30'
                                : 'border-gray-600/50 bg-gray-800/20'
                            }`}>
                            {/* Budget Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${budget.isActive ? 'bg-blue-500/20' : 'bg-gray-500/20'
                                        }`}>
                                        <Target className={`w-5 h-5 ${budget.isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-semibold ${budget.isActive ? 'text-white' : 'text-gray-400'}`}>
                                            {budget.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-gray-700"
                                        onClick={() => handleEditBudget(budget)}
                                    >
                                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-gray-700"
                                        onClick={() => handleDeleteBudget(budget._id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                    </Button>
                                </div>
                            </div>

                            {/* Budget Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Overall Progress</span>
                                    <span className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                                        {progress.toFixed(1)}%
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(progress, 100)}
                                    className="w-full h-2"
                                />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">
                                        {formatCurrency(totalSpent, currentUser?.preferences?.currency || 'USD')} spent
                                    </span>
                                    <span className="text-gray-400">
                                        {formatCurrency(remaining, currentUser?.preferences?.currency || 'USD')} remaining
                                    </span>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-300">Categories</h4>
                                <div className="max-h-100 overflow-y-auto space-y-2 pr-2">
                                    {budget.categories
                                        .map((category: any) => {
                                            // Handle progress calculation for categories with 0 allocated amount
                                            let categoryProgress;
                                            if (category.allocatedAmount > 0) {
                                                categoryProgress = (category.spentAmount / category.allocatedAmount) * 100;
                                            } else if (category.spentAmount > 0) {
                                                // If allocated amount is 0 but we have spent money, show 100% (over budget)
                                                categoryProgress = 100;
                                            } else {
                                                categoryProgress = 0;
                                            }
                                            return { ...category, progress: categoryProgress };
                                        })
                                        .sort((a: any, b: any) => b.progress - a.progress)
                                        .map((category: any, index: number) => {
                                    const categoryProgress = category.progress;
                                    const isOverCategory = category.spentAmount > category.allocatedAmount;

                                    return (
                                        <div key={index} className="bg-gray-700/40 border border-gray-600/30 rounded-lg p-3 hover:bg-gray-700/50 transition-all duration-200">
                                            {/* Category Name and Percentage */}
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-sm font-medium text-white">
                                                    {categoryMap.get(category.categoryId) || `Category ${index + 1}`}
                                                </h5>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                                                        isOverCategory 
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                                            : categoryProgress >= 80 
                                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    }`}>
                                                        {categoryProgress.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mb-2">
                                                <Progress
                                                    value={Math.min(categoryProgress, 100)}
                                                    className="w-full h-2"
                                                />
                                                {categoryProgress > 100 && (
                                                    <div className="text-xs text-red-400 mt-1">
                                                        Over budget by {formatCurrency(category.spentAmount - category.allocatedAmount, currentUser?.preferences?.currency || 'USD')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Amount Details */}
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-400">Spent</span>
                                                    <span className="text-white font-medium">
                                                        {formatCurrency(category.spentAmount, currentUser?.preferences?.currency || 'USD')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400">Budget</span>
                                                    <span className="text-gray-300 font-medium">
                                                        {formatCurrency(category.allocatedAmount, currentUser?.preferences?.currency || 'USD')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400">Remaining</span>
                                                    <span className={`font-medium ${
                                                        (category.allocatedAmount - category.spentAmount) < 0 
                                                            ? 'text-red-400' 
                                                            : 'text-green-400'
                                                    }`}>
                                                        {formatCurrency(category.allocatedAmount - category.spentAmount, currentUser?.preferences?.currency || 'USD')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </div>

                            {/* Budget Status and Dates */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${budget.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    <span className="text-xs text-gray-400">
                                        {budget.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Over Budget Warning */}
                            {isOverBudget && (
                                <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-800/30 rounded text-red-400 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Over budget by {formatCurrency(totalSpent - budget.totalAmount, currentUser?.preferences?.currency || 'USD')}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination - moved outside of individual budget cards */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination>
                        <PaginationContent className="gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (hasPrevPage) handlePageChange(validCurrentPage - 1);
                                    }}
                                    className={`px-3 py-2 rounded-md transition-all duration-200 ${!hasPrevPage
                                        ? "pointer-events-none opacity-50 bg-gray-800 text-gray-500"
                                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white hover:scale-105 cursor-pointer"
                                        }`}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page);
                                        }}
                                        isActive={page === validCurrentPage}
                                        className={`px-3 py-2 rounded-md transition-all duration-200 ${page === validCurrentPage
                                            ? "bg-blue-600 text-white shadow-lg scale-105"
                                            : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white hover:scale-105 cursor-pointer"
                                            }`}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (hasNextPage) handlePageChange(validCurrentPage + 1);
                                    }}
                                    className={`px-3 py-2 rounded-md transition-all duration-200 ${!hasNextPage
                                        ? "pointer-events-none opacity-50 bg-gray-800 text-gray-500"
                                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white hover:scale-105 cursor-pointer"
                                        }`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Budget Edit Dialog */}
            <BudgetForm 
                isOpen={!!editingBudget} 
                onClose={() => setEditingBudget(null)} 
                budget={editingBudget} 
            />
        </div>
    );
}