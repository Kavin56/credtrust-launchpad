import React from 'react';
import { 
  LayoutDashboard, Users, Database, FileText, Settings, 
  Bell, Landmark, ShieldCheck, Wallet, PieChart, BadgePercent, ChevronDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { group: "MAIN", items: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/pigmy", active: true },
    { name: "Customers", icon: Users, path: "/admin/pigmy/add-customer", badge: "248" },
    { name: "Collections", icon: Database, path: "/agent/pigmy", badge: "12" },
    { name: "Maturity", icon: Landmark, path: "/admin/pigmy/maturity" },
    { name: "Agents", icon: ShieldCheck, path: "/admin/pigmy" },
  ]},
  { group: "FINANCE", items: [
    { name: "Transactions", icon: Wallet, path: "/dashboard/pigmy" },
    { name: "Reports", icon: FileText, path: "/admin/pigmy" },
    { name: "Commissions", icon: BadgePercent, path: "/agent/pigmy" },
  ]},
  { group: "SYSTEM", items: [
    { name: "Notifications", icon: Bell, path: "/admin/pigmy", badge: "5" },
    { name: "Settings", icon: Settings, path: "/admin/pigmy" },
  ]}
];

import { useNavigate } from 'react-router-dom';

export const PigmySidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-900">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Landmark className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white tracking-tighter">PigmyPro</h2>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deposit Manager</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {menuItems.map((group) => (
          <div key={group.group}>
            <h3 className="text-[10px] font-bold text-zinc-500 mb-4 px-4 uppercase tracking-[0.2em]">{group.group}</h3>
            <nav className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => item.path && navigate(item.path)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                    item.active 
                      ? "bg-zinc-900 text-white shadow-lg" 
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      item.active ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge className={cn(
                      "text-[10px] h-5 px-1.5 rounded-full border-none",
                      item.active ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800 text-zinc-400"
                    )}>
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-900">
        <div className="flex items-center gap-3 px-2">
           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">AD</div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] text-zinc-500 font-medium">Head Branch</p>
           </div>
           <ChevronDown className="h-3 w-3 text-zinc-500" />
        </div>
      </div>
    </div>
  );
};
