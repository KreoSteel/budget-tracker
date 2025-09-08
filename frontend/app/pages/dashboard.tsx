import { DollarSign, TrendingDown, TrendingUp, CircleStar } from "lucide-react";
import { FaChartLine, FaWallet } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useState } from "react";
import { useAccounts, useGetNetWorth } from "~/hooks/useAccounts";
import { useFinancialMetrics, useRecentTransactions } from "~/hooks/useTransactions";
import { useGoals } from "~/hooks/useGoals";
import { calculateGoalProgress, getProgressVariant, formatCurrency as formatGoalCurrency } from "~/lib/goalUtils";
import Sidebar from "~/components/layouts/Sidebar";
import { useNavigate } from "react-router";
import { formatCurrency } from "~/lib/utils.js";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { authService } from "~/services/authService";
import ProjectedRoute from "~/components/ProjectedRoute";
import { SidebarProvider } from "~/components/ui/sidebar";
import type { User } from "~/types/User";



function AuthenticatedDashboard({ selectedItem, onItemSelect, onLogout }: {
  selectedItem: string;
  onItemSelect: (item: string) => void;
  onLogout: () => void;
}) {
  const { data: currentUser, isPending: currentUserLoading } = useCurrentUser();
  const { data: goals, isPending: goalsLoading } = useGoals(currentUser?._id || '', { limit: 3 });
  const { data: accounts, isPending: accountsLoading } = useAccounts();
  const { data: netWorth, isPending: netWorthLoading } = useGetNetWorth();
  const { data: financialMetrics, isPending: metricsLoading } = useFinancialMetrics(currentUser?._id || '');
  const { data: recentTransactions, isPending: transactionsLoading } = useRecentTransactions(currentUser?._id || '', 6);
  const navigate = useNavigate();
  if (currentUserLoading || goalsLoading || accountsLoading || netWorthLoading || metricsLoading || transactionsLoading) {
    return (
      <div className="flex h-screen w-[60vw]">
        <Sidebar
          selectedItem={selectedItem}
          onItemSelect={onItemSelect}
        />
        <div className="flex-1 p-10 flex items-center justify-center font-source-sans bg-[var(--color-background-dark-secondary)]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <h1 className="text-2xl font-semibold text-white mb-4">Loading Dashboard...</h1>
            <p className="text-gray-400">Please wait while we fetch your financial data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-[60vw]">
      <Sidebar
        selectedItem={selectedItem}
        onItemSelect={onItemSelect}
      />

      {/* Dashboard Content */}
      <div className="flex-1 p-10 flex flex-col gap-10 font-source-sans bg-[var(--color-background-dark-secondary)]">
        <span className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-semibold">Welcome to Dashboard</h1>
              <p className="text-lg leading-relaxed text-gray-400 max-w-3xl">
                Get a quick overview of your accounts, goals, and recent transactions. Track your financial progress and stay on top of your money.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-white">Welcome, {currentUser?.name || 'User'}</span>
                <Button onClick={onLogout} variant="gradient">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </span>

        <div className="grid grid-cols-4 gap-6 w-full">
          {/* Total Balance Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <DollarSign size={30} />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span className={`flex items-center gap-1 text-[18px] ${(typeof financialMetrics?.data?.totalBalance?.change === 'number' && financialMetrics.data.totalBalance.change >= 0)
                      ? 'text-emerald-400'
                      : 'text-red-400'
                    }`}>
                    {(typeof financialMetrics?.data?.totalBalance?.change === 'number'
                      ? (financialMetrics.data.totalBalance.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />)
                      : '--')}
                    {typeof financialMetrics?.data?.totalBalance?.change === 'number'
                      ? `${Math.abs(financialMetrics.data.totalBalance.change).toFixed(1)}%`
                      : '--'}
                  </span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Total Balance</p>
              </span>
              <p className="text-3xl font-bold">
                {financialMetrics?.data?.totalBalance?.current
                  ? formatCurrency(financialMetrics.data.totalBalance.current, currentUser?.preferences?.currency || 'USD')
                  : formatCurrency(netWorth || 0, currentUser?.preferences?.currency || 'USD')
                }
              </p>
            </CardContent>
          </Card>

          {/* Monthly Income Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaChartLine className="text-2xl" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span className={`flex items-center gap-1 text-[18px] ${(typeof financialMetrics?.data?.monthlyIncome?.change === 'number' && financialMetrics.data.monthlyIncome.change >= 0)
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                    }`}>
                    {(typeof financialMetrics?.data?.monthlyIncome?.change === 'number'
                      ? (financialMetrics.data.monthlyIncome.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />)
                      : '--')}
                    {typeof financialMetrics?.data?.monthlyIncome?.change === 'number'
                      ? `${Math.abs(financialMetrics.data.monthlyIncome.change).toFixed(1)}%`
                      : '--'}
                  </span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Monthly Income</p>
              </span>
              <p className="text-3xl font-bold">
                {financialMetrics?.data?.monthlyIncome?.current
                  ? formatCurrency(financialMetrics.data.monthlyIncome.current, currentUser?.preferences?.currency || 'USD')
                  : '0.00'
                }
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaChartLine className="text-2xl rotate-180" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span className={`flex items-center gap-1 text-[18px] ${(typeof financialMetrics?.data?.monthlyExpenses?.change === 'number' && financialMetrics.data.monthlyExpenses.change <= 0)
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                    }`}>
                    {(typeof financialMetrics?.data?.monthlyExpenses?.change === 'number'
                      ? (financialMetrics.data.monthlyExpenses.change <= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />)
                      : '--')}
                    {typeof financialMetrics?.data?.monthlyExpenses?.change === 'number'
                      ? `${Math.abs(financialMetrics.data.monthlyExpenses.change).toFixed(1)}%`
                      : '--'}
                  </span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Monthly Expenses</p>
              </span>
              <p className="text-3xl font-bold">
                {financialMetrics?.data?.monthlyExpenses?.current
                  ? formatCurrency(financialMetrics.data.monthlyExpenses.current, currentUser?.preferences?.currency || 'USD')
                  : '0.00'
                }
              </p>
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaWallet className="text-2xl" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span className={`flex items-center gap-1 text-[18px] ${(typeof financialMetrics?.data?.savings?.change === 'number' && financialMetrics.data.savings.change >= 0)
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                    }`}>
                    {(typeof financialMetrics?.data?.savings?.change === 'number'
                      ? (financialMetrics.data.savings.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />)
                      : '--')}
                    {typeof financialMetrics?.data?.savings?.change === 'number'
                      ? `${Math.abs(financialMetrics.data.savings.change).toFixed(1)}%`
                      : '--'}
                  </span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Savings</p>
              </span>
              <p className="text-3xl font-bold">{financialMetrics?.data?.savings?.current ? formatCurrency(financialMetrics.data.savings.current, currentUser?.preferences?.currency || 'USD') : '0.00'}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-9">
          <div className="flex flex-col gap-6 w-1/2 bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-semibold text-white">Recent Transactions</h1>
              <Button variant="default" className="text-blue-500 hover:text-blue-500/70 cursor-pointer" onClick={() => navigate('/transactions')}>View All</Button>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {Array.isArray(recentTransactions) && recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between w-full rounded-xl py-4 px-4 bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      {transaction.type === 'income' ? <TrendingUp size={35} className="text-green-600 bg-green-300 p-2 rounded-full" /> : <TrendingDown size={35} className="text-red-600 bg-red-300 p-2 rounded-full" />}
                      <span>
                        <p className="text-lg font-semibold text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-400">{new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}</p>
                      </span>
                    </div>
                    <span className={`font-semibold ${transaction.type === 'income'
                      ? 'text-green-400'
                      : 'text-red-400'
                      } text-lg`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount, currentUser?.preferences?.currency || 'USD')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400">No recent transactions found</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-1/2 bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all duration-200">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-semibold text-white">Financial Goals</h1>
              <Button variant="default" className="text-blue-500 hover:text-blue-500/70 cursor-pointer" onClick={() => navigate('/goals')}>Manage Goals</Button>
            </div>
            <div className="flex flex-col gap-5 w-full">
              {goals && Array.isArray(goals) && goals.length > 0 ? (
                goals.map((goal) => {
                  const progress = calculateGoalProgress(goal);
                  return (
                    <div key={goal._id} className="flex flex-col gap-3 w-full rounded-xl py-4 px-4 bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <CircleStar size={24} className="text-purple-400" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                            {goal.description && (
                              <p className="text-sm text-gray-400">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-purple-400">
                          {progress.progressPercentage}%
                        </span>
                      </div>

                      <Progress
                        value={progress.progressPercentage}
                        className="w-full"
                        variant={getProgressVariant(progress.progressPercentage)}
                        size="md"
                      />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {formatGoalCurrency(goal.currentAmount, currentUser?.preferences?.currency || 'USD')} saved
                        </span>
                        <span className="text-lg font-bold text-purple-400">
                          {progress.progressPercentage}%
                        </span>
                      </div>

                      {goal.targetDate && (
                        <div className="text-xs text-gray-500 text-center">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg font-medium">No goals set yet</p>
                  <p className="text-sm">Create your first financial goal to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const navigate = useNavigate();

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);

    if (item === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${item}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <AuthenticatedDashboard
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      onLogout={handleLogout}
    />
  );
}

export default function ProtectedDashboard() {
  return (
    <SidebarProvider>
      <ProjectedRoute requireAuth={true} redirectTo="/">
        <Dashboard />
      </ProjectedRoute>
    </SidebarProvider>
  );
}