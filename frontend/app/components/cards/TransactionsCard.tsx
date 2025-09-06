import { TrendingDown, TrendingUp, DollarSign, Trash2 } from "lucide-react";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { useFilteredTransactions, useDeleteTransaction } from "~/hooks/useTransactions";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { generatePaginationItems, formatCurrency } from "~/lib/utils";
import type { Transaction } from "~/types/Transactions";
import { Button } from "react-day-picker";





const formatPaymentMethod = (method: string) => {
    const methods = {
        'cash': 'Cash',
        'credit_card': 'Credit Card',
        'debit_card': 'Debit Card',
        'bank_transfer': 'Bank Transfer',
        'other': 'Other'
    };
    return methods[method as keyof typeof methods] || method;
};

export default function TransactionsCard({ filters, setFilters }: { filters: any, setFilters: any }) {
    const { data: user } = useCurrentUser();
    const { data: transactions, isLoading, error } = useFilteredTransactions(user?._id || '', filters);
    const { mutate: deleteTransaction } = useDeleteTransaction()
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;
    
    // Calculate pagination
    const totalTransactions = Array.isArray(transactions) ? transactions.length : 0;
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const currentTransactions = Array.isArray(transactions) ? transactions.slice(startIndex, endIndex) : [];
    
    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };
    
    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };
    
    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };
    
    // Reset to page 1 when transactions change
    useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);
    
    const paginationItems = generatePaginationItems(totalPages, currentPage);

    const handleDeleteTransaction = (id: string) => {
        deleteTransaction(id);
    };

    console.log(currentTransactions);


    if (isLoading) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-white">All Transactions</h1>
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg animate-pulse">
                            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-white">All Transactions</h1>
                </div>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-white mb-2">Error Loading Transactions</h3>
                    <p className="text-gray-400 mb-4">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-white">All Transactions</h1>
                    <p className="text-sm text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalTransactions)} of {totalTransactions} transactions
                    </p>
                </div>
                <div className="text-sm text-gray-400">
                    <span>All time</span>
                </div>
            </div>

            {Array.isArray(transactions) && transactions.length > 0 ? (
                <div className="space-y-3">
                    {currentTransactions.map((transaction: Transaction) => (
                        <div 
                            key={transaction._id} 
                            className="group flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/70 transition-all duration-200 cursor-pointer"
                        >
                            {/* Transaction Type Indicator */}
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                                transaction.type === 'income' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {transaction.description}
                                    </h3>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span>{transaction.categoryId?.name || 'Uncategorized'}</span>
                                    <span>•</span>
                                    <span>{formatPaymentMethod(transaction.paymentMethod)}</span>
                                    <span>•</span>
                                    <span>{new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            </div>

                            {/* Transaction Amount */}
                            <div className="flex flex-col items-end relative">

                                <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-200 flex flex-col items-end">
                                    <span className={`text-lg font-bold ${
                                        transaction.type === 'income'
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, user?.preferences?.currency || 'USD')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {transaction.accountId?.name || 'Unknown Account'}
                                    </span>
                                </div>

                                <button onClick={() => handleDeleteTransaction(transaction._id)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg absolute top-1 right-0">
                                    <Trash2 size={16} />
                                    <span className="text-sm">Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
                    <p className="text-gray-400 mb-6">Start tracking your expenses and income to see them here.</p>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Add Transaction
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={goToPreviousPage}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {paginationItems.map((item, index) => (
                                <PaginationItem key={index}>
                                    {item === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            onClick={() => goToPage(item as number)}
                                            isActive={currentPage === item}
                                            className="cursor-pointer"
                                        >
                                            {item}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={goToNextPage}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}