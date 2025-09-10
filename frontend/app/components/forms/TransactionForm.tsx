import { useState } from "react";
import type { CreateTransactionRequest } from "~/types/Transactions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionRequest) => void;
  isSubmitting?: boolean;
  accounts?: Array<{ _id: string; name: string; balance: number }>;
  categories?: Array<{ _id: string; name: string }>;
}

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false,
  accounts = [],
  categories = []
}: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    amount: 0,
    description: '',
    type: 'expense',
    accountId: '',
    categoryId: '',
    date: new Date().toLocaleDateString('en-GB'), // Today's date in DD/MM/YYYY format
    paymentMethod: 'cash'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Coffee at Starbucks"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Transaction Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CreateTransactionRequest['type'] }))}
              >
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
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {accounts.map(account => (
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
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">No Category</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id} className="text-white hover:bg-gray-700">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Payment Method
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
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
          </div>
          
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.type || !formData.accountId || !formData.amount || !formData.description}
              variant="default"
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}