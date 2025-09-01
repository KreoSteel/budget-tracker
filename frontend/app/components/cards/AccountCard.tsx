import { useAccountByUserId } from "~/hooks/useAccounts";
import { formatCurrency } from "~/lib/utils";
import { Edit3, Trash2, AlertTriangle, Wallet, PiggyBank, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useDeleteAccount, useUpdateAccount } from "~/hooks/useAccounts";
import { Switch } from "../ui/switch";
import { useState } from "react";
import type { Account } from "~/types/Account";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { useQueryClient } from "@tanstack/react-query";


export default function AccountCard() {
    const { data: currentUser, isPending: currentUserLoading } = useCurrentUser();
    const { mutate: updateAccount } = useUpdateAccount();
    const { mutate: deleteAccount } = useDeleteAccount();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const { data: accounts, isPending: accountsLoading } = useAccountByUserId({
        limit: itemsPerPage,
        page: currentPage,
        sort: 'createdAt',
        order: 'desc'
    });
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [showHiddenAccounts, setShowHiddenAccounts] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        bankName: '',
        balance: 0,
        isActive: true
    });

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
          case 'cash': return <Wallet className="w-6 h-6 text-green-500" />;
          case 'checking': return <DollarSign className="w-6 h-6 text-blue-500" />;
          case 'savings': return <PiggyBank className="w-6 h-6 text-green-500" />;
          case 'credit_card': return <CreditCard className="w-6 h-6 text-red-500" />;
          case 'investment': return <TrendingUp className="w-6 h-6 text-purple-500" />;
          default: return <DollarSign className="w-6 h-6 text-gray-500" />;
        }
      };

    const handleEdit = (account: any) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            type: account.type,
            bankName: account.bankName || '',
            balance: account.balance,
            isActive: account.isActive
        });
        setIsEditDialogOpen(true);
    };

    const handleSave = () => {
        if (!editingAccount) return;
        updateAccount({
            _id: editingAccount._id,
            userId: editingAccount.userId,
            currency: editingAccount.currency,
            createdAt: editingAccount.createdAt,
            updatedAt: new Date(),
            ...formData
        } as Account);
        setEditingAccount((prev: any) => prev ? { ...prev, ...formData } : null);
    };

    const handleDelete = (accountId: string) => {
        deleteAccount(accountId);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditingAccount(null);
        setFormData({
            name: '',
            type: '',
            bankName: '',
            balance: 0,
            isActive: true
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }

    const totalPages = accounts?.pagination?.totalPages || 1;
    const hasNextPage = accounts?.pagination?.hasNextPage || false;
    const hasPrevPage = accounts?.pagination?.hasPrevPage || false;

    // Filter accounts based on visibility preference
    const visibleAccounts = accounts?.data?.filter((account: Account) =>
        showHiddenAccounts ? true : account.isActive
    ) || [];

    const hiddenAccountsCount = accounts?.data?.filter((account: Account) => !account.isActive).length || 0;

    if (currentUserLoading || accountsLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div className="col-span-full text-center py-12">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                        <p className="text-gray-500 text-sm">Loading accounts...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toggle for showing hidden accounts */}
            {hiddenAccountsCount > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700 mx-4">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="show-hidden-accounts"
                            checked={showHiddenAccounts}
                            onCheckedChange={setShowHiddenAccounts}
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-500 cursor-pointer"
                        />
                        <Label htmlFor="show-hidden-accounts" className="text-sm text-white font-medium cursor-pointer">
                            Show hidden accounts ({hiddenAccountsCount})
                        </Label>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {visibleAccounts && visibleAccounts.length > 0 ? (
                    visibleAccounts.map((account) => (
                        <div
                            key={account._id}
                            className={`bg-gray-900 rounded-xl border p-6 hover:border-gray-700 transition-all duration-200 ${account.isActive
                                ? 'border-gray-800'
                                : 'border-gray-600 bg-gray-800/50'
                                }`}
                        >
                            {/* Header with icon and actions */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${account.isActive
                                        ? 'bg-blue-500/20'
                                        : 'bg-gray-500/20'
                                        }`}>
                                        {getAccountTypeIcon(account.type)}
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-semibold ${account.isActive ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            {account.name}
                                        </h2>
                                        {!account.isActive && (
                                            <span className="text-xs text-gray-500">(Hidden)</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Dialog open={isEditDialogOpen && editingAccount?._id === account._id} onOpenChange={(open) => {
                                        if (!open) {
                                            handleCloseEditDialog();
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-gray-800 hover:scale-105 transition-all duration-200 cursor-pointer group"
                                                onClick={() => handleEdit(account)}
                                            >
                                                <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader className="space-y-3">
                                                <DialogTitle className="text-xl font-semibold text-white">Edit Account</DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    Update your account information and settings.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="account-name" className="text-sm font-medium text-gray-200">
                                                        Account Name
                                                    </Label>
                                                    <Input
                                                        id="account-name"
                                                        type="text"
                                                        placeholder="Enter account name"
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-text"
                                                    />
                                                </div>

                                                <div className="space-y-2 user-select-none">
                                                    <Label htmlFor="account-type" className="text-sm font-medium text-gray-200">
                                                        Account Type
                                                    </Label>
                                                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-600 [&:focus]:caret-transparent [&:focus]:text-white [&:focus]:outline-none">
                                                            <SelectValue placeholder="Select account type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gray-800 border-gray-700">
                                                            <SelectItem value="cash" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Cash</SelectItem>
                                                            <SelectItem value="checking" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Checking</SelectItem>
                                                            <SelectItem value="savings" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Savings</SelectItem>
                                                            <SelectItem value="credit_card" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Credit Card</SelectItem>
                                                            <SelectItem value="investment" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Investment</SelectItem>
                                                            <SelectItem value="other" className="text-white hover:bg-gray-700 cursor-pointer caret-transparent">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="account-bank" className="text-sm font-medium text-gray-200">
                                                        Bank Name
                                                    </Label>
                                                    <Input
                                                        id="account-bank"
                                                        type="text"
                                                        placeholder="Enter bank name"
                                                        value={formData.bankName}
                                                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-text"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="account-balance" className="text-sm font-medium text-gray-200">
                                                        Account Balance
                                                    </Label>
                                                    <Input
                                                        id="account-balance"
                                                        type="text"
                                                        placeholder="0.00"
                                                        value={formData.balance}
                                                        onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                                                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 transition-all duration-200 cursor-text"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="deactivate-account" className="text-sm font-medium text-gray-200 cursor-pointer">
                                                            Account Status
                                                        </Label>
                                                        <p className="text-xs text-gray-500">
                                                            {formData.isActive ? 'Active and visible' : 'Hidden from main view'}
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        id="deactivate-account"
                                                        checked={formData.isActive}
                                                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-500 cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                                <Button
                                                    type="button"
                                                    onClick={handleSave}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCloseEditDialog}
                                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-gray-800 hover:scale-105 transition-all duration-200 cursor-pointer group"
                                            >
                                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md ">
                                            <DialogHeader className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-xl font-semibold text-white">Delete Account</DialogTitle>
                                                        <DialogDescription className="text-gray-400">
                                                            This action cannot be undone.
                                                        </DialogDescription>
                                                    </div>
                                                </div>
                                            </DialogHeader>

                                            <div className="py-4">
                                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                                    <p className="text-sm text-gray-300 mb-2">
                                                        Are you sure you want to delete <span className="font-semibold text-white">{account.name}</span>?
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        This will permanently remove the account and all associated data from your budget tracker.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-800">
                                                <DialogClose asChild>
                                                <Button
                                                    type="button"
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                    onClick={() => handleDelete(account._id)}
                                                >
                                                    Delete Account
                                                </Button>
                                                </DialogClose>
                                                <DialogClose asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>



                            {/* Balance section */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                                <p className={`text-2xl font-bold ${account.isActive ? 'text-white' : 'text-gray-400'}`}>
                                    {formatCurrency(account.balance, currentUser?.preferences?.currency || 'USD')}
                                </p>
                            </div>

                            {/* Account details */}
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Type</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${account.isActive
                                        ? 'bg-gray-800 text-gray-200'
                                        : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {account.type}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Bank</span>
                                    <span className={`text-sm ${account.isActive ? 'text-gray-200' : 'text-gray-500'
                                        }`}>
                                        {account.bankName || 'No bank'}
                                    </span>
                                </div>
                            </div>

                            {/* Status and last updated */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-500'
                                        }`}></div>
                                    <span className="text-xs text-gray-400">
                                        {account.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">Just now</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                {showHiddenAccounts ? 'No hidden accounts' : 'No active accounts'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {showHiddenAccounts
                                    ? 'All your accounts are currently visible.'
                                    : 'Create your first account to start tracking your finances.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="col-span-full flex justify-center mt-6">
                        <Pagination >
                            <PaginationContent className="gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (hasPrevPage) handlePageChange(currentPage - 1);
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
                                            isActive={page === currentPage}
                                            className={`px-3 py-2 rounded-md transition-all duration-200 ${page === currentPage
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
                                            if (hasNextPage) handlePageChange(currentPage + 1);
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

            </div>
        </div>
    );
}