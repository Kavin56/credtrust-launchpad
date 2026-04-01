import React, { useState } from 'react';
import { 
  ChevronDown, 
  Search, 
  Phone, 
  Globe2, 
  User, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  FileText,
  Landmark,
  ChevronUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const LandingHeader = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const topMenuItems = [
    { name: "PERSONAL", active: true },
    { name: "BUSINESS & MSME", active: false },
    { name: "AGRIBANKING", active: false },
    { name: "NRI PRIORITY BANKING", active: false },
  ];

  const topUtilityItems = [
    { name: "Ways to Bank", icon: ChevronDown },
    { name: "About Us", icon: ChevronDown },
    { name: "Support", icon: ChevronDown },
    { name: "Blog", icon: null },
    { name: "Investors", icon: null },
    { name: "1800 425 1444", icon: Phone },
    { name: "En", icon: ChevronDown },
  ];

  const mainNavItems = [
    "Accounts", "Deposits", "Cards", "Loans", "Insurance", "Investments", "Payments", "More"
  ];

  return (
    <header className="w-full z-[100] font-sans">
      {/* TOP TIER: MUCH DARKER VIOLET BAR */}
      <div className="bg-[#4a148c] text-white h-8 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex justify-between items-center text-[11px] font-medium uppercase tracking-tight">
          <div className="flex items-center gap-6 h-full">
            {topMenuItems.map((item) => (
              <button 
                key={item.name} 
                className={`h-8 px-1 border-b-2 transition-all ${item.active ? "border-white opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5">
            {topUtilityItems.map((item, i) => (
              <button key={i} className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                {item.icon === Phone && <item.icon className="w-3 h-3" />}
                {item.name}
                {item.icon === ChevronDown && <item.icon className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN TIER: COMPACT WHITE BAR */}
      <div className="bg-white shadow-sm h-16 flex items-center border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex justify-between items-center">
          {/* Official Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
             <img src="/logo.png" alt="CredTrust Logo" className="h-10 w-auto" />
             <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1a1f36] tracking-tighter leading-none">
                  CredTrust
                </h1>
                <p className="text-[#6b21a8] text-[9px] block tracking-widest font-medium opacity-60">COOPERATIVE SOCIETY</p>
             </div>
          </div>

          {/* Navigation Items - Normal (not bold) */}
          <nav className="hidden xl:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <button key={item} className="px-3 h-16 flex items-center gap-1 text-[14px] font-medium text-gray-600 hover:text-[#6b21a8] transition-colors group">
                {item}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6b21a8] transition-colors" />
              </button>
            ))}
          </nav>

          {/* Utility / Login */}
          <div className="flex items-center gap-5 relative">
            <button className="p-2 text-gray-400 hover:text-[#6b21a8] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <Button 
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className="bg-[#4a148c] hover:bg-[#311b92] text-white px-6 h-10 rounded-full font-medium text-[15px] flex items-center gap-2 shadow-lg shadow-purple-900/10 transition-all active:scale-95"
              >
                Login
                {isLoginOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {/* Login Dropdown (Pixel Perfect Match) */}
              <AnimatePresence>
                {isLoginOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-visible py-5 px-6 z-[200]"
                  >
                    {/* Triangle Arrow */}
                    <div className="absolute -top-1.5 right-8 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

                    <div className="space-y-4 relative bg-white">
                       {/* Internet Banking */}
                       <div className="space-y-2.5">
                          <h4 className="text-[#a21caf] font-semibold text-[13px] tracking-tight">Internet Banking</h4>
                          <div className="space-y-2 pl-4">
                             <Link to="/login" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Personal</Link>
                             <Link to="/login" className="block text-[12px] text-gray-400 hover:text-[#6b21a8] font-medium transition-colors">Corporate</Link>
                          </div>
                       </div>

                       {/* Cards */}
                       <div className="space-y-2.5">
                          <h4 className="text-[#a21caf] font-semibold text-[13px] tracking-tight">Cards</h4>
                          <div className="space-y-2 pl-4">
                             <Link to="/cards" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Gift Card</Link>
                             <Link to="/cards" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Image Card</Link>
                          </div>
                       </div>

                       {/* Services */}
                       <div className="space-y-2.5">
                          <h4 className="text-[#a21caf] font-semibold text-[13px] tracking-tight">Services</h4>
                          <div className="space-y-2 pl-4">
                             <Link to="/kyc" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Update KYC Online</Link>
                             <Link to="/services" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Submit Form 15G/H</Link>
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

export default LandingHeader;
