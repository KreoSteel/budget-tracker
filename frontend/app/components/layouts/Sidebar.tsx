import { ArrowLeftRight, CircleStar, CircleUser, LogIn, LogOut, ChartPie, Settings, Sun, Moon } from "lucide-react";
import { FaChartLine, FaWallet } from "react-icons/fa6";
import { Sidebar as SidebarUI, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { authService } from "~/services/authService";
import { DialogContent, Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "~/hooks/useTheme";

  interface SidebarProps {
    selectedItem: string;
    onItemSelect: (item: string) => void;
  }

export default function Sidebar({
  selectedItem,
  onItemSelect
}: SidebarProps) {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const isAuthenticated = authService.isAuthenticated();
  const queryClient = useQueryClient();
  const { theme, updateTheme, isLoading: themeLoading } = useTheme();

  // Update currentUser when it changes
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    window.location.reload(); // Simple reload to update the UI
  };

  const setCurrency = async (value: string) => {
    if (!currentUser?._id) return;
    
    try {
      const result = await authService.updateUserPreferences(currentUser._id, { currency: value });
      if (result.success) {
        // Update the local state to trigger re-render
        setCurrentUser(result.user || null);
        
        // Invalidate all queries that depend on current user data
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["goals"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });
        queryClient.invalidateQueries({ queryKey: ["netWorth"] });
      } else {
        console.error('Failed to update currency:', result.error);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  const setTheme = async (value: string) => {
    await updateTheme(value as 'light' | 'dark');
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
              <Dialog>
                <DialogTrigger>
                  <Button
                    variant="ghost"
                    className="w-full cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105 text-[var(--color-text-light)]"
                  >
                    <Settings size={22} strokeWidth={2} />
                    <span className="font-medium">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <div className="flex flex-col gap-4 w-full">
                      {/* Currency Selection */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-gray-300">Select currency (default: USD)</Label>
                        <Select value={currentUser?.preferences.currency} onValueChange={(value) => setCurrency(value)}>
                          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white z-50">
                            <SelectItem value="USD" className="text-white hover:bg-gray-600 cursor-pointer">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR" className="text-white hover:bg-gray-600 cursor-pointer">EUR - Euro</SelectItem>
                            <SelectItem value="GBP" className="text-white hover:bg-gray-600 cursor-pointer">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD" className="text-white hover:bg-gray-600 cursor-pointer">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="UAH" className="text-white hover:bg-gray-600 cursor-pointer">UAH - Ukrainian Hryvnia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Theme Selection */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-gray-300">Select theme</Label>
                        <Select value={theme} onValueChange={(value) => setTheme(value)} disabled={themeLoading}>
                          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 h-9">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white z-50">
                            <SelectItem value="light" className="text-white hover:bg-gray-600 cursor-pointer flex items-center gap-2">
                              <Sun size={16} />
                              Light Mode
                            </SelectItem>
                            <SelectItem value="dark" className="text-white hover:bg-gray-600 cursor-pointer flex items-center gap-2">
                              <Moon size={16} />
                              Dark Mode
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarFooter>
          </div>
        </SidebarContent>
      </SidebarUI>
    );
  }
