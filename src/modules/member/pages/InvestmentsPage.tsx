import React from 'react';
import { 
  Activity, 
  Briefcase, 
  PiggyBank, 
  Wallet, 
  ChevronRight, 
  Home, 
  ArrowRight,
  TrendingUp,
  PieChart,
  Target,
  BarChart4,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const InvestmentProduct = ({ name, icon: Icon, desc, color, balance }: any) => (
  <div className="bg-white rounded-[40px] border border-gray-100 p-8 hover:border-[#6b21a8] transition-all group flex flex-col h-[320px] shadow-sm">
     <div className="flex-grow space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
           <Icon className="w-8 h-8" />
        </div>
        <div>
           <h3 className="text-xl font-bold text-[#1a1f36]">{name}</h3>
           <p className="text-[12px] text-gray-400 font-medium leading-relaxed mt-2 line-clamp-3">{desc}</p>
        </div>
     </div>
     <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div className="space-y-0.5">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Portfolio Value</p>
           <p className="text-[20px] font-black text-[#1a1f36]">{balance}</p>
        </div>
        <button className="w-11 h-11 rounded-2xl bg-[#f8fafc] text-[#1a1f36] flex items-center justify-center border border-transparent hover:border-indigo-100 hover:bg-[#6b21a8] hover:text-white transition-all shadow-sm">
           <ChevronRight className="w-5 h-5" />
        </button>
     </div>
  </div>
);

const InvestmentsPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Investments</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-grow space-y-10">
             <section className="bg-gradient-to-br from-[#1a1f36] to-[#6b21a8] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                   <div className="space-y-6 max-w-md">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-widest mb-2">
                         <TrendingUp className="w-3.5 h-3.5 text-[#c9a84c]" />
                         Market Performance: +12.4%
                      </div>
                      <h2 className="text-4xl font-black leading-tight">Grow Your Wealth <br />With CredTrust</h2>
                      <p className="text-white/60 text-sm leading-relaxed">
                         Access institutional-grade investment portfolios, automated tax-saving schemes, and real-time market insights.
                      </p>
                      <div className="flex gap-4 pt-4">
                         <Button className="h-14 px-10 bg-[#c9a84c] text-white rounded-2xl hover:bg-white hover:text-[#1a1f36] font-black transition-all shadow-xl shadow-black/20">
                            Explore Funds
                         </Button>
                         <Button variant="outline" className="h-14 px-10 border-white/20 text-white rounded-2xl hover:bg-white/10 font-bold">
                            View Advice
                         </Button>
                      </div>
                   </div>
                   
                   <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 w-full md:w-[360px] space-y-8">
                      <div className="flex justify-between items-center">
                         <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Total Portfolio</p>
                         <PieChart className="w-5 h-5 text-[#c9a84c]" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-4xl font-black">₹4,82,340.50</p>
                         <p className="text-[12px] font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +₹42,120.00 this month
                         </p>
                      </div>
                      <div className="pt-6 border-t border-white/10 space-y-4">
                         <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/40">
                            <span>Risk Profile</span>
                            <span className="text-white">Moderate</span>
                         </div>
                         <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9a84c] w-[65%]" />
                         </div>
                      </div>
                   </div>
                </div>
             </section>

             <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                <InvestmentProduct 
                   name="Mutual Funds" 
                   icon={Activity} 
                   desc="Diversified portfolios managed by professional fund managers."
                   color="bg-purple-50 text-[#6b21a8]"
                   balance="₹2,40,000"
                />
                <InvestmentProduct 
                   name="NPS" 
                   icon={PiggyBank} 
                   desc="National Pension Scheme for systemic long-term retirement savings."
                   color="bg-amber-50 text-amber-600"
                   balance="₹1,24,000"
                />
                <InvestmentProduct 
                   name="PPF" 
                   icon={Wallet} 
                   desc="Public Provident Fund - Tax-free interest and full capital protection."
                   color="bg-emerald-50 text-emerald-600"
                   balance="₹84,000"
                />
                <InvestmentProduct 
                   name="Demat & Stocks" 
                   icon={Briefcase} 
                   desc="Secure platform for trading equities, bonds, and government securities."
                   color="bg-blue-50 text-blue-600"
                   balance="₹34,340"
                />
             </div>

             <section className="bg-white rounded-[40px] border border-gray-100 p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-[#1a1f36]">Investment Goals</h3>
                   <Link to="#" className="text-[11px] font-black text-[#6b21a8] uppercase tracking-widest">+ Create New Goal</Link>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                   {[
                     { name: "Retirement 2045", target: "₹50L", current: "₹12.4L", progress: 24, icon: Target },
                     { name: "Global Education", target: "₹25L", current: "₹8.2L", progress: 32, icon: GraduationCapLocal }
                   ].map((goal, i) => (
                     <div key={i} className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#6b21a8] shadow-sm">
                              <goal.icon className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="font-bold text-[#1a1f36]">{goal.name}</h4>
                              <p className="text-[11px] text-gray-400 font-medium">Target: {goal.target}</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-gray-400">Current Saved</span>
                              <span className="text-[#1a1f36]">{goal.current}</span>
                           </div>
                           <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-gray-100">
                              <div className="h-full bg-[#6b21a8]" style={{ width: `${goal.progress}%` }} />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </div>

          <aside className="lg:w-[320px] space-y-8 shrink-0">
             <div className="bg-[#1a1f36] rounded-[40px] p-8 text-white space-y-8 relative overflow-hidden">
                <BarChart4 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                <div className="space-y-2">
                   <h4 className="text-xl font-bold">Tax Savings</h4>
                   <p className="text-[11px] text-white/50 leading-relaxed uppercase tracking-tight font-bold">FY 2025-26 | Section 80C</p>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[12px] font-bold">
                      <span className="text-white/40 font-medium tracking-tight uppercase">Utilized</span>
                      <span>₹84,000</span>
                   </div>
                   <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[56%]" />
                   </div>
                   <p className="text-[10px] text-center text-white/40">You can save ₹66,000 more in taxes.</p>
                </div>
                <Button className="w-full h-12 rounded-2xl bg-[#c9a84c] text-white hover:bg-white hover:text-[#1a1f36] font-black text-[12px] shadow-xl shadow-black/20">
                   Maximize Savings
                </Button>
             </div>

             <div className="bg-white rounded-[40px] border border-gray-100 p-8 space-y-8">
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-2">Quick Actions</h4>
                <div className="grid gap-4">
                   {[
                     { name: "Mandate History", icon: CalendarLocal },
                     { name: "Risk Profilometer", icon: Activity },
                     { name: "Consolidated Statement", icon: FileText }
                   ].map((item, i) => (
                      <button key={i} className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-indigo-50 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#6b21a8] shadow-sm">
                               <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[13px] font-bold text-[#1a1f36]">{item.name}</span>
                         </div>
                         <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-[#6b21a8]" />
                      </button>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Internal icon helpers
const GraduationCapLocal = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const CalendarLocal = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default InvestmentsPage;
