export interface Goal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  description?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  description?: string;
  priority?: Goal['priority'];
  userId?: string;
}

export interface UpdateGoalRequest {
  _id: string;
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  description?: string;
  isActive?: boolean;
  priority?: Goal['priority'];
}

export interface GoalProgress {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  daysRemaining?: number;
  isOnTrack: boolean;
  estimatedCompletionDate?: string;
}

export interface GoalMilestone {
  goalId: string;
  milestoneId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
}

