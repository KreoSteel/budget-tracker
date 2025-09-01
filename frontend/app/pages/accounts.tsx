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
import type { Account } from "~/types/Account";
import { useFinancialMetrics } from "~/hooks/useTransactions";

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Add state for form fields
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    type: '',
    bankName: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.balance || !formData.type) {
      alert("Please fill in all required fields");
      return;
    }

    createAccount({
      _id: '',
      name: formData.name,
      balance: Number(formData.balance),
      type: formData.type,
      bankName: formData.bankName,
      isActive: true,
      currency: currentUser?.preferences?.currency || 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUser?._id || '',
    } as Account);

    // Reset form and close dialog
    setFormData({
      name: '',
      balance: '',
      type: '',
      bankName: ''
    });
    setIsDialogOpen(false);
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      balance: '',
      type: '',
      bankName: ''
    });
    setIsDialogOpen(false);
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <FaPlus className="size-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Account</DialogTitle>
                  <DialogDescription>
                    Add a new account to your financial tracker.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input
                      id="account-name"
                      type="text"
                      placeholder="Name"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-balance">Account Balance</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={formData.balance}
                      onChange={(e) => handleInputChange('balance', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-600 [&:focus]:caret-transparent [&:focus]:text-white [&:focus]:outline-none">
                        <SelectValue placeholder="Select a type" />
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
                    <Label htmlFor="account-bank">Account Bank Name</Label>
                    <Input
                      id="account-bank"
                      type="text"
                      placeholder="Bank name"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}