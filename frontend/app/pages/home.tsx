import { ArrowLeftRight, CircleStar, CircleUser, LogIn, LogOut, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { FaChartLine, FaWallet, FaArrowTrendUp } from "react-icons/fa6";
import { ChartPie } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useAccounts, useGetNetWorth } from "~/hooks/useAccounts";
import { LoginDialog } from "~/components/auth/LoginDialog";
import { RegisterDialog } from "~/components/auth/RegisterDialog";
import { useTransactions } from "~/hooks/useTransactions";
import { useFinancialMetrics } from "~/hooks/useFinancialMetrics";

export default function Home() {
  const { user, isAuthenticated, login, logout, register, error, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Safe currency formatting function
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';

    // Add commas for thousands and format to 2 decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.preferences.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleLogin = async (email: string, password: string) => {
    const success = await login({ email, password });
    if (success) {
      setIsLoginOpen(false);
      setFormError(null);
    } else {
      setFormError(error || 'Login failed');
    }
    return success;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const success = await register({ name, email, password });
    if (success) {
      setIsRegisterOpen(false);
      setFormError(null);
    } else {
      setFormError(error || 'Registration failed');
    }
    return success;
  };

  const handleLogout = async () => {
    await logout();
  };


  const { data: accounts } = useAccounts();
  const { data: netWorth } = useGetNetWorth(user?._id);
  const { data: financialMetrics } = useFinancialMetrics(user?._id);
  const { data: recentTransactions } = useTransactions(user?._id, accounts?.[0]?._id, {
    recent: true,
    limit: 5
  });

  console.log(financialMetrics);

  return (
    <div className="flex h-screen">
      <Sidebar className="h-full bg-gradient-to-br from-[var(--color-background-dark-primary)] to-[var(--color-background-dark-secondary)] flex flex-col">
        <SidebarHeader className="flex justify-center items-center py-10 font-work-sans">
          <h1 className="text-2xl logo-gradient-animated font-semibold">💸 Finance Tracker</h1>
        </SidebarHeader>

        <div className="border-b border-[var(--color-border-dark)] w-[80%] mx-auto flex-shrink-0"></div>

        <SidebarContent className="flex-1 flex flex-col px-8 py-10 font-open-sans">
          {/* Show user info if logged in */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-[var(--color-sidebar-hover)] rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-blue)] to-[var(--color-gradient-purple)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-[var(--color-text-light)] font-semibold text-lg">{user.name}</h3>
                <p className="text-[var(--color-text-muted)] text-sm">{user.email}</p>
                <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Currency: {user.preferences.currency} | Theme: {user.preferences.theme}
                </div>
              </div>
            </div>
          )}

          <SidebarMenu className="flex flex-col gap-5 flex-1">
            <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300  sidebar-menu-hover cursor-pointer">
              <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                <FaChartLine /> Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer">
              <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                <FaWallet /> Accounts
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer">
              <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                <ArrowLeftRight strokeWidth={2} /> Transactions
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer">
              <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                <CircleStar strokeWidth={1.75} size={26} /> Goals
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer">
              <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                <ChartPie size={25} />Budgets
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-auto pt-6 border-t border-[var(--color-border-dark)]">
            <SidebarFooter className="flex flex-col gap-4 py-4 font-work-sans">
              {isAuthenticated ? (
                /* Logout Button */
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105 text-[var(--color-text-light)]"
                >
                  <LogOut size={22} strokeWidth={2} />
                  <span className="font-medium">Logout</span>
                </Button>
              ) : (
                <>
                  {/* Login Button */}
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    variant="ghost"
                    className="w-full cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105 bg-[var(--color-sidebar-hover)] text-[var(--color-text-light)]"
                  >
                    <LogIn size={22} strokeWidth={2} />
                    <span className="font-medium">Login</span>
                  </Button>

                  {/* Register Button */}
                  <Button
                    onClick={() => setIsRegisterOpen(true)}
                    variant="ghost"
                    className="w-full cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105 text-[var(--color-text-light)]"
                  >
                    <CircleUser size={22} strokeWidth={2} />
                    <span className="font-medium">Register</span>
                  </Button>
                </>
              )}
            </SidebarFooter>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Dashboard Content */}
      <div className="flex-1 p-10 flex flex-col gap-10 font-source-sans bg-[var(--color-background-dark-secondary)]">
        <span className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold">Welcome to FinanceTracker!👋</h1>
          <p className="text-lg text-gray-500">Here you can manage your finances and get a better understanding of your spending and saving habits.</p>
        </span>

        <div className="grid grid-cols-4 gap-6 w-full">
          {/* Total Balance Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <DollarSign size={30} />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span><FaArrowTrendUp /></span>
                  <span className={`text-sm ${
                    (typeof financialMetrics?.data?.totalBalance?.change === 'number' && financialMetrics.data.totalBalance.change >= 0)
                      ? 'text-green-300'
                      : 'text-red-300'
                  }`}>
                    {(typeof financialMetrics?.data?.totalBalance?.change === 'number'
                      ? (financialMetrics.data.totalBalance.change >= 0 ? '↗' : '↘')
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
              <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
            </CardContent>
          </Card>

          {/* Monthly Income Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-500 to-green-600">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaChartLine className="text-2xl" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span><FaArrowTrendUp /></span>
                  <span>+12.5%</span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Monthly Income</p>
              </span>
              <p className="text-3xl font-bold">$5,800.00</p>
            </CardContent>
          </Card>

          {/* Monthly Expenses Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-500 to-red-600">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaChartLine className="text-2xl rotate-180" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span><FaArrowTrendUp className="rotate-180" /></span>
                  <span>-3.1%</span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Monthly Expenses</p>
              </span>
              <p className="text-3xl font-bold">$3,245.50</p>
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card className="w-full rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-500 to-purple-600">
            <CardContent className="flex flex-col gap-6">
              <span className="flex items-center justify-between text-xl">
                <FaWallet className="text-2xl" />
                <span className="flex gap-2 items-center text-green-300/90">
                  <span><FaArrowTrendUp /></span>
                  <span>+15.8%</span>
                </span>
              </span>
              <span className="flex text-xl font-semibold">
                <p>Savings</p>
              </span>
              <p className="text-3xl font-bold">$9,205.25</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-9">
          <div className="flex flex-col gap-6 w-1/2 bg-[var(--color-card-background)] rounded-2xl p-6">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-semibold">Recent Transactions</h1>
              <Button variant="default" className="text-blue-500 hover:text-blue-500/70 cursor-pointer">View All</Button>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {recentTransactions?.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between w-full rounded-2xl py-4 px-2">
                  <div className="flex items-center gap-4">
                    {transaction.type === 'income' ? <TrendingUp size={35} className="text-green-600 bg-green-300 p-2 rounded-full" /> : <TrendingDown size={35} className="text-red-600 bg-red-300 p-2 rounded-full" />}
                    <span>
                      <p className="text-lg font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}</p>
                    </span>
                  </div>
                  <span className={`font-semibold ${transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                  } text-lg`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between w-1/2 bg-[var(--color-card-background)] rounded-2xl p-6">
            <h1 className="text-2xl font-semibold">Financial Goals</h1>
            <Button variant="default" className="text-blue-500 hover:text-blue-500/70 cursor-pointer">Manage Goals</Button>
          </div>
        </div>
      </div>

      {/* Auth Dialogs */}
      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLogin={handleLogin}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
          setFormError(null);
        }}
        isLoading={isLoading}
        error={formError}
      />

      <RegisterDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onRegister={handleRegister}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
          setFormError(null);
        }}
        isLoading={isLoading}
        error={formError}
      />
    </div>
  );
}