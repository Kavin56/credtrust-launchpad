import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
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
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const quickActions = [
  { label: "Welcome to Yono", icon: Sparkles, bg: "bg-purple-100", color: "text-purple-600" },
  { label: "Security", icon: ShieldCheck, bg: "bg-blue-100", color: "text-blue-600" },
  { label: "Explore", icon: Compass, bg: "bg-orange-100", color: "text-orange-600" },
  { label: "Offers", icon: Gift, bg: "bg-pink-100", color: "text-pink-600" },
  { label: "Discover", icon: Smartphone, bg: "bg-indigo-100", color: "text-indigo-600" },
  { label: "Savings Ac", icon: PiggyBank, bg: "bg-emerald-100", color: "text-emerald-600" },
  { label: "Coming Soon", icon: Hourglass, bg: "bg-slate-100", color: "text-slate-600" },
  { label: "Invest Now", icon: GraduationCap, bg: "bg-rose-100", color: "text-rose-600" },
];

const SidebarGroup = ({ title, items }: { title: string, items: any[] }) => (
  <div className="mb-12 last:mb-0">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-tight">{title}</h3>
      <button className="text-[11px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">
        View All
      </button>
    </div>
    <div className="grid grid-cols-4 gap-x-2 gap-y-10">
      {items.map((item, idx) => (
        <button key={idx} className="flex flex-col items-center gap-3 transition-all group/item">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6b21a8] group-hover/item:shadow-lg group-hover/item:scale-110 border border-transparent group-hover/item:border-purple-100 transition-all">
            <item.icon className="w-6 h-6 stroke-[1.8px]" />
          </div>
          <span className="text-[11px] font-bold text-gray-700 group-hover/item:text-[#1a1f36] text-center leading-tight transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

const MemberDashboard = () => {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || "Member";
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* MAIN CONTENT (75%) */}
          <div className="flex-grow lg:w-[75%] space-y-8">
            
            {/* WELCOME BANNER (High-Fidelity Redesign) */}
            <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-black/[0.03] relative overflow-hidden group">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#c9a84c]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <h1 className="font-serif text-[32px] text-gray-700 mb-10 tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-500 font-bold italic">
                  Hello <span className="text-[#1a1f36] underline decoration-[#c9a84c]/50 decoration-4 underline-offset-8">{userName.split(' ')[0]}</span>, <span className="opacity-80">Let's get started!</span>
                </h1>
                
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-10">
                  {quickActions.map((action, idx) => (
                    <button key={idx} className="flex flex-col items-center gap-4 transition-all group/action">
                      <div className={`w-16 h-16 rounded-full ${action.bg} flex items-center justify-center border-4 border-white shadow-md group-hover/action:scale-110 group-hover/action:-rotate-3 transition-all duration-300`}>
                        <action.icon className={`w-6 h-6 ${action.color} stroke-[2.5px]`} />
                      </div>
                      <span className="text-[12px] font-bold text-gray-600 group-hover/action:text-[#1a1f36] text-center leading-tight transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RELATIONSHIP OVERVIEW (Pixel-Perfect Parity) */}
            <section>
              <h1 className="text-xl font-bold text-[#1a1f36] mb-8">Relationship Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Transaction Card - Deep Magenta/Purple */}
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
                        <span className="text-3xl font-bold font-sans tracking-tight block">₹XXXX.xx</span>
                        <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all border border-white/5">
                          <Search className="w-3.5 h-3.5 text-white/60" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center gap-10 pt-4">
                    <Link to="/accounts" className="text-[13px] font-bold border-b-2 border-white pb-0.5 hover:text-white/70 hover:border-white/70 transition-all">
                      View Accounts
                    </Link>
                    <button className="text-[13px] font-bold border-b-2 border-white pb-0.5 hover:text-white/70 hover:border-white/70 transition-all">
                      Transactions
                    </button>
                  </div>
                  {/* Overlapping Circle patterns */}
                  <div className="absolute top-0 right-0 w-[240px] h-[300px] bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none blur-xl" />
                  <div className="absolute bottom-0 right-1/4 w-[120px] h-[120px] bg-indigo-500/10 rounded-full pointer-events-none blur-xl" />
                </div>

                {/* Deposits Card - Light Lilac */}
                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">DEPOSITS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Grow your money faster</p>
                      <p className="text-[12px] text-gray-600 font-bold">Check out our high-yield deposits</p>
                    </div>
                  </div>
                  <button className="relative z-10 self-start text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-all pt-4">
                    Explore
                  </button>
                  {/* Lilac Patterns matching image */}
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-100 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200 rounded-full pointer-events-none opacity-20" />
                  <div className="absolute top-[-40px] left-[-40px] w-32 h-32 bg-indigo-100/30 rounded-full pointer-events-none" />
                </div>

                {/* Loans Card - Light Lilac */}
                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">LOANS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Find the perfect loan</p>
                      <p className="text-[12px] text-gray-600 font-bold">Ready to make that big purchase?</p>
                    </div>
                  </div>
                  <button className="relative z-10 self-start text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-all pt-4">
                    Manage loans
                  </button>
                  {/* Lilac Patterns matching image */}
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-100 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200 rounded-full pointer-events-none opacity-20" />
                </div>

                {/* Investments Card - Light Lilac */}
                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">INVESTMENTS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Build your wealth</p>
                      <p className="text-[12px] text-gray-600 font-bold">Smart portfolios and mutual funds</p>
                    </div>
                  </div>
                  <button className="relative z-10 self-start text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-all pt-4">
                    View Portfolio
                  </button>
                  {/* Lilac Patterns matching image */}
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-100 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200 rounded-full pointer-events-none opacity-20" />
                </div>

                {/* Insurance Card - Light Lilac */}
                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">INSURANCE</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Secure your future</p>
                      <p className="text-[12px] text-gray-600 font-bold">Health, Life, and Motor protection</p>
                    </div>
                  </div>
                  <button className="relative z-10 self-start text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-all pt-4">
                    Get Covered
                  </button>
                  {/* Lilac Patterns matching image */}
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-100 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200 rounded-full pointer-events-none opacity-20" />
                </div>

                {/* Cards Card - Light Lilac */}
                <div className="bg-[#eef2ff] rounded-[40px] p-8 text-[#1a1f36] relative overflow-hidden group shadow-sm min-h-[250px] border border-white flex flex-col">
                  <div className="relative z-10 flex flex-col h-full flex-grow">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#1a1f36]/40 mb-8">CARDS</h3>
                    <div className="space-y-2 mb-auto">
                      <p className="text-xl font-bold text-[#1a1f36] leading-tight">Explore Credit Cards</p>
                      <p className="text-[12px] text-gray-600 font-bold">Unbeatable offers and rewards</p>
                    </div>
                  </div>
                  <button className="relative z-10 self-start text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-all pt-4">
                    Apply Now
                  </button>
                  {/* Lilac Patterns matching image */}
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-100 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200 rounded-full pointer-events-none opacity-20" />
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              {/* PAYMENTS & TRANSFERS (Perfect Structural Parity) */}
              <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative group overflow-hidden flex flex-col">
                {/* Level 1: Main Title */}
                <h3 className="text-[13px] font-bold text-[#1a1f36] mb-4">Payments & Transfers</h3>
                
                {/* Level 2: Tabs */}
                <div className="flex border-b border-gray-100 gap-8 mb-8">
                  <button className="text-[12px] font-bold text-[#6b21a8] border-b-2 border-[#6b21a8] pb-2 uppercase tracking-tight whitespace-nowrap">Fund Transfer</button>
                  <button className="text-[12px] font-bold text-gray-400 pb-2 uppercase tracking-tight flex items-center gap-1.5 hover:text-[#6b21a8] transition-colors whitespace-nowrap">
                    <Bell className="w-3 h-3" /> Bill payments
                  </button>
                </div>
                
                {/* Level 3: Operations (Fixed Overlapping) */}
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
                        {item.desc && <p className="text-[8px] text-gray-400 font-bold whitespace-nowrap mt-0.5">{item.desc}</p>}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-auto pt-6 border-t border-gray-50">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic block mb-4">Recents</span>
                  <div className="flex flex-col items-start gap-1">
                    <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-[13px] font-extrabold text-pink-600 shadow-sm">PR</div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-1">PALANIAP..</p>
                  </div>
                </div>
              </section>

              {/* UPCOMING PAYMENTS (Compact Surgical Refinement) */}
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
                             <div className="flex-grow ml-3">
                                <div className="h-2 w-12 bg-gray-100 rounded-full mb-1" />
                                <div className="h-1.5 w-16 bg-gray-50 rounded-full" />
                             </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-50 rounded-full opacity-50" />
                       </div>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#1a1f36] mb-2 leading-tight">Never Miss Your Payments Now</h4>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px] mb-6 leading-normal">Track and get reminder for your upcoming Payments</p>
                    <button className="rounded-full px-10 py-2.5 bg-white border-2 border-indigo-100 text-[#6b21a8] font-bold hover:bg-indigo-50 transition-all text-[12px] shadow-sm active:scale-95">
                      Pay Bills
                    </button>
                 </div>
              </section>
            </div>

            {/* PROMOTIONAL BANNERS (High-Fidelity) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#1a1f36] via-[#2d3356] to-[#1a1f36] p-10 rounded-[40px] text-white flex items-center justify-between group cursor-pointer overflow-hidden relative shadow-xl shadow-indigo-900/10">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Activity className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                  <p className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-widest">Financial Health</p>
                  <h4 className="text-xl font-bold flex items-center gap-2">Credit Score <ArrowRight className="w-4 h-4 text-[#c9a84c] group-hover:translate-x-1 transition-transform" /></h4>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 -translate-x-4 translate-y-4">
                  <Activity size={160} />
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
                 <button className="rounded-2xl px-12 py-4 bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-bold transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
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
              title="Investments" 
              items={[
                { label: "Mutual Funds", icon: Activity },
                { label: "Demat & Securities", icon: Wallet },
                { label: "NPS", icon: LayoutGrid },
                { label: "PPF", icon: PiggyBank }
              ]} 
            />
            <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Loans" 
              items={[
                { label: "Personal Loan", icon: UserCheck },
                { label: "Loan Against Mutual Fund", icon: HandCoins },
                { label: "Home Loan", icon: Landmark },
                { label: "Gold Loan", icon: Gem }
              ]} 
            />
            <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Deposits" 
              items={[
                { label: "Fixed Deposit", icon: ShieldCheck },
                { label: "Recurring Deposit", icon: Calendar },
                { label: "Annuity Deposit", icon: FileText },
                { label: "Auto Sweep", icon: Zap }
              ]} 
            />
            <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Insurance" 
              items={[
                { label: "Life", icon: HeartPulse },
                { label: "Health", icon: ShieldCheck },
                { label: "Accident", icon: Info },
                { label: "Motor", icon: Car }
              ]} 
            />
             <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Cards" 
              items={[
                { label: "Credit Cards", icon: CreditCard },
                { label: "Debit Cards", icon: Wallet },
                { label: "Forex Cards", icon: Globe2 },
                { label: "NCMC", icon: Smartphone }
              ]} 
            />
             <div className="h-px bg-gray-50 my-8" />
            <SidebarGroup 
              title="Services" 
              items={[
                { label: "Account Related", icon: LayoutGrid },
                { label: "Tax Related", icon: BadgePercent },
                { label: "Cheque Services", icon: FileText },
                { label: "e-Secure Lock", icon: ShieldCheck }
              ]} 
            />
          </div>
          
        </div>
      </main>

      {/* QUICK LINK FOOTER */}
      <footer className="mt-20 border-t border-gray-100 bg-[#1a1f36] text-white/50 text-[10px] py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-4 font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">About CredTrust</a>
          <a href="#" className="hover:text-white transition-colors">Digital Banking</a>
          <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
};

export default MemberDashboard;
