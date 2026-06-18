import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/login/AuthContext";
import { 
  PiggyBank, 
  HandCoins, 
  Gem, 
  ChevronRight, 
  Search,
  Bell,
  Wallet,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  FileText,
  UserCheck,
  LayoutGrid,
  Zap,
  Smartphone,
  Info,
  Calendar,
  IndianRupee,
  Activity,
  ArrowRight,
  HeartPulse,
  Car,
  Briefcase,
  MonitorSmartphone,
  Gavel,
  BadgePercent,
  Plus,
  Globe2,
  Landmark,
  Sparkles,
  Compass,
  Gift,
  Hourglass,
  GraduationCap,
  Umbrella,
  Settings,
  Percent,
  Lock,
  User,
  Headset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferSlider } from "../components/OfferSlider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const quickActions = [
  { label: "Welcome to Yono", icon: Sparkles, bg: "bg-purple-100", color: "text-purple-600" },
  { label: "Security", icon: ShieldCheck, bg: "bg-blue-100", color: "text-blue-600" },
  { label: "Explore", icon: Compass, bg: "bg-orange-100", color: "text-orange-600" },
  { label: "Offers", icon: Gift, bg: "bg-pink-100", color: "text-pink-600" },
  { label: "Discover", icon: Smartphone, bg: "bg-indigo-100", color: "text-indigo-600" },
  { label: "Coming Soon", icon: Hourglass, bg: "bg-slate-100", color: "text-slate-600" },
  { label: "Invest Now", icon: GraduationCap, bg: "bg-rose-100", color: "text-rose-600" },
];

