import { useState } from "react";
import type { CreateCategoryRequest } from "~/types/Category";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "~/components/ui/dialog";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => void;
  isSubmitting?: boolean;
  userId: string;
}

export default function CategoryForm({ isOpen, onClose, onSubmit, isSubmitting = false, userId }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    type: 'expense',
    userId: userId
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
            Create New Category
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-300 mt-1">
            Create a new category for organizing your transactions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Category Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Groceries"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Category Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CreateCategoryRequest['type'] }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="income" className="text-white hover:bg-gray-700">Income</SelectItem>
                  <SelectItem value="expense" className="text-white hover:bg-gray-700">Expense</SelectItem>
                </SelectContent>
              </Select>
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
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}