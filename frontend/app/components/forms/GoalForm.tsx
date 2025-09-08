import { useState, useEffect } from "react";
import { useCreateGoal, useUpdateGoal } from "~/hooks/useGoals";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import type { CreateGoalRequest, Goal, UpdateGoalRequest } from "~/types/Goal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "~/components/ui/dialog";

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: Goal | null;
}

export default function GoalForm({ isOpen, onClose, editingGoal }: GoalFormProps) {
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal();
  const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoal();
  const { data: currentUser } = useCurrentUser();
  
  const isEditing = !!editingGoal;
  const isPending = isCreating || isUpdating;
  
  const [formData, setFormData] = useState<CreateGoalRequest>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date().toISOString().split('T')[0],
    description: '',
    priority: 'medium'
  });

  // Update form data when editing goal changes
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        targetAmount: editingGoal.targetAmount,
        currentAmount: editingGoal.currentAmount,
        targetDate: editingGoal.targetDate || new Date().toISOString().split('T')[0],
        description: editingGoal.description || '',
        priority: editingGoal.priority
      });
    } else {
      setFormData({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date().toISOString().split('T')[0],
        description: '',
        priority: 'medium'
      });
    }
  }, [editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?._id) {
      console.error('No user ID available');
      return;
    }
    
    if (isEditing && editingGoal) {
      // Update existing goal
      const updateData: UpdateGoalRequest = {
        _id: editingGoal._id,
        name: formData.name,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount,
        targetDate: formData.targetDate,
        description: formData.description,
        priority: formData.priority
      };
      
      updateGoal(updateData, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      // Create new goal
      createGoal({ ...formData, userId: currentUser._id }, {
        onSuccess: () => {
          setFormData({
            name: '',
            targetAmount: 0,
            currentAmount: 0,
            targetDate: new Date().toISOString().split('T')[0],
            description: '',
            priority: 'medium'
          });
          onClose();
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-gray-700 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-300 mt-1">
            {isEditing ? 'Update your financial goal details.' : 'Set up a new financial goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Goal Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Emergency Fund"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Target Amount
              </Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: Number(e.target.value) || 0 }))}
                placeholder="10000"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                Current Amount
              </Label>
              <Input
                id="currentAmount"
                type="number"
                value={formData.currentAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: Number(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Target Date
              </Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as CreateGoalRequest['priority'] }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 h-9">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="low" className="text-white hover:bg-gray-700">Low</SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-gray-700">Medium</SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-gray-700">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                Description (Optional)
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your goal"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 h-9"
              />
            </div>
          </div>

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
              disabled={isPending || !formData.name || !formData.targetAmount}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Goal' : 'Create Goal')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
