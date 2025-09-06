import type { Goal } from "~/types/Goal"

export function calculateGoalProgress(goal: Goal) {
  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)
  
  return {
    progressPercentage: Math.round(progressPercentage),
    remainingAmount,
    isCompleted: goal.currentAmount >= goal.targetAmount,
    isOnTrack: progressPercentage >= 50 // Consider on track if 50% or more completed
  }
}

export function getAverageProgressPercentage(goals: Goal[]): number {
  return Number((goals.reduce((acc, goal) => acc + (goal.currentAmount / goal.targetAmount) * 100, 0) / goals.length).toFixed(2))
}

export function getTotalTargetAmount(goals: Goal[]): number {
  return goals.reduce((acc, goal) => acc + goal.targetAmount, 0)
}

export function getTotalRemainingAmount(goals: Goal[]): number {
  return goals.reduce((acc, goal) => acc + goal.targetAmount - goal.currentAmount, 0)
}

export function getAllActiveGoals(goals: Goal[]): number {
  return goals.filter((goal) => goal.isActive).length
}

export function getProgressVariant(progressPercentage: number): "success" | "warning" | "danger" {
  if (progressPercentage >= 80) return "success"
  if (progressPercentage >= 40) return "warning"
  return "danger"
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getDaysRemaining(targetDate?: string): number | null {
  if (!targetDate) return null
  
  const target = new Date(targetDate)
  const today = new Date()
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}
