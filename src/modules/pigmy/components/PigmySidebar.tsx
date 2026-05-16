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
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="bg-[#1a1f36] p-1.5 rounded-lg">
          <Landmark className="h-5 w-5 text-[#c9a84c]" />
        </div>
        <div>
          <h2 className="text-sm font-black text-[#1a1f36] tracking-tighter">PigmyPro</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deposit Manager</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {menuItems.map((group) => (
          <div key={group.group}>
            <h3 className="text-[10px] font-bold text-gray-400 mb-4 px-4 uppercase tracking-[0.2em]">{group.group}</h3>
            <nav className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => item.path && navigate(item.path)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group",
                    item.active 
                      ? "bg-[#1a1f36] text-white shadow-md" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#1a1f36]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      item.active ? "text-[#c9a84c]" : "text-gray-400 group-hover:text-[#1a1f36]"
                    )} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge className={cn(
                      "text-[10px] h-5 px-1.5 rounded-full border-none",
                      item.active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
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

      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-2">
           <div className="w-8 h-8 rounded-full bg-[#1a1f36] flex items-center justify-center text-xs font-bold text-[#c9a84c]">AD</div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1a1f36] truncate">Admin User</p>
              <p className="text-[10px] text-gray-400 font-medium">Head Branch</p>
           </div>
           <ChevronDown className="h-3 w-3 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
