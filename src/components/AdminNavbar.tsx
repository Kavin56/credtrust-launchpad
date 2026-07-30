import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Settings,
  LogOut,
  User,
  LayoutDashboard,
  PiggyBank,
  HandCoins,
  Users,
  BarChart3,
  Search,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/login/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Pigmy Control", path: "/admin/pigmy", icon: PiggyBank },
    { name: "Pigmy Requests", path: "/admin/pigmy/requests", icon: Users },
    { name: "Loan Approvals", path: "/admin/loans", icon: HandCoins },
    { name: "Deposit Approvals", path: "/admin/deposits", icon: PiggyBank },
    { name: "Office Expense", path: "/admin/office-expenses", icon: HandCoins },
    { name: "Member Registry", path: "/admin/members", icon: Users },
    { name: "System Reports", path: "/admin/reports", icon: BarChart3 },
  ];

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "AD";
  const userName = user?.email?.split('@')[0] || "Admin";

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#1a1f36] border-b border-white/10 shadow-2xl font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/admin/pigmy')}>
               <div className="bg-[#c9a84c] p-1.5 rounded-lg shadow-lg shadow-yellow-900/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6 text-[#1a1f36]" />
               </div>
                <div className="hidden md:block">
                   <h1 className="text-[11px] md:text-[12px] font-extrabold text-white tracking-tight leading-none uppercase">
                     Sri Roja Shabarish Guruji Souharada Sahakara Niyamitha
                   </h1>
                   <span className="text-[#c9a84c] text-[10px] block tracking-widest font-black opacity-80 uppercase mt-0.5">Sharanam Management</span>
                </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`px-4 py-2 rounded-xl flex items-center gap-2.5 text-[13px] font-bold transition-all ${
                      isActive 
                        ? "bg-white/10 text-[#c9a84c] shadow-inner" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-[#c9a84c]" : "opacity-50"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-white/5 rounded-full px-4 h-10 border border-white/10">
               <Search className="h-4 w-4 text-white/30 mr-2" />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 className="bg-transparent border-none text-xs text-white placeholder:text-white/20 focus:ring-0 w-32 xl:w-48"
               />
            </div>

            <button className="relative p-2 text-white/40 hover:text-[#c9a84c] transition-colors">
               <Bell className="h-5 w-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c9a84c] rounded-full border-2 border-[#1a1f36]"></span>
            </button>

            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-2 group outline-none">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#a68a3d] border border-white/20 shadow-lg flex items-center justify-center text-[#1a1f36] text-[11px] font-black group-hover:scale-105 transition-transform uppercase">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-white leading-none uppercase tracking-tight">
                      {userName}
                    </p>
                    <p className="text-[9px] font-bold text-[#c9a84c] mt-1 opacity-80 uppercase">Root Access</p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-white/30 group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-white/10 shadow-2xl p-2 font-sans bg-[#1a1f36] text-white z-[101]">
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Administrator
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={() => navigate('/admin/profile')}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 group"
                >
                  <User className="w-4 h-4 text-white/40 group-hover:text-[#c9a84c]" />
                  <span className="text-[13px] font-bold">Admin Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/admin/settings')}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 group"
                >
                  <Settings className="w-4 h-4 text-white/40 group-hover:text-[#c9a84c]" />
                  <span className="text-[13px] font-bold">System Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 group"
                >
                  <HandCoins className="w-4 h-4 text-white/40 group-hover:text-[#c9a84c]" />
                  <span className="text-[13px] font-bold">Customer Portal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 group"
                >
                  <LogOut className="w-4 h-4 text-white/40 group-hover:text-rose-500" />
                  <span className="text-[13px] font-bold group-hover:text-rose-500">Secure Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <button 
              className="xl:hidden p-2 text-white/60"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[#1a1f36] border-t border-white/5 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 text-[14px] font-bold text-white hover:bg-white/10 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-[#c9a84c]" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminNavbar;
