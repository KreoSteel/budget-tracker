import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Search, 
  Plus,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "~/components/ui/dialog";
import { TotalBalanceCard } from "~/components/ui/total-balance-card";
import Sidebar from "~/components/layouts/Sidebar";
import { handleItemSelect } from "~/lib/utils";

export default function Transactions() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-[60vw]">
            <Sidebar
                selectedItem="transactions"
                onItemSelect={(item) => handleItemSelect(item, navigate)}
            />
            <div className="flex-1 p-10 flex flex-col gap-3 bg-gray-900">
                <h1 className="text-4xl font-semibold text-white">Transactions</h1>
                <p className="text-lg text-gray-400">Manage your transactions and get a better understanding of your spending and saving habits.</p>
                <TotalBalanceCard current={0} change={0} />
            </div>
        </div>
    );
}
