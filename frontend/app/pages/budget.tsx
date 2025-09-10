import Sidebar from "~/components/layouts/Sidebar";
import { ProjectedRoute } from "~/components/ProjectedRoute";
import { SidebarProvider } from "~/components/ui/sidebar";
import { handleItemSelect } from "~/lib/utils";
import { TotalBalanceCard } from "~/components/ui/total-balance-card";
import { useNavigate } from "react-router";
import { useFinancialMetrics } from "~/hooks/useTransactions";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import BudgetCard from "~/components/cards/BudgetCard";
import BudgetForm from "~/components/forms/BudgetForm";
import CategoryForm from "~/components/forms/CategoryForm";
import type { Category, CreateCategoryRequest } from "~/types/Category";
import { Button } from "~/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
    AlertTriangle,
    Plus,
    PieChart,
    Eye,
    EyeOff,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { useBudgetAlerts, useBudgets } from "~/hooks/useBudgets";
import { useGetUserCategories, useCreateCategory, useDeleteCategory } from "~/hooks/useCategories";
import { formatCurrency } from "~/lib/utils";

export default function Budget() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: financialMetrics } = useFinancialMetrics(currentUser?._id || '');
    const { data: budgets } = useBudgets(currentUser?._id || '', { limit: undefined });
    const { data: categoriesResponse } = useGetUserCategories(currentUser?._id || '');
    const [showHiddenBudgets, setShowHiddenBudgets] = useState(false);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<string>('');
    
    // Category management hooks
    const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory(currentUser?._id || '');
    const { mutate: deleteCategory, isPending: isDeletingCategory } = useDeleteCategory(currentUser?._id || '');
    
    // Create a map of category IDs to names for easy lookup
    const categories = categoriesResponse?.data || [];
    const categoryMap = new Map(categories.map(cat => [cat._id, cat.name]));

    // Category management handlers
    const handleCreateCategory = (categoryData: CreateCategoryRequest) => {
        createCategory(categoryData, {
            onSuccess: () => {
                setIsCategoryFormOpen(false);
            }
        });
    };

    const handleDeleteCategory = () => {
        if (!selectedCategoryToDelete) return;
        
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            deleteCategory(selectedCategoryToDelete, {
                onSuccess: () => {
                    setSelectedCategoryToDelete('');
                }
            });
        }
    };

    return (
        <SidebarProvider>
            <ProjectedRoute>
                <div className="flex h-screen w-[60vw]">
                    <Sidebar
                        selectedItem="budgets"
                        onItemSelect={(item) => handleItemSelect(item, navigate)}
                    />
                    <div className="bg-gray-900 flex-1 p-10 flex flex-col gap-8">
                        {/* Header Section */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-semibold text-white">Budgets</h1>
                                <p className="text-lg text-gray-400">Manage your budgets and get a better understanding of your spending and saving habits.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="default" size="lg" onClick={() => setIsBudgetFormOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Budget
                                </Button>
                            </div>
                        </div>

                        {/* Total Balance Card */}
                        <TotalBalanceCard
                            current={financialMetrics?.data?.totalBalance?.current || 0}
                            change={Number(financialMetrics?.data?.totalBalance?.change.toFixed(2)) || 0}
                            currency={currentUser?.preferences?.currency || 'USD'}
                            lastUpdated="Just now"
                        />

                        {/* Category Management Section */}
                        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl border-2 border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">Manage Categories</h3>
                                <span className="text-sm text-gray-400">{categories.length} categories</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Add Category Button */}
                                <Button
                                    variant="default"
                                    size="lg"
                                    onClick={() => setIsCategoryFormOpen(true)}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
                                </Button>
                                
                                {/* Delete Category Section */}
                                <div className="flex flex-col sm:flex-row gap-3 flex-1 items-center">
                                    <Select
                                        value={selectedCategoryToDelete}
                                        onValueChange={setSelectedCategoryToDelete}
                                    >
                                        <SelectTrigger className="h-12 bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200">
                                            <SelectValue placeholder="Select category to delete" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                            {categories.length === 0 ? (
                                                <SelectItem value="empty" disabled className="text-gray-400">
                                                    No categories available
                                                </SelectItem>
                                            ) : (
                                                categories.map((category: Category) => (
                                                    <SelectItem 
                                                        key={category._id} 
                                                        value={category._id} 
                                                        className="text-white hover:bg-gray-700"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${category.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                            {category.name} ({category.type})
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={handleDeleteCategory}
                                        disabled={!selectedCategoryToDelete || isDeletingCategory}
                                        className="h-12 text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-400/50 whitespace-nowrap font-semibold transition-all duration-300 hover:border-red-400 hover:shadow-lg"
                                    >
                                        {isDeletingCategory ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Delete Category
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Budgets List */}
                        <div className="space-y-6">
                            <BudgetCard showHidden={showHiddenBudgets} onToggleHidden={() => setShowHiddenBudgets(!showHiddenBudgets)} />
                        </div>

                        <BudgetForm isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)} budget={null} />
                        
                        {/* Category Form */}
                        <CategoryForm 
                            isOpen={isCategoryFormOpen} 
                            onClose={() => setIsCategoryFormOpen(false)}
                            onSubmit={handleCreateCategory}
                            isSubmitting={isCreatingCategory}
                            userId={currentUser?._id || ''}
                        />
                    </div>
                </div>
            </ProjectedRoute>
        </SidebarProvider>
    );
}
