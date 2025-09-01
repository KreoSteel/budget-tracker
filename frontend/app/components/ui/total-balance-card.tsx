import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

interface TotalBalanceCardProps {
    current: number;
    change: number;
    currency?: string;
    lastUpdated?: string;
}

export function TotalBalanceCard({ 
    current, 
    change, 
    currency = "USD",
    lastUpdated = "Just now"
}: TotalBalanceCardProps) {
    return (
        <Card className="w-full rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 border border-blue-800">
            <CardContent className="px-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                <Wallet className="size-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 font-medium">Total Balance</p>
                                <p className="text-xs text-gray-400">Across all accounts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">${current.toLocaleString()}</span>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                change >= 0 
                                    ? 'bg-green-600/20 text-green-300 border border-green-600/30' 
                                    : 'bg-red-600/20 text-red-300 border border-red-600/30'
                            }`}>
                                {change >= 0 ? (
                                    <TrendingUp className="size-3" />
                                ) : (
                                    <TrendingDown className="size-3" />
                                )}
                                {Math.abs(change)}%
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Last updated</p>
                        <p className="text-xs text-gray-300 font-medium">{lastUpdated}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
