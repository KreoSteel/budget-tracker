
import { useState } from "react";
import { CircleStar, Calendar, Edit3, Trash2 } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { useGoals } from "~/hooks/useGoals";
import { calculateGoalProgress, getProgressVariant, formatCurrency as formatGoalCurrency, getDaysRemaining } from "~/lib/goalUtils";
import { generatePaginationItems } from "~/lib/utils";
import type { Goal } from "~/types/Goal";
import { Button } from "../ui/button";


export default function GoalsCard() {
  const { data: currentUser } = useCurrentUser();
  const { data: goals } = useGoals(currentUser?._id || '');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const goalsPerPage = 4;
  
  // Calculate pagination
  const totalGoals = goals?.length || 0;
  const totalPages = Math.ceil(totalGoals / goalsPerPage);
  const startIndex = (currentPage - 1) * goalsPerPage;
  const endIndex = startIndex + goalsPerPage;
  const currentGoals = goals?.slice(startIndex, endIndex) || [];

  function TypeOfGoal({ goal }: { goal: Goal }) {
    if (goal.priority === 'low') {
      return <span className="text-sm text-green-400 bg-green-500/20 px-3 py-1.5 rounded-xl">Low</span>
    } else if (goal.priority === 'medium') {
      return <span className="text-sm text-yellow-400 bg-yellow-500/40 px-3 py-1.5 rounded-xl">Medium</span>
    } else {
      return <span className="text-sm text-red-400 bg-red-500/20 px-3 py-1.5 rounded-xl">High</span>
    }
  }

  return (
    
    <div className="flex flex-col gap-7 w-full bg-gray-900  from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl hover:translate-y-[-5px] transition-all duration-300 border border-gray-800/80 shadow-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Your Goals</h1>
        {totalPages > 1 && (
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6">
      {currentGoals && Array.isArray(currentGoals) && currentGoals.length > 0 ? (
        currentGoals.map((goal) => {
          const goalProgress = calculateGoalProgress(goal);
          const progressVariant = getProgressVariant(goalProgress.progressPercentage);
          
          return (
            <div key={goal._id} className="border border-gray-700/50 bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span>
                  <CircleStar size={22} className="text-purple-400" />
                </span>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl font-semibold text-white">{goal.name}</h1>
                    <p className="text-sm text-gray-400">{goal.description}</p>
                  </div>
                  <span className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="sm" className="hover:bg-gray-800 transition-all duration-200 cursor-pointer group">
                      <Edit3 size={16} className="text-gray-400 group-hover:text-blue-400 transition-all duration-200" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-800  transition-all duration-200 cursor-pointer group">
                      <Trash2 size={16} className="text-gray-400 group-hover:text-red-400 transition-all duration-200" />
                    </Button>
                  </span>
                </div>
              </div>
              
              {/* Progress Bar with Color Variants */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progress</span>
                  <span className="text-white font-medium">{goalProgress.progressPercentage}%</span>
                </div>
                <Progress 
                  value={goalProgress.progressPercentage} 
                  max={100} 
                  variant={progressVariant}
                  size="md"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatGoalCurrency(goal.currentAmount, currentUser?.preferences.currency || 'USD')}</span>
                  <span>{formatGoalCurrency(goal.targetAmount, currentUser?.preferences.currency || 'USD')}</span>
                </div>
              </div>

              {/* Remaining Amount */}
              <div className="flex flex-col gap-1 text-center items-center justify-center">
                <h1 className="text-md text-gray-300">Remaining</h1>
                <h1 className="text-2xl font-semibold text-orange-400">{formatGoalCurrency(goalProgress.remainingAmount, currentUser?.preferences.currency || 'USD')}</h1>
              </div>

              {/* Days Remaining */}
              <div className="flex items-center gap-1.5">
                {getDaysRemaining(goal.targetDate) ? (
                  <>
                    <Calendar size={16} className="text-gray-400" />
                    <p className="text-sm text-gray-400">{getDaysRemaining(goal.targetDate)} days left</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No target date</p>
                )}
                <span className="ml-auto">
                  <TypeOfGoal goal={goal} />
                </span>
              </div>
            </div>
          )
        })
      ) : (
        <div className="col-span-2 text-center text-gray-400 py-8">No goals found</div>
      )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(prev => prev - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {generatePaginationItems(totalPages, currentPage).map((item, index) => (
                <PaginationItem key={index}>
                  {typeof item === 'number' ? (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(item);
                      }}
                      isActive={item === currentPage}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}