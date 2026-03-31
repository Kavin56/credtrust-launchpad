import { motion } from "framer-motion";
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
import { Link } from "react-router-dom";

const quickActions = [
  { label: "Welcome to Yono", icon: Sparkles, bg: "bg-blue-50/50", color: "text-blue-600" },
  { label: "Security", icon: ShieldCheck, bg: "bg-indigo-50/50", color: "text-indigo-600" },
  { label: "Explore", icon: Compass, bg: "bg-amber-50/50", color: "text-amber-600" },
  { label: "Offers", icon: Gift, bg: "bg-pink-50/50", color: "text-pink-600" },
  { label: "Discover", icon: Smartphone, bg: "bg-purple-50/50", color: "text-purple-600" },
  { label: "Savings Ac", icon: PiggyBank, bg: "bg-emerald-50/50", color: "text-emerald-600" },
  { label: "Insurance", icon: HeartPulse, bg: "bg-rose-50/50", color: "text-rose-600" },
  { label: "Education", icon: GraduationCap, bg: "bg-sky-50/50", color: "text-sky-600" },
];

const SidebarGroup = ({ title, items }: { title: string, items: any[] }) => (
  <div className="mb-10 last:mb-0 bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-[11px] font-bold text-[#1a1f36] uppercase tracking-widest">{title}</h3>
      <button className="text-[9px] font-bold text-[#c9a84c] uppercase tracking-widest hover:text-[#1a1f36] transition-colors">
        View All
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, idx) => (
        <button key={idx} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all group/item">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-white group-hover/item:text-[#c9a84c] group-hover/item:shadow-sm border border-transparent group-hover/item:border-gray-100 transition-all">
            <item.icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 group-hover/item:text-[#1a1f36] text-center leading-tight transition-colors">
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
                <h1 className="font-serif text-[28px] text-gray-500 mb-10 tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-500">
                  Hello <span className="text-[#1a1f36] font-bold underline decoration-[#c9a84c]/30 decoration-4 underline-offset-8">{userName.split(' ')[0]}</span>, <span className="italic opacity-80">Let's get started!</span>
                </h1>
                
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-8">
                  {quickActions.map((action, idx) => (
                    <button key={idx} className="flex flex-col items-center gap-4 transition-all group/action">
                      <div className={`w-16 h-16 rounded-full ${action.bg} flex items-center justify-center border border-white shadow-inner group-hover/action:scale-110 group-hover/action:-rotate-6 transition-all duration-300`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 group-hover/action:text-[#1a1f36] text-center leading-tight transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RELATIONSHIP OVERVIEW (High-Fidelity) */}
            <section>
              <h2 className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-8 h-[1px] bg-gray-200" />
                Relationship Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Transaction Card */}
                <div className="bg-gradient-to-br from-[#1a1f36] via-[#2d3356] to-[#1a1f36] rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Transaction Accounts</h3>
                      <div className="w-10 h-6 bg-white/10 rounded-md border border-white/20 flex items-center justify-center">
                        <div className="w-6 h-4 bg-[#c9a84c]/20 rounded-sm" />
                      </div>
                    </div>
                    <div className="space-y-1 mb-10">
                      <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Combined Balance</p>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold font-sans tracking-tight">₹XXXX.xx</span>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <Search className="w-4 h-4 text-[#c9a84c]" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-bold transition-all border border-white/10">
                        View Accounts
                      </button>
                      <button className="flex-1 py-3 bg-[#c9a84c] text-[#1a1f36] rounded-2xl text-[11px] font-bold transition-all hover:bg-white">
                        Transactions
                      </button>
                    </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full blur-[80px] -translate-y-12 translate-x-12" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
                </div>

                {/* Deposits Card */}
                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-black/[0.02] relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">Deposits</h3>
                    <div className="space-y-3 mb-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <PiggyBank className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-lg font-bold text-[#1a1f36] leading-tight">Grow your money faster</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">Check out our high-yield fixed and recurring deposits.</p>
                    </div>
                    <button className="w-full py-4 mt-8 bg-gray-50 hover:bg-indigo-50 rounded-[20px] text-[11px] font-bold text-[#1a1f36] transition-all flex items-center justify-center gap-2 group/btn">
                      Explore Deposits
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Loans Card */}
                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-black/[0.02] relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">Loans</h3>
                    <div className="space-y-3 mb-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                        <HandCoins className="w-6 h-6 text-amber-500" />
                      </div>
                      <p className="text-lg font-bold text-[#1a1f36] leading-tight">Find the perfect loan</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">Ready to make that big purchase? We have you covered.</p>
                    </div>
                    <button className="w-full py-4 mt-8 bg-gray-50 hover:bg-amber-50 rounded-[20px] text-[11px] font-bold text-[#1a1f36] transition-all flex items-center justify-center gap-2 group/btn">
                      Manage Loans
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* PAYMENTS & TRANSFERS (Refined) */}
              <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-black/[0.03]">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-sm font-bold text-[#1a1f36]">Payments & Transfers</h3>
                  <div className="flex bg-gray-50 p-1 rounded-xl">
                    <button className="px-5 py-2 text-[10px] font-bold bg-white text-[#1a1f36] rounded-lg shadow-sm">FUND TRANSFER</button>
                    <button className="px-5 py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors">BILL PAYMENTS</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Quick Transfer", desc: "Up to ₹50,000", icon: Zap, bg: "bg-orange-50", text: "text-orange-500" },
                    { label: "Send Money", desc: "Own/Other Accounts", icon: IndianRupee, bg: "bg-blue-50", text: "text-blue-500" },
                    { label: "Send Money Abroad", desc: "Global Transfers", icon: Globe2, bg: "bg-emerald-50", text: "text-emerald-500" },
                    { label: "Schedule Pay", desc: "Automated Payments", icon: Calendar, bg: "bg-purple-50", text: "text-purple-500" }
                  ].map((item, idx) => (
                    <button key={idx} className="flex flex-col gap-4 p-5 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-black/[0.02] border border-transparent hover:border-gray-100 transition-all group/item">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.text} group-hover/item:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[13px] font-bold text-[#1a1f36] mb-1">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] block mb-6">Recent Transfers</span>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {["PR", "KS", "AD"].map((init, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {init}
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-4 border-white bg-[#c9a84c] flex items-center justify-center text-[10px] font-bold text-[#1a1f36]">
                        +
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#1a1f36] opacity-40 italic">Select beneficiary...</span>
                  </div>
                </div>
              </section>

              {/* UPCOMING PAYMENTS */}
              <section className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#1a1f36] uppercase tracking-widest mb-12 self-start">Upcoming Payments</span>
                <div className="w-48 h-48 bg-[#f8fafc] rounded-full flex items-center justify-center relative mb-8 group">
                  <Calendar className="w-16 h-16 text-indigo-100 group-hover:text-indigo-200 transition-colors" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#c9a84c] rounded-md animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-[#1a1f36] mb-2">Never Miss Your Payments Now</h4>
                <p className="text-[11px] text-gray-400 max-w-[200px] mb-8 leading-relaxed">Track and get reminder for your upcoming Payments</p>
                <Button className="rounded-full px-8 bg-transparent border-2 border-[#c9a84c] text-[#c9a84c] font-bold hover:bg-[#c9a84c] hover:text-white transition-all text-sm h-11">
                  Pay Bills
                </Button>
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
          
          {/* SIDEBAR (25%) */}
          <div className="lg:w-[25%] space-y-2 lg:sticky lg:top-36 shrink-0 h-fit">
            <SidebarGroup 
              title="Investments" 
              items={[
                { label: "Mutual Funds", icon: Activity },
                { label: "Demat & Securities", icon: Wallet },
                { label: "NPS", icon: LayoutGrid },
                { label: "PPF", icon: PiggyBank }
              ]} 
            />
            <SidebarGroup 
              title="Loans" 
              items={[
                { label: "Personal Loan", icon: UserCheck },
                { label: "Loan Against Mutual Fund", icon: HandCoins },
                { label: "Home Loan", icon: Landmark },
                { label: "Gold Loan", icon: Gem }
              ]} 
            />
            <SidebarGroup 
              title="Deposits" 
              items={[
                { label: "Fixed Deposit", icon: ShieldCheck },
                { label: "Recurring Deposit", icon: Calendar },
                { label: "Annuity Deposit", icon: FileText },
                { label: "Auto Sweep", icon: Zap }
              ]} 
            />
            <SidebarGroup 
              title="Insurance" 
              items={[
                { label: "Life", icon: HeartPulse },
                { label: "Health", icon: ShieldCheck },
                { label: "Accident", icon: Info },
                { label: "Motor", icon: Car }
              ]} 
            />
            <SidebarGroup 
              title="Cards" 
              items={[
                { label: "Credit Cards", icon: CreditCard },
                { label: "Debit Cards", icon: Wallet },
                { label: "Forex Cards", icon: Globe2 },
                { label: "NCMC", icon: Smartphone }
              ]} 
            />
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
