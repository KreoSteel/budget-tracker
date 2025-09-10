import { useCreateAccount, useAccountByUserId, useTransferMoney } from "~/hooks/useAccounts";
import Sidebar from "~/components/layouts/Sidebar";
import { useNavigate } from "react-router";
import AccountCard from "~/components/cards/AccountCard";
import { handleItemSelect } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { FaPlus } from "react-icons/fa6";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useState } from "react";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { TotalBalanceCard } from "~/components/ui/total-balance-card";  
import type { Account, CreateAccountRequest } from "~/types/Account";
import { useFinancialMetrics } from "~/hooks/useTransactions";
import AccountForm from "~/components/forms/AccountForm";
import { ProjectedRoute } from "~/components/ProjectedRoute";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function Accounts() {
  const navigate = useNavigate();
  const { mutate: createAccount, isPending, error } = useCreateAccount();
  const { data: currentUser } = useCurrentUser();
  const { data: accountsData } = useAccountByUserId();
  const { mutate: transferMoney, isPending: isTransferMoneyPending, error: transferMoneyError } = useTransferMoney();
  const { data: financialMetrics } = useFinancialMetrics(currentUser?._id || '');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState(0);

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);

  const handleCreateAccount = (accountData: CreateAccountRequest) => {
    if (!currentUser?._id) {
      console.error('No user ID available');
      return;
    }
    
    createAccount({ ...accountData, userId: currentUser._id }, {
      onSuccess: () => {
        setIsAccountFormOpen(false);
      }
    });
  };

  const handleTransfer = () => {
    if (!fromAccountId || !toAccountId || !amount || fromAccountId === toAccountId) {
      alert("Please fill in all required fields");
      return;

    }

    transferMoney({
      fromAccountId,
      toAccountId,
      amount: Number(amount)
    }, {
      onSuccess: () => {
        alert("Transfer successful");
      },
      onError: (error) => {
        alert(`Transfer failed: ${error.message || 'Unknown error'}`);
      }
    });

    const sourceAccount = accounts.find(acc => acc._id === fromAccountId);
    if (sourceAccount && sourceAccount.balance < amount) {
      alert(`Insufficient balance. Available: $${sourceAccount.balance.toFixed(2)}`);
      return;
    }

    setFromAccountId('');
    setToAccountId('');
    setAmount(0);
  };

  const accounts = accountsData?.data || [];

  return (
    <SidebarProvider>
      <ProjectedRoute>
        <div className="flex h-screen w-[60vw]">
      <Sidebar
        selectedItem={"accounts"}
        onItemSelect={(item) => handleItemSelect(item, navigate)}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-10 flex flex-col gap-8 bg-gray-900">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold text-white">Accounts</h1>
            <p className="text-lg text-gray-400">Manage your bank accounts and financial accounts.</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => setIsAccountFormOpen(true)}
            >
              <FaPlus className="size-4" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="w-full">
          <TotalBalanceCard 
            current={financialMetrics?.data?.totalBalance?.current || 0}
            change={Number(financialMetrics?.data?.totalBalance?.change.toFixed(2)) || 0}
            currency={currentUser?.preferences?.currency || 'USD'}
            lastUpdated="Just now"
          />
        </div>

        {/* Transfer Section */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-lg border-2 border-gray-800/80 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Transfer Money</h2>
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            {/* From Account */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-300">From Account</Label>
              <Select value={fromAccountId} onValueChange={(value) => setFromAccountId(value)}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-500 transition-all duration-200">
                  <SelectValue placeholder="Select from account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {accounts.map((account: Account) => (
                    <SelectItem key={account._id} value={account._id} className="text-white hover:bg-gray-600 cursor-pointer">
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Available: ${accounts.find(acc => acc._id === fromAccountId)?.balance.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Amount */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-300">Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-500 transition-all duration-200"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {/* To Account */}
              <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-300">To Account</Label>
              <Select value={toAccountId} onValueChange={(value) => setToAccountId(value)}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-500 transition-all duration-200">
                  <SelectValue placeholder="Select to account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {accounts.map((account: Account) => (
                    <SelectItem key={account._id} value={account._id} className="text-white hover:bg-gray-600 cursor-pointer">
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Current: ${accounts.find(acc => acc._id === toAccountId)?.balance.toFixed(2) || '0.00'}
              </p>
            </div>

            {/* Transfer Button */}
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-gray-300 opacity-0">Action</Label>
              <Button
                variant="default"
                className="w-full"
                onClick={handleTransfer}
                disabled={isTransferMoneyPending || !fromAccountId || !toAccountId || !amount || fromAccountId === toAccountId}
              >
                {isTransferMoneyPending ? "Transferring..." : "Transfer"}
              </Button>
            </div>  
          </div>
        </div>

        {/* Accounts Section */}
        <div className="flex-1">
          <AccountCard />
        </div>
      </div>

      {/* Account Form */}
      <AccountForm 
        isOpen={isAccountFormOpen} 
        onClose={() => setIsAccountFormOpen(false)}
        onSubmit={handleCreateAccount}
        isSubmitting={isPending}
      />
        </div>
      </ProjectedRoute>
    </SidebarProvider>
  );
}