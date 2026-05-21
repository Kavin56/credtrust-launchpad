import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  IndianRupee, Users, TrendingUp, PiggyBank, Wallet, HandCoins 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface StatsProps {
  totalDeposits: number;
  totalWithdrawals: number;
  activeAccounts: number;
  todayCollections: number;
  maturityAccounts: number;
  activeAgents: number;
  pendingCollections?: number;
  pendingCount?: number;
  onActiveAgentsClick?: () => void;
}

export const PigmyStats: React.FC<StatsProps> = ({ 
  totalDeposits, 
  totalWithdrawals,
  activeAccounts, 
  todayCollections,
  maturityAccounts,
  activeAgents,
  pendingCollections = 0,
  pendingCount = 0,
  onActiveAgentsClick
}) => {
  const stats = [
    {
      title: "Total Deposits",
      value: `₹${(totalDeposits / 100000).toFixed(1)}L`,
      icon: IndianRupee,
      trend: "+8.2%",
      trendColor: "text-emerald-400 bg-emerald-400/10",
      iconColor: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Active Accounts",
      value: activeAccounts.toString(),
      icon: Users,
      trend: "+14",
      trendColor: "text-zinc-200 bg-zinc-800",
      iconColor: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Today's Collections",
      value: `₹${todayCollections.toLocaleString()}`,
      icon: TrendingUp,
      trend: "+3.1%",
      trendColor: "text-orange-400 bg-orange-400/10",
      iconColor: "text-orange-500 bg-orange-500/10"
    },
    {
      title: "Pending Collections",
      value: `₹${pendingCollections.toLocaleString()}`,
      icon: HandCoins,
      trend: `${pendingCount} dues`,
      trendColor: "text-rose-400 bg-rose-400/10",
      iconColor: "text-rose-500 bg-rose-500/10"
    },
    {
      title: "Active Agents",
      value: activeAgents.toString(),
      icon: ShieldCheck,
      trend: `${activeAgents} active`,
      trendColor: "text-blue-400 bg-blue-400/10",
      iconColor: "text-indigo-500 bg-indigo-500/10",
      onClick: onActiveAgentsClick
    },
    {
      title: "Maturity Accounts",
      value: maturityAccounts.toString(),
      icon: PiggyBank,
      trend: `+${maturityAccounts} this mo.`,
      trendColor: "text-emerald-400 bg-emerald-400/10",
      iconColor: "text-emerald-500 bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          onClick={stat.onClick}
          className={`bg-white border-gray-100 text-[#1a1f36] transition-all shadow-sm rounded-2xl ${
            stat.onClick ? "hover:shadow-md cursor-pointer hover:border-gray-200" : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${stat.iconColor.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-')}`}>
                {/* Fallback for ShieldCheck icon which wasn't imported in this scope but used in mapping logic */}
                {stat.icon ? <stat.icon className="h-5 w-5" /> : <div className="h-5 w-5 bg-gray-200 rounded" />}
              </div>
              <Badge className={`${stat.trendColor.replace('bg-', 'bg-opacity-10 bg-').replace('text-zinc-200', 'text-gray-600').replace('bg-zinc-800', 'bg-gray-100')} border-none font-bold text-[10px] px-2`}>
                {stat.trend}
              </Badge>
            </div>
            <div>
              <div className="text-2xl font-black mb-1 text-[#1a1f36]">{stat.value}</div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper for the missing icon in mapping
import { ShieldCheck } from 'lucide-react';