const SidebarGroup = ({ title, items }: { title: string, items: any[] }) => {
  const navigate = useNavigate();
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-tight">{title}</h3>
        <button className="text-[11px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">
          View All
        </button>
      </div>
      <div className="grid grid-cols-4 gap-x-2 gap-y-10">
        {items.map((item, idx) => {
          const ButtonContent = (
            <>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6b21a8] group-hover/item:shadow-lg group-hover/item:scale-110 border border-transparent group-hover/item:border-purple-100 transition-all">
                <item.icon className="w-6 h-6 stroke-[1.8px]" />
              </div>
              <span className="text-[11px] font-bold text-gray-700 group-hover/item:text-[#1a1f36] text-center leading-tight transition-colors">
                {item.label}
              </span>
            </>
          );

          return item.path ? (
            <Link key={idx} to={item.path} className="flex flex-col items-center gap-3 transition-all group/item">
              {ButtonContent}
            </Link>
          ) : (
            <button key={idx} className="flex flex-col items-center gap-3 transition-all group/item">
              {ButtonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const userName = user?.email?.split('@')[0] || "Member";
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        localStorage.getItem("fb_id_token")
      : null;

  const { data, isLoading } = useQuery({
    queryKey: ["member-overview"],
    queryFn: async () => {
      const { data } = await api.get("/members/me/overview");
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  // Calculate Credit Score based on data
  const calculateScore = () => {
    if (!data) return { cibil: 300, health: 33 };
    
    let base = 700;
    // Add points for balance
    if (data.totalBalance > 50000) base += 50;
    else if (data.totalBalance > 10000) base += 20;
    
    // Add/Sub for loans
    const loanCount = data.loans?.length || 0;
    if (loanCount === 0) base += 30; // Clean record
    else if (loanCount > 2) base -= 40; // High debt burden
    
    // Clamp
    const cibil = Math.min(Math.max(base, 300), 900);
    const health = Math.round((cibil / 900) * 100);
    
    return { cibil, health };
  };

  const { cibil, health } = calculateScore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN CONTENT (9 COLS) */}
          <div className="lg:col-span-9 space-y-10 min-w-0">
            
            {/* TOP OFFERS SLIDER */}
            <OfferSlider />

            {/* GREETING & QUICK ACTIONS */}
            <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-black/[0.02] relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-[0.3em]">Relationship Center</p>
                    <h1 className="font-serif text-[40px] text-[#1a1f36] leading-none font-bold italic tracking-tight">
                      Hello, <span className="underline decoration-[#c9a84c]/40 decoration-4 underline-offset-8">{userName.split(' ')[0]}</span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 font-bold text-[11px] uppercase tracking-widest pb-1 border-b border-gray-100">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Last Login: {new Date().toDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-8">
                  {quickActions.map((action, idx) => (
                    <button key={idx} className="flex flex-col items-center gap-4 transition-all group/action">
                      <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center border border-white shadow-sm group-hover/action:shadow-lg group-hover/action:-translate-y-1 transition-all duration-300`}>
                        <action.icon className={`w-6 h-6 ${action.color} stroke-[2px]`} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 group-hover/action:text-[#1a1f36] text-center leading-tight transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RELATIONSHIP OVERVIEW */}
            <section>
              <h1 className="text-xl font-bold text-[#1a1f36] mb-8">Relationship Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#b91d73] to-[#7c2d12] rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-pink-900/10 min-h-[250px] flex flex-col">
                  <div className="relative z-10 flex-grow">
                    <div className="flex justify-between items-start mb-8">
                      <h3 className="text-[12px] font-bold uppercase tracking-widest text-white/90">TRANSACTION ACCOUNTS</h3>
                      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Search className="w-5 h-5 text-white/70" />
                      </button>
                    </div>
                    <div className="space-y-1 mb-8">
                      <p className="text-[12px] font-bold text-white/50 tracking-wider">Combined Balance</p>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold font-sans tracking-tight block">
                          ₹{data?.totalBalance?.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">DEPOSITS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Deposits</p>
                      <p className="text-sm text-gray-500 font-semibold">
                        {data?.deposits?.length ?? 0} active
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    if (data?.loans?.length > 0) {
                      setSelectedLoan(data.loans[0]);
                      setIsLoanModalOpen(true);
                    }
                  }}
                  className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col cursor-pointer hover:shadow-xl hover:shadow-indigo-900/5 transition-all"
                >
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">LOANS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Loans</p>
                      <p className="text-sm text-gray-500 font-semibold">
                        {data?.loans?.length ?? 0} records
                      </p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-[#6b21a8] opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col">
                <h3 className="text-[13px] font-bold text-[#1a1f36] mb-4">Payments & Transfers</h3>
                <div className="flex border-b border-gray-100 gap-8 mb-8">
                  <button className="text-[12px] font-bold text-[#6b21a8] border-b-2 border-[#6b21a8] pb-2 uppercase tracking-tight whitespace-nowrap">Fund Transfer</button>
                </div>
                <div className="grid grid-cols-4 gap-x-1 gap-y-4 mb-4">
                  {[
                    { label: "Quick Transfer", desc: "Upto ₹50,000", icon: Zap, singleLine: true },
                    { label: "Send Money", desc: "To own/other a/c", icon: IndianRupee, singleLine: true },
                    { label: "Send Money Abroad", icon: Globe2, singleLine: false },
                    { label: "Schedule Payments", icon: Calendar, singleLine: false }
                  ].map((item, idx) => (
                    <button key={idx} className="flex flex-col items-center gap-2 group/item p-0.5">
                      <div className="w-12 h-14 rounded-xl border border-gray-100 flex items-center justify-center text-[#6b21a8] group-hover/item:border-[#6b21a8] transition-all bg-white shadow-sm group-hover/item:shadow-md">
                        <item.icon className="w-5 h-5 stroke-[1.8px]" />
                      </div>
                      <div className="text-center min-h-[30px] flex flex-col items-center justify-start">
                        <p className={`text-[10px] font-bold text-[#1a1f36] leading-[1.1] ${item.singleLine ? 'whitespace-nowrap' : 'max-w-[70px]'}`}>{item.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group h-full">
                 <h3 className="text-[13px] font-bold text-[#6b21a8] uppercase tracking-widest self-start mb-6">Upcoming Payments</h3>
                 <div className="flex-grow flex flex-col items-center justify-center py-2">
                    <div className="w-40 h-40 bg-[#fafafa] rounded-full flex items-center justify-center relative mb-6">
                       <div className="absolute inset-0 bg-[#6b21a8]/5 rounded-full animate-pulse" />
                       <div className="relative w-32 h-24 bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col p-2 overflow-hidden rotate-[-2deg]">
                          <div className="w-full h-8 bg-[#6b21a8] rounded-t-lg mb-2 opacity-90" />
                          <div className="flex justify-between items-center px-1">
                             <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-[#6b21a8]" />
                             </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-50 rounded-full opacity-50" />
                       </div>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#1a1f36] mb-2 leading-tight">Clear Your Pending Dues</h4>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px] mb-6 leading-normal">
                      {data?.nextEmi
                        ? `Next EMI ₹${Number(data.nextEmi.totalDue).toFixed(2)} due ${new Date(data.nextEmi.dueDate).toDateString()}`
                        : "No pending installments."}
                    </p>
                    <button 
                      onClick={() => navigate('/payments')}
                      className="rounded-full px-10 py-2.5 bg-white border-2 border-indigo-100 text-[#6b21a8] font-bold hover:bg-indigo-50 transition-all text-[12px] shadow-sm active:scale-95"
                    >
                      Pay Bills & EMIs
                    </button>
                 </div>
              </section>
            </div>

            {/* PROMOTIONAL BANNERS (High-Fidelity) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1a1f36] via-[#2d3356] to-[#1a1f36] p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between group cursor-pointer overflow-hidden relative shadow-xl shadow-indigo-900/10 min-h-[220px]">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#c9a84c]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Credit Health</p>
                      <h4 className="text-xl font-bold">Financial Score</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black font-sans tracking-tight text-white">{health}</span>
                      <span className="text-white/40 text-sm font-bold">/ 100</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${health}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" 
                          />
                       </div>
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Excellent</span>
                    </div>
                  </div>
                </div>

                <div className="relative mt-8 md:mt-0 flex flex-col items-center">
                   <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * cibil) / 900 }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className="text-[#c9a84c]"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                      <span className="text-2xl font-bold text-white leading-none">{cibil}</span>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">CIBIL / 900</span>
                   </div>
                </div>

                <div className="absolute right-0 bottom-0 opacity-5 -translate-x-4 translate-y-4 pointer-events-none">
                  <Activity size={200} />
                </div>
              </div>
              <div className="bg-[#c9a84c] p-10 rounded-[40px] text-[#1a1f36] flex items-center justify-between group cursor-pointer overflow-hidden relative shadow-xl shadow-[#c9a84c]/20">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1f36]/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-[#1a1f36]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#1a1f36]/40 mb-1 uppercase tracking-widest">Personal Finance</p>
                  <h4 className="text-xl font-bold flex items-center gap-2">Money Manager <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" /></h4>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 -translate-x-4 translate-y-4">
                  <TrendingUp size={160} />
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[40px] flex flex-col md:flex-row items-center border border-gray-100 shadow-xl shadow-black/[0.02] group cursor-pointer overflow-hidden relative">
               <div className="relative z-10 flex-grow text-center md:text-left">
                 <span className="bg-[#c9a84c]/10 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest text-[#c9a84c] mb-6 inline-block">MORTGAGE SOLUTIONS</span>
                 <h4 className="font-serif text-4xl font-bold text-[#1a1f36] leading-tight mb-6 max-w-sm">
                   From renting to <br /> <span className="text-[#c9a84c]">owning your home.</span>
                 </h4>
                 <p className="text-sm font-medium text-gray-400 mb-10">Instant eligibility check | Quick digital approvals</p>
                  <button 
                    onClick={() => navigate('/loan-apply')}
                    className="rounded-2xl px-12 py-4 bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-bold transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                  >
                    Apply for Home Loan
                  </button>
               </div>
               <div className="w-full md:w-1/3 flex justify-center mt-12 md:mt-0 md:translate-x-12">
                 <div className="relative">
                   <div className="w-64 h-64 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center animate-pulse">
                     <Landmark size={80} className="text-[#c9a84c]/20" />
                   </div>
                   <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#c9a84c] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-[#c9a84c]/40 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                     <TrendingUp size={32} />
                   </div>
                 </div>
               </div>
            </div>
            
          </div>
          
          {/* SIDEBAR (Unified white area as in image) */}
          <div className="lg:w-[380px] bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 space-y-4 shrink-0 h-fit lg:sticky lg:top-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6b21a8]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <SidebarGroup 
              title="Loans" 
              items={[
                { label: "Surety Loan", icon: ShieldCheck, path: "/product/loans/surety-loan" },
                { label: "Business Loan", icon: Briefcase, path: "/product/loans/business-loan" },
                { label: "Salary / Personal Loan", icon: UserCheck, path: "/product/loans/personal-loan" },
                { label: "Unsecured Loan", icon: User, path: "/product/loans/unsecured-loan" },
                { label: "Vehicle Loan", icon: Car, path: "/product/loans/vehicle-loan" },
                { label: "Home Loan", icon: Landmark, path: "/product/loans/home-loan" },
                { label: "Gold Loan", icon: Gem, path: "/product/loans/gold-loan" }
              ]} 
            />
            <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Deposits" 
              items={[
                { label: "Fixed Deposit", icon: ShieldCheck, path: "/product/deposits/fixed-deposit" },
                { label: "Recurring Deposit", icon: Calendar, path: "/product/deposits/recurring-deposit" },
                { label: "Pigmy Savings Scheme", icon: HandCoins, path: "/product/deposits/pigmy-deposit" }
              ]} 
            />
            <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Services" 
              items={[
                { label: "Contact & Support", icon: Headset, path: "/services" }
              ]} 
            />
          </div>
          
        </div>
      </main>

      {/* QUICK LINK FOOTER */}
      <footer className="mt-20 border-t border-gray-100 bg-[#1a1f36] text-white/50 text-[10px] py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-4 font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">About Sharanam</a>
          <a href="#" className="hover:text-white transition-colors">Digital Banking</a>
          <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </footer>

      {/* Loan Details Modal */}
      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6b21a8]">
                <HandCoins className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-[#1a1f36]">Loan Details</DialogTitle>
                <DialogDescription className="text-xs font-medium text-gray-400">
                  Account Number: {selectedLoan?.loanNumber}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-8 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Type</p>
                  <p className="text-sm font-bold text-[#1a1f36]">{selectedLoan.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
                    {selectedLoan.status}
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Sanctioned Amount</span>
                  <span className="text-lg font-bold text-[#1a1f36]">₹{selectedLoan.amount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Interest Rate</span>
                  <span className="text-sm font-bold text-[#1a1f36]">{selectedLoan.interestRate}% p.a.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Tenure</span>
                  <span className="text-sm font-bold text-[#1a1f36]">{selectedLoan.termMonths} Months</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/30 rounded-2xl p-5 border border-emerald-100/50">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-xl font-bold text-emerald-700">
                    ₹{(selectedLoan.emiSchedule || [])
                      .filter((e: any) => e.isPaid)
                      .reduce((sum: number, e: any) => sum + e.totalEmi, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600/60 mt-1">
                    {(selectedLoan.emiSchedule || []).filter((e: any) => e.isPaid).length} EMIs completed
                  </p>
                </div>
                <div className="bg-rose-50/30 rounded-2xl p-5 border border-rose-100/50">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Pending Dues</p>
                  <p className="text-xl font-bold text-rose-700">
                    ₹{(selectedLoan.emiSchedule || [])
                      .filter((e: any) => !e.isPaid)
                      .reduce((sum: number, e: any) => sum + e.totalEmi, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium text-rose-600/60 mt-1">
                    {(selectedLoan.emiSchedule || []).filter((e: any) => !e.isPaid).length} EMIs remaining
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  onClick={() => navigate('/payments')}
                  className="w-full h-14 rounded-2xl bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-bold text-base shadow-xl shadow-indigo-900/20 active:scale-95"
                >
                  Pay Current Installment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberDashboard;
