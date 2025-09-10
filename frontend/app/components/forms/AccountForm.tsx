import { useState, useEffect } from "react";
import type { CreateAccountRequest } from "~/types/Account";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "~/components/ui/dialog";
import { useCurrentUser } from "~/hooks/useCurrentUser";

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountRequest) => void;
  isSubmitting?: boolean;
}

export default function AccountForm({ isOpen, onClose, onSubmit, isSubmitting = false }: AccountFormProps) {
  const { data: currentUser } = useCurrentUser();
  
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: '',
    type: 'checking',
    balance: 0,
    currency: 'USD', // Default currency - will be set automatically
    bankName: '',
    userId: currentUser?._id || ''
  });

  // Update userId when currentUser changes
  useEffect(() => {
    if (currentUser?._id) {
      setFormData(prev => ({ ...prev, userId: currentUser._id }));
    }
  }, [currentUser?._id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?._id) {
      console.error('No user ID available');
      return;
    }
    
    onSubmit({ ...formData, userId: currentUser._id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-gray-700 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Add New Account
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-300 mt-1">
            Add a new financial account to track your money.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Account Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Chase Checking"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Account Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="checking" className="text-white hover:bg-gray-700">Checking</SelectItem>
                  <SelectItem value="savings" className="text-white hover:bg-gray-700">Savings</SelectItem>
                  <SelectItem value="credit" className="text-white hover:bg-gray-700">Credit Card</SelectItem>
                  <SelectItem value="investment" className="text-white hover:bg-gray-700">Investment</SelectItem>
                  <SelectItem value="cash" className="text-white hover:bg-gray-700">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                Initial Balance
              </Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: Number(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Bank Name (Optional)
              </Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="e.g., Chase Bank"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 h-9"
              />
            </div>
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
              disabled={isSubmitting || !formData.name}
              variant="default"
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}