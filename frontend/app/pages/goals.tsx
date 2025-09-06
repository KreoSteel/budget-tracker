import { useEffect, useState } from "react";
import { useGoals } from "~/hooks/useGoals";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import Sidebar from "~/components/layouts/Sidebar";
import { handleItemSelect } from "~/lib/utils";
import { useNavigate } from "react-router";
import { TotalBalanceCard } from "~/components/ui/total-balance-card";
import { useFinancialMetrics } from "~/hooks/useTransactions";
import { CircleStar } from "lucide-react";


export default function Goals() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: financialMetrics } = useFinancialMetrics(currentUser?._id || '');
    return (
        <div className="flex h-screen w-[60vw]">
            <Sidebar
                selectedItem="goals"
                onItemSelect={(item) => handleItemSelect(item, navigate)}
            />
            <div className="flex-1 p-10 flex flex-col gap-8 bg-gray-900">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-semibold text-white">Financial Goals</h1>
                        <p className="text-lg text-gray-400">Manage your financial goals and track your progress.</p>
                    </div>
                </div>

                {/* Total Balance Card */}
                <TotalBalanceCard
                    current={financialMetrics?.data.totalBalance.current || 0}
                    change={financialMetrics?.data.totalBalance.change || 0}
                    currency={currentUser?.preferences.currency || 'USD'}
                    lastUpdated="Just now"
                />

                <div className="flex flex-col gap-5 w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-2xl hover:translate-y-[-5px] transition-all duration-300 border-2 border-gray-800/80 shadow-xl">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-semibold text-white flex items-center gap-4">
                            <CircleStar className="text-purple-400" size={28} /> Goals Summary
                        </h1>
                        <h1 className="text-md text-gray-400">5 total goals</h1>
                    </div>
                    <div className="flex justify-between items-center text-center px-10">
                        <span className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold text-purple-400">5</h1>
                            <p className="text-md text-gray-400">Active Goals</p>
                        </span>
                        <span className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold text-green-400">53%</h1>
                            <p className="text-md text-gray-400">Average Progress</p>
                        </span>
                        <span className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold text-orange-400">30,000</h1>
                            <p className="text-md text-gray-400">Total Left to Save</p>
                        </span>
                        <span className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold text-red-400">100,000</h1>
                            <p className="text-md text-gray-400">Total Target Amount</p>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}