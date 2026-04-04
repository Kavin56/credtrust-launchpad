import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Bell, 
  User, 
  ChevronDown, 
  Info, 
  Smartphone, 
  CreditCard, 
  Landmark, 
  PiggyBank, 
  Activity, 
  ShieldCheck, 
  BadgePercent, 
  Headset, 
  Briefcase, 
  Globe2, 
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Zap,
  Star,
  Users,
  Gem,
  Calculator,
  ArrowRight,
  HeartPulse,
  Car,
  Umbrella,
  Plane,
  MonitorSmartphone,
  Wallet,
  FileText,
  Lock,
  Percent,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/modules/login/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Internal icons for the menu
const Calendar = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const HandCoins = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-5.4a2 2 0 0 0-2.8-2.8L15 13"/><circle cx="14" cy="8" r="3"/></svg>
);
const GraduationCap = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);

const megaMenuData = {
  Deposits: {
    products: [
      { name: "Fixed Deposit", icon: ShieldCheck, path: "/product/deposits/fixed-deposit" },
      { name: "Recurring Deposit", icon: Calendar, path: "/product/deposits/recurring-deposit" },
      { name: "Annuity Deposit", icon: FileText, path: "/product/deposits/annuity" },
      { name: "Auto Sweep", icon: Zap, path: "/product/deposits/auto-sweep" }
    ],
    links: [
      { name: "Manage Deposits", path: "/accounts?tab=deposits" },
      { name: "View Interest Rate", path: "/product/deposits/fixed-deposit" },
      { name: "Manage PPF Accounts", path: "/product/investments/ppf" },
      { name: "Requests", path: "/services" }
    ]
  },
  Loans: {
    products: [
      { name: "Personal Loan", icon: User, path: "/product/loans/personal-loan" },
      { name: "SHG Credit", icon: HandCoins, path: "/product/loans/shg-credit" },
      { name: "Home Loan", icon: Landmark, path: "/product/loans/home-loan" },
      { name: "Gold Loan", icon: Gem, path: "/product/loans/gold-loan" },
      { name: "Education Loan", icon: GraduationCap, path: "/product/loans/personal-loan" }
    ],
    links: [
      { name: "View Existing Loans", path: "/accounts?tab=loans" },
      { name: "Apply Instant Loan", path: "/loan-apply" },
      { name: "Check Credit Score", path: "/dashboard" },
      { name: "Calculate Loan EMI", path: "/loan-apply" }
    ]
  },
  Cards: {
    products: [
      { name: "Credit Cards", icon: CreditCard, path: "/product/cards/credit-cards" },
      { name: "Debit Cards", icon: MonitorSmartphone, path: "/product/cards/debit-cards" },
      { name: "Forex Cards", icon: Globe2, path: "/product/cards/forex-cards" },
      { name: "NCMC", icon: Smartphone, path: "/product/cards/ncmc-card" }
    ],
    links: [
      { name: "Manage Credit Card", path: "/cards" },
      { name: "Manage Debit Card", path: "/cards" },
      { name: "Manage Forex Card", path: "/cards" }
    ]
  },
  Investments: {
    products: [
      { name: "Mutual Funds", icon: Activity, path: "/product/investments/mutual-funds" },
      { name: "NPS", icon: PiggyBank, path: "/product/investments/nps" },
      { name: "PPF", icon: Wallet, path: "/product/investments/ppf" },
      { name: "Demat & Securities", icon: Briefcase, path: "/product/investments/demat" }
    ],
    links: [
      { name: "Manage Mutual Fund", path: "/investments" },
      { name: "Manage NPS Account", path: "/investments" },
      { name: "Manage PPF", path: "/investments" }
    ]
  },
  Insurance: {
    products: [
      { name: "Life", icon: Umbrella, path: "/product/insurance/life-insurance" },
      { name: "Health", icon: HeartPulse, path: "/product/insurance/health-insurance" },
      { name: "Accident", icon: Info, path: "/product/insurance/accident-cover" },
      { name: "Motor", icon: Car, path: "/product/insurance/motor-insurance" }
    ],
    links: [
      { name: "Renew Insurance", path: "/insurance" },
      { name: "View Certificates", path: "/insurance" },
      { name: "Claim Status", path: "/insurance" }
    ]
  },
  Services: {
    products: [
      { name: "Account Related", icon: Settings, path: "/product/services/account-services" },
      { name: "Tax Related", icon: Percent, path: "/product/services/tax-services" },
      { name: "Cheque Services", icon: FileText, path: "/product/services/cheque-services" },
      { name: "e-Secure Lock", icon: Lock, path: "/product/services/e-secure-lock" }
    ],
    links: [
      { name: "Form 15G/15H", path: "/product/services/tax-services" },
      { name: "Order Certificate", path: "/product/services/account-services" },
      { name: "Track Service Status", path: "/services" }
    ]
  }
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = user?.email || "User";
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const userName = userEmail.split('@')[0];

  useEffect(() => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Accounts", path: "/accounts" },
    { name: "Payments", path: "/payments" },
    { name: "Deposits", path: "Deposits", hasMegaMenu: true },
    { name: "Loans", path: "Loans", hasMegaMenu: true },
    { name: "Cards", path: "Cards", hasMegaMenu: true },
    { name: "Investments", path: "Investments", hasMegaMenu: true },
    { name: "Insurance", path: "Insurance", hasMegaMenu: true },
    { name: "Services", path: "Services", hasMegaMenu: true }
  ];

  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-gray-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="bg-[#1a1f36] p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
              <Landmark className="w-6 h-6 text-[#c9a84c]" />
            </div>
            <div>
               <h1 className="text-lg font-black text-[#1a1f36] tracking-tighter leading-none">
                 CredTrust <span className="text-[#6b21a8] text-[10px] block tracking-widest font-bold opacity-60">NET-BANKING</span>
               </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-0.5 h-full">
            {navItems.map((item) => (
              <div 
                key={item.name} 
                className="h-full flex items-center relative"
                onMouseEnter={() => item.hasMegaMenu && setActiveMegaMenu(item.name)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                {item.hasMegaMenu ? (
                  <button className={`px-4 h-full flex items-center gap-1.5 text-[14px] font-bold transition-all relative ${
                    activeMegaMenu === item.name ? "text-[#6b21a8] bg-[#fdf4ff]" : "text-[#1a1f36] hover:text-[#6b21a8] hover:bg-gray-50/50"
                  }`}>
                    {item.name}
                    {activeMegaMenu === item.name && (
                      <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6b21a8]" />
                    )}
                  </button>
                ) : (
                  <Link to={item.path} className="px-4 h-full flex items-center text-[14px] font-bold text-[#1a1f36] hover:text-[#6b21a8] hover:bg-gray-50/50 transition-all">
                    {item.name}
                  </Link>
                )}

                {/* Desktop Mega-Menu Container */}
                <AnimatePresence>
                  {item.hasMegaMenu && activeMegaMenu === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-[64px] w-[620px] bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden ${
                        item.name === 'Insurance' || item.name === 'Services' || item.name === 'Investments' ? 'right-0' : 'left-0'
                      }`}
                    >
                      <div className="grid grid-cols-2 divide-x divide-gray-50">
                        {/* Products Column */}
                        <div className="p-8 space-y-6">
                          <h4 className="text-[13px] font-black text-[#1a1f36] mb-8 px-2 uppercase tracking-tighter opacity-80">Products</h4>
                          <div className="flex flex-col">
                            {megaMenuData[activeMegaMenu as keyof typeof megaMenuData]?.products.map((prod, i, arr) => (
                              <Link 
                                key={i} 
                                to={prod.path} 
                                className={`flex items-center gap-5 p-4 hover:bg-[#fdf4ff] transition-all group ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b21a8]/60 group-hover:text-[#6b21a8] transition-colors">
                                  <prod.icon className="w-5 h-5 stroke-[1.5px]" />
                                </div>
                                <span className="text-[14px] font-bold text-[#1a1f36] group-hover:text-[#6b21a8] transition-colors">{prod.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Quick Links Column */}
                        <div className="p-8 bg-gray-50/10 space-y-6">
                          <h4 className="text-[13px] font-black text-[#1a1f36] mb-8 px-2 uppercase tracking-tighter opacity-80">Quick Links</h4>
                          <div className="flex flex-col">
                            {megaMenuData[activeMegaMenu as keyof typeof megaMenuData]?.links.map((link, i, arr) => (
                              <Link 
                                key={i} 
                                to={link.path} 
                                className={`flex items-center gap-5 p-4 hover:bg-[#fdf4ff] transition-all group ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b21a8]/60 group-hover:text-[#6b21a8] transition-colors">
                                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[14px] font-bold text-[#1a1f36] group-hover:text-[#6b21a8] transition-colors">{link.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Header Utilities */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-[#1a1f36] transition-colors group">
              <Bell className="w-5 h-5 group-hover:rotate-[15deg] transition-transform" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 group max-w-[160px] outline-none">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#1a1f36] border border-white shadow-md flex items-center justify-center text-[#c9a84c] text-[10px] font-black group-hover:scale-110 transition-transform uppercase">
                    {userInitials}
                  </div>
                  <div className="hidden xl:block overflow-hidden text-left">
                    <p className="text-[11px] font-black text-[#1a1f36] leading-none uppercase truncate">
                      {userName}
                    </p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <p className="text-[9px] font-bold text-[#6b21a8]">My Account</p>
                      <ChevronDown className="w-2.5 h-2.5 text-[#6b21a8]" />
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-gray-100 shadow-2xl p-2 font-sans bg-white z-[101]">
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Personal Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-50 my-1" />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-[#fdf4ff] group focus:bg-[#fdf4ff]"
                >
                  <User className="w-4 h-4 text-gray-400 group-hover:text-[#6b21a8]" />
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#6b21a8]">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-[#fdf4ff] group focus:bg-[#fdf4ff]"
                >
                  <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#6b21a8]" />
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#6b21a8]">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-50 my-1" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-rose-50 group focus:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-rose-600">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2">
              {isMenuOpen ? <X className="w-7 h-7 text-[#1a1f36]" /> : <Menu className="w-7 h-7 text-[#1a1f36]" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 space-y-6">
               <nav className="grid gap-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.name} 
                      to={item.hasMegaMenu ? `/${item.name.toLowerCase()}` : item.path}
                      className="px-4 py-4 rounded-2xl bg-gray-50 text-[15px] font-bold text-[#1a1f36] flex items-center justify-between active:bg-gray-100 transition-colors"
                    >
                      {item.name}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
               </nav>
               <div className="pt-6 border-t border-gray-100 flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-[#1a1f36] flex items-center justify-center text-[#c9a84c] font-black uppercase">
                       {userInitials}
                     </div>
                     <div>
                        <p className="text-sm font-black text-[#1a1f36] uppercase">{userName}</p>
                        <p className="text-[11px] font-bold text-[#6b21a8]">CT882{user?.id?.substring(0, 2) || "19"}</p>
                     </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-3 bg-[#f8fafc] rounded-2xl text-gray-400 hover:text-rose-600 transition-all hover:bg-rose-50"
                  >
                     <LogOut className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
