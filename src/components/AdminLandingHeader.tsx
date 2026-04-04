import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Phone, 
  User, 
  ShieldCheck, 
  FileText,
  Landmark,
  ChevronUp,
  LayoutDashboard,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const AdminLandingHeader = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const topMenuItems = [
    { name: "ADMINISTRATION", active: true },
    { name: "STAFF PORTAL", active: false },
    { name: "BOARD OF DIRECTORS", active: false },
  ];

  const mainNavItems = [
    "Member Oversight", "Loan Approvals", "Ledger Control", "Audit Logs", "Reports"
  ];

  return (
    <header className="w-full z-[100] font-sans">
      {/* TOP TIER: DARKER ADMIN BAR */}
      <div className="bg-[#1a1f36] text-white h-8 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex justify-between items-center text-[11px] font-medium uppercase tracking-tight">
          <div className="flex items-center gap-6 h-full">
            {topMenuItems.map((item) => (
              <button 
                key={item.name} 
                className={`h-8 px-1 border-b-2 transition-all ${item.active ? "border-[#c9a84c] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5 opacity-60">
            <span>Admin Support: 1800-ADMIN-CT</span>
          </div>
        </div>
      </div>

      {/* MAIN TIER: ADMIN WHITE BAR */}
      <div className="bg-white shadow-sm h-16 flex items-center border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex justify-between items-center">
          {/* Official Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
             <div className="bg-[#1a1f36] p-1.5 rounded-lg">
                <Landmark className="w-6 h-6 text-[#c9a84c]" />
             </div>
             <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1a1f36] tracking-tighter leading-none">
                  CredTrust
                </h1>
                <p className="text-[#6b21a8] text-[9px] block tracking-widest font-bold opacity-60 uppercase">Management Portal</p>
             </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <button key={item} className="px-3 h-16 flex items-center gap-1 text-[14px] font-bold text-gray-600 hover:text-[#6b21a8] transition-colors group">
                {item}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6b21a8] transition-colors" />
              </button>
            ))}
          </nav>

          {/* Utility / Login */}
          <div className="flex items-center gap-5 relative">
            <button 
              onClick={() => navigate('/')}
              className="text-[13px] font-bold text-gray-400 hover:text-[#6b21a8] transition-colors mr-2"
            >
              Public Site
            </button>
            
            <div className="relative">
              <Button 
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className="bg-[#1a1f36] hover:bg-black text-[#c9a84c] px-6 h-10 rounded-full font-bold text-[15px] flex items-center gap-2 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
              >
                Staff Login
                {isLoginOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {/* Admin Login Dropdown */}
              <AnimatePresence>
                {isLoginOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-visible py-5 px-6 z-[200]"
                  >
                    <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

                    <div className="space-y-4 relative bg-white">
                       <div className="space-y-2.5">
                          <h4 className="text-[#6b21a8] font-bold text-[13px] tracking-tight uppercase">Dashboard Access</h4>
                          <div className="space-y-2 pl-4">
                             <Link to="/admin/login" className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-[#6b21a8] font-bold transition-colors">
                               <LayoutDashboard className="w-3.5 h-3.5" />
                               Admin Console
                             </Link>
                             <Link to="/admin/login" className="flex items-center gap-2 text-[12px] text-gray-400 hover:text-[#6b21a8] font-bold transition-colors">
                               <Users className="w-3.5 h-3.5" />
                               CEO Dashboard
                             </Link>
                          </div>
                       </div>

                       <div className="space-y-2.5">
                          <h4 className="text-[#c9a84c] font-bold text-[13px] tracking-tight uppercase">Emergency</h4>
                          <div className="space-y-2 pl-4">
                             <button className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-rose-600 font-bold transition-colors">
                               <ShieldAlert className="w-3.5 h-3.5" />
                               Lock Systems
                             </button>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminLandingHeader;
