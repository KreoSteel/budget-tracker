import { ArrowLeftRight, CircleStar, CircleUser, HomeIcon, LogIn, LogOut, SquareStar } from "lucide-react";
import { FaChartLine, FaWallet } from "react-icons/fa6";
import { ChartPie } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";


export default function Home() {

  return (
      <div className="flex h-screen">
        <Sidebar className="h-full bg-gradient-to-br from-[var(--color-background-dark-primary)] to-[var(--color-background-dark-secondary)] flex flex-col">
            <SidebarHeader className="flex justify-center items-center py-10 font-work-sans">
              <h1 className="text-2xl logo-gradient-animated font-semibold">💸FinanceTracker</h1>
            </SidebarHeader>
            
            <div className="border-b border-[var(--color-border-dark)] w-[80%] mx-auto flex-shrink-0"></div>
            
            <SidebarContent className="flex-1 flex flex-col px-8 py-10 font-open-sans">
              <SidebarMenu className="flex flex-col gap-10 flex-1">
                <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300  sidebar-menu-hover cursor-pointer">
                  <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                    <FaChartLine/> Dashboard
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem className="sidebar-menu-item-fixed rounded-xl py-4 px-3 flex items-center transition-all duration-300 sidebar-menu-hover cursor-pointer">
                  <SidebarMenuButton className="cursor-pointer text-xl flex items-center gap-3 font-semibold text-[var(--color-text-light)]">
                    <FaWallet/> Accounts
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
                  <SidebarMenuButton className="cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105 bg-[var(--color-sidebar-hover)]">
                    <LogIn size={22} strokeWidth={2} /> 
                    <span className="font-medium text-[var(--color-text-light)]">Login</span>
                  </SidebarMenuButton>
                  
                  <SidebarMenuButton className="cursor-pointer active:scale-95 text-lg flex items-center justify-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-all duration-300 hover:scale-105">
                    <CircleUser size={22} strokeWidth={2} /> 
                    <span className="font-medium text-[var(--color-text-light)]">Register</span>
                  </SidebarMenuButton>
                </SidebarFooter>
              </div>
            </SidebarContent>
        </Sidebar>
      </div>
  );
}