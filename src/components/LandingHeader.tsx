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
  ChevronUp,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDrawer from "./NotificationDrawer";

const LandingHeader = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getActiveLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    const code = match ? match[1] : 'en';
    if (code === 'kn') return 'Kannada (kn)';
    if (code === 'ta') return 'Tamil (ta)';
    return 'English (en)';
  };

  const handleLanguageChange = (langCode: string) => {
    // Set google translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/`;
    
    // Always reload to ensure Google Translate processes the whole page from scratch
    window.location.reload();
  };

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
    { name: "1800 425 1444", icon: Phone }
  ];

  const mainNavItems = [
    "Accounts", "Deposits", "Loans", "Payments", "More"
  ];

  return (
    <header className="w-full z-[100] font-sans">


      {/* MAIN TIER: COMPACT WHITE BAR */}
      <div className="bg-white shadow-sm h-16 flex items-center border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex justify-between items-center">
          {/* Official Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
             <img src="/logo.jpeg" alt="Sri Roja Shabarish Guruji Logo" className="h-10 w-auto" />
              <div className="hidden sm:block">
                 <h1 className="text-[11px] md:text-[12px] font-extrabold text-[#1a1f36] tracking-tight leading-none uppercase">
                   Sri Roja Shabarish Guruji Souharada Sahakara Niyamitha
                 </h1>
                 <p className="text-[#6b21a8] text-[10px] block tracking-widest font-black opacity-80 uppercase mt-0.5">Sharanam</p>
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
          <div className="flex items-center gap-2 sm:gap-5 relative">
            <button className="p-2 text-gray-400 hover:text-[#6b21a8] transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell (Added for the new feature) */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 text-gray-400 hover:text-[#6b21a8] transition-colors group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-[12deg] transition-transform" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            {/* Desktop Language Switcher */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 px-4.5 h-10 border border-gray-200 hover:border-[#6b21a8] hover:text-[#6b21a8] text-gray-700 bg-white rounded-full font-bold text-[12px] sm:text-[13px] transition-all focus:outline-none active:scale-95">
                  <Globe2 className="w-4 h-4 text-[#6b21a8]" />
                  <span>{getActiveLang()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[200]">
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="font-bold text-xs cursor-pointer">
                    English (en) 🇬🇧
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('kn')} className="font-bold text-xs cursor-pointer">
                    ಕನ್ನಡ (kn) 🇮🇳
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ta')} className="font-bold text-xs cursor-pointer">
                    Tamil (ta) 🇮🇳
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative">
              <Button 
                onClick={() => setIsLoginOpen(!isLoginOpen)}
                className="bg-[#4a148c] hover:bg-[#311b92] text-white px-4 sm:px-6 h-10 rounded-full font-medium text-[13px] sm:text-[15px] flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-purple-900/10 transition-all active:scale-95"
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
                             <Link to="/admin/login" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Admin</Link>
                             <Link to="/agent/login" className="block text-[12px] text-gray-500 hover:text-[#6b21a8] font-medium transition-colors">Agent</Link>
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

            {/* Mobile Hamburger toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 text-gray-500 hover:text-[#6b21a8] transition-colors xl:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Drawer Dropdown Menu (for xl:hidden) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Language switcher */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="text-xs font-semibold text-gray-500">Language</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-bold text-gray-700 focus:outline-none">
                    {getActiveLang()}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-[200]">
                    <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                      English (en)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLanguageChange('kn')}>
                      Kannada (kn)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLanguageChange('ta')}>
                      Tamil (ta)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Utility shortcuts */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-gray-700">
                <a href="#about" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100">About Us</a>
                <a href="#support" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100">Support</a>
              </div>

              {/* Main Nav Items */}
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link 
                    key={item} 
                    to={
                      item === "Loans" 
                        ? "/loan-apply" 
                        : item === "Deposits" 
                          ? "/deposit-apply" 
                          : item === "Accounts"
                            ? "/accounts"
                            : item === "Payments"
                              ? "/payments"
                              : "/services"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#fdf4ff] text-sm font-bold text-gray-700 hover:text-[#6b21a8] transition-colors"
                  >
                    <span>{item}</span>
                    <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};

export default LandingHeader;
