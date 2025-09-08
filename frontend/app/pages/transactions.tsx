import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { FaPlus } from "react-icons/fa6";
import { CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { TotalBalanceCard } from "~/components/ui/total-balance-card";
import Sidebar from "~/components/layouts/Sidebar";
import { useGetUserCategories } from "~/hooks/useCategories";
import { handleItemSelect } from "~/lib/utils";
import { useFinancialMetrics } from "~/hooks/useTransactions";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { format } from "date-fns";
import TransactionsCard from "~/components/cards/TransactionsCard";
import type { Category } from "~/types/Category";
import type { Account } from "~/types/Account";
import { useAccountByUserId } from "~/hooks/useAccounts";
import { useCreateTransaction } from "~/hooks/useTransactions";
import type { Transaction } from "~/types/Transactions";
import { ProjectedRoute } from "~/components/ProjectedRoute";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function Transactions() {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const { data: financialMetrics } = useFinancialMetrics(user?._id || '');
    const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useGetUserCategories(user?._id || '');
    const { data: accountsResponse, isLoading: accountsLoading, error: accountsError } = useAccountByUserId();
    const { mutate: createTransaction, isPending: isCreateTransactionPending, error: createTransactionError } = useCreateTransaction();
    const accounts = accountsResponse?.data || [];
    const categories = categoriesResponse?.data || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        categoryId: 'all',
        accountId: 'all',
        dateRange: {
            from: undefined as Date | undefined,
            to: undefined as Date | undefined,
        },
    })
    const [formData, setFormData] = useState({
        type: '',
        accountId: '',
        categoryId: '',
        amount: '',
        paymentMethod: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const transactionData: any = {
                accountId: formData.accountId,
                type: formData.type as 'income' | 'expense',
                amount: parseFloat(formData.amount),
                description: formData.description,
                ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod }),
                ...(formData.categoryId && formData.categoryId !== 'all' && { categoryId: formData.categoryId }),
            };
            createTransaction(transactionData);
            setIsDialogOpen(false);
            console.log('Transaction created successfully!');
        } catch (error) {
            console.error('Error creating transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        // Special handling for amount field to limit decimal places
        if (field === 'amount') {
            // Allow only numbers and up to 2 decimal places
            const regex = /^\d*\.?\d{0,2}$/;
            if (value === '' || regex.test(value)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: value
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };


    return (
        <SidebarProvider>
            <ProjectedRoute>
                <div className="flex h-screen w-[60vw]">
                <Sidebar
                    selectedItem="transactions"
                    onItemSelect={(item) => handleItemSelect(item, navigate)}
                />
                <div className="flex-1 flex flex-col bg-gray-900 gap-10">
                    {/* Header Section */}
                    <div className="px-10 pt-10 flex flex-col gap-8 bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-semibold text-white">Transactions</h1>
                                <p className="text-lg text-gray-400">Manage your transactions and get a better understanding of your spending and saving habits.</p>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="gradient" size="lg">
                                        <FaPlus className="size-4" />
                                        Add Transaction
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-gray-700 shadow-2xl">
                                    <DialogHeader className="text-center pb-4">
                                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                            Add Transaction
                                        </DialogTitle>
                                        <DialogDescription className="text-sm text-gray-300 mt-1">
                                            Add a new transaction to your financial tracker.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                    Transaction Type
                                                </Label>
                                                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-9">
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="income" className="text-white hover:bg-gray-700">Income</SelectItem>
                                                        <SelectItem value="expense" className="text-white hover:bg-gray-700">Expense</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                                                    Account
                                                </Label>
                                                <Select value={formData.accountId} onValueChange={(value) => handleInputChange('accountId', value)}>
                                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        {accounts.map((account: Account) => (
                                                            <SelectItem key={account._id} value={account._id} className="text-white hover:bg-gray-700">
                                                                {account.name} (${account.balance.toFixed(2)})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                                    Category
                                                </Label>
                                                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-9">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="all" className="text-white hover:bg-gray-700">No Category</SelectItem>
                                                        {categories.map((category: Category) => (
                                                            <SelectItem key={category._id} value={category._id} className="text-white hover:bg-gray-700">
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                                    Amount
                                                </Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.amount}
                                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 h-9"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                    Payment Method
                                                </Label>
                                                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 h-9">
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="cash" className="text-white hover:bg-gray-700">Cash</SelectItem>
                                                        <SelectItem value="credit_card" className="text-white hover:bg-gray-700">Credit Card</SelectItem>
                                                        <SelectItem value="debit_card" className="text-white hover:bg-gray-700">Debit Card</SelectItem>
                                                        <SelectItem value="bank_transfer" className="text-white hover:bg-gray-700">Bank Transfer</SelectItem>
                                                        <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                                                    Description
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter description"
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 h-9"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                    <DialogFooter className="flex gap-3 pt-4">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white transition-all duration-200 h-9"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !formData.type || !formData.accountId || !formData.amount || !formData.description}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Add Transaction'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {/* Total Balance Card */}
                        <div>
                            <TotalBalanceCard
                                current={financialMetrics?.data?.totalBalance?.current || 0}
                                change={Number(financialMetrics?.data?.totalBalance?.change.toFixed(2)) || 0}
                                currency={user?.preferences?.currency || 'EUR'}
                                lastUpdated="Just now"
                            />
                        </div>
                    </div>
                    {/* Transactions Search Section */}
                    <div className="px-10">
                        <div className='bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-gray-700 shadow-2xl'>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        Search transactions
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Search by description, category, or amount..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        Transaction Type
                                    </Label>
                                    <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                        <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200">
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                            <SelectItem value="all" className="text-white hover:bg-gray-700">All Types</SelectItem>
                                            <SelectItem value="income" className="text-white hover:bg-gray-700">Income</SelectItem>
                                            <SelectItem value="expense" className="text-white hover:bg-gray-700">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                        Category
                                    </Label>
                                    <Select value={filters.categoryId} onValueChange={(value) => setFilters({ ...filters, categoryId: value })}>
                                        <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
                                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                            <SelectItem value="all" className="text-white hover:bg-gray-700">All Categories</SelectItem>
                                            {categoriesLoading ? (
                                                <SelectItem value="loading" disabled className="text-gray-400">Loading categories...</SelectItem>
                                            ) : categoriesError ? (
                                                <SelectItem value="error" disabled className="text-red-400">Error loading categories</SelectItem>
                                            ) : Array.isArray(categories) && categories.length > 0 ? (
                                                categories.map((category: Category) => (
                                                    <SelectItem key={category._id} value={category._id} className="text-white hover:bg-gray-700">
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="empty" disabled className="text-gray-400">No categories found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        By Account
                                    </Label>
                                    <Select value={filters.accountId} onValueChange={(value) => setFilters({ ...filters, accountId: value })}>
                                        <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200">
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                            <SelectItem value="all" className="text-white hover:bg-gray-700">All Accounts</SelectItem>
                                            {accounts.map((account: Account) => (
                                                <SelectItem key={account._id} value={account._id} className="text-white hover:bg-gray-700">
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        Date Range
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" onClick={() => setFilters({
                                                    ...filters, dateRange: {
                                                        from: undefined,
                                                        to: undefined,
                                                    }
                                                })} />
                                                {filters.dateRange.from ? (
                                                    filters.dateRange.to ? (
                                                        <>
                                                            {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                                            {format(filters.dateRange.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(filters.dateRange.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date range</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 shadow-2xl" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={filters.dateRange.from}
                                                selected={filters.dateRange}
                                                onSelect={(value) => {
                                                    if (value) {
                                                        const newDateRange = {
                                                            from: value.from ?? filters.dateRange.from,
                                                            to: value.to ?? filters.dateRange.to,
                                                        };
                                                        setFilters({ ...filters, dateRange: newDateRange });
                                                    }
                                                }}
                                                numberOfMonths={2}
                                                className="bg-gray-800 text-white"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* All Transactions Section */}
                    <div className="px-10 bg-gray-900">
                        <div className="pb-10 shadow-2xl shadow-gray-900/50">
                            <TransactionsCard filters={filters} setFilters={setFilters} />
                        </div>
                    </div>
                </div>
                </div>
            </ProjectedRoute>
        </SidebarProvider>
    );
}
