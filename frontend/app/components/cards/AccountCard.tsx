import { useAccountByUserId } from "~/hooks/useAccounts";
import { useAuth } from "~/contexts/AuthContext";
import { formatCurrency } from "~/lib/utils";
import { Edit3, Trash2 } from "lucide-react";

export default function AccountCard() {
    const { user, isAuthenticated } = useAuth();
    const { data: accounts, isPending, error } = useAccountByUserId(user?._id || "");


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {accounts && accounts.length > 0 ? (
                accounts.map((account) => (
                    <div 
                        key={account._id} 
                        className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-200"
                    >
                        {/* Header with icon and actions */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{account.name}</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                    <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Balance section */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</p>
                        </div>
                        
                        {/* Account details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Type</span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-200 font-medium">
                                    {account.type}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Bank</span>
                                <span className="text-sm text-gray-200">
                                    {account.bankName || 'No bank'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Status and last updated */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-400">Active</span>
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
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">No accounts found</h3>
                        <p className="text-gray-500 text-sm">Create your first account to start tracking your finances.</p>
                    </div>
                </div>
            )}
        </div>
    );
}