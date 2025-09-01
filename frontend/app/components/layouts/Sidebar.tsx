import { ArrowLeftRight, CircleStar, CircleUser, LogIn, LogOut, ChartPie } from "lucide-react";
import { FaChartLine, FaWallet } from "react-icons/fa6";
import { Sidebar as SidebarUI, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { authService } from "~/services/authService";

interface SidebarProps {
  selectedItem: string;
  onItemSelect: (item: string) => void;
}

export default function Sidebar({
  selectedItem,
  onItemSelect
}: SidebarProps) {
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    window.location.reload(); // Simple reload to update the UI
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaChartLine />,
      onClick: () => onItemSelect('dashboard')
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: <FaWallet />,
      onClick: () => onItemSelect('accounts')
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ArrowLeftRight strokeWidth={2} />,
      onClick: () => onItemSelect('transactions')
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <CircleStar strokeWidth={1.75} size={26} />,
      onClick: () => onItemSelect('goals')
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <ChartPie size={25} />,
      onClick: () => onItemSelect('budgets')
    }
  ];

  return (
    <SidebarUI className="h-full bg-gradient-to-br from-[var(--color-background-dark-primary)] to-[var(--color-background-dark-secondary)] flex flex-col">
      <SidebarHeader className="flex justify-center items-center py-10 font-work-sans">
        <h1 className="text-3xl logo-gradient-animated font-semibold">FinanceTracker</h1>
      </SidebarHeader>

      <div className="border-b border-[var(--color-border-dark)] w-[80%] mx-auto flex-shrink-0"></div>

      <SidebarContent className="flex-1 flex flex-col px-8 py-10 font-open-sans">
        {/* Show user info if logged in */}
        {isAuthenticated && currentUser && (
          <div className="mb-6 p-4 bg-[var(--color-sidebar-hover)] rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-gradient-blue)] to-[var(--color-gradient-purple)] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-white font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-[var(--color-text-light)] font-semibold text-lg">{currentUser.name}</h3>
              <p className="text-[var(--color-text-muted)] text-sm">{currentUser.email}</p>
              <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                Currency: {currentUser.preferences.currency} | Theme: {currentUser.preferences.theme}
              </div>
            </div>
          </div>
        )}

        <SidebarMenu className="flex flex-col gap-5 flex-1">
          {menuItems.map((item) => (
            <SidebarMenuItem 
              key={item.id}
              className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer"
              onClick={item.onClick}
              data-active={selectedItem === item.id}
            >
              <SidebarMenuButton 
                isActive={selectedItem === item.id}
                className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]"
              >
                {item.icon} {item.label}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
              <div className="text-center text-[var(--color-text-muted)] text-sm">
                Please login from the dashboard
              </div>
            )}
          </SidebarFooter>
        </div>
      </SidebarContent>
    </SidebarUI>
  );
}
