import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Globe2, 
  ChevronRight, 
  Home, 
  ShieldCheck,
  Zap,
  Activity,
  Lock,
  Eye,
  ArrowRight,
  MonitorSmartphone,
  EyeOff,
  Percent,
  Download,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CardMockup = ({ type, number, expiry, balance, color, bg }: any) => {
  const [showNumber, setShowNumber] = useState(false);
  
  return (
    <div className={`p-10 rounded-[48px] ${bg} text-white relative overflow-hidden shadow-2xl flex flex-col justify-between h-[280px] group transition-all duration-700`}>
       <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl`} />
       
       <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{type}</p>
             <h4 className="text-xl font-black">{type === 'CREDIT' ? 'Gold Privilege' : 'Global Classic'}</h4>
          </div>
          <CreditCard className="w-8 h-8 text-white/20" />
       </div>

       <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
             <p className="text-2xl font-black tracking-[0.2em]">
                {showNumber ? number : 'XXXX XXXX XXXX '+ number.slice(-4)}
             </p>
             <button onClick={() => setShowNumber(!showNumber)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                {showNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
          </div>
          <div className="flex gap-12">
             <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Expiry</p>
                <p className="text-[14px] font-bold">{expiry}</p>
             </div>
             <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Status</p>
                <p className="text-[14px] font-bold text-emerald-400">ACTIVE</p>
             </div>
          </div>
       </div>

       <div className="absolute bottom-10 right-10 flex gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
             <Smartphone className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
             <Globe2 className="w-6 h-6" />
          </div>
       </div>
    </div>
  );
};

const CardsPage = () => {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Cards & Controls</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           <div className="flex-grow space-y-12">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black text-[#1a1f36]">My Cards</h2>
                    <p className="text-sm text-gray-400 font-medium">Manage limits, security and physical card settings</p>
                 </div>
                 <Button className="h-14 px-10 bg-[#1a1f36] text-white rounded-2xl font-black hover:bg-black shadow-xl shadow-indigo-900/10">
                    Apply for New Card
                 </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <CardMockup 
                    type="CREDIT" 
                    number="5412 8821 9901 7718" 
                    expiry="12 / 2029" 
                    bg="bg-gradient-to-br from-[#1a1f36] to-[#0f172a]"
                 />
                 <CardMockup 
                    type="DEBIT" 
                    number="4201 2281 3302 4410" 
                    expiry="05 / 2028" 
                    bg="bg-gradient-to-br from-[#6b21a8] to-[#1a1f36]"
                 />
              </div>

              <section className="bg-white rounded-[48px] border border-gray-100 p-10 space-y-10 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#1a1f36]">Card Security & Limits</h3>
                    <div className="flex gap-2">
                       <button className="px-6 py-2 bg-[#f8fafc] text-[11px] font-black rounded-xl border border-transparent shadow-sm hover:border-[#1a1f36] transition-all uppercase tracking-[0.1em]">Daily Use</button>
                       <button className="px-6 py-2 bg-[#6b21a8] text-white text-[11px] font-black rounded-xl shadow-lg shadow-indigo-900/10 transition-all uppercase tracking-[0.1em]">Card Controls</button>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { name: "Online Payments", icon: Globe2, status: true },
                      { name: "Tap & Pay (NFC)", icon: Smartphone, status: false },
                      { name: "Global Usage", icon: Globe2, status: true },
                      { name: "ATM Withdrawals", icon: Activity, status: true },
                      { name: "Auto Renewal", icon: Zap, status: true },
                      { name: "Spend Notifications", icon: ShieldCheck, status: true }
                    ].map((item, i) => (
                       <div key={i} className="p-6 bg-gray-50/50 rounded-[32px] border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between group cursor-pointer h-24">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#6b21a8]">
                                <item.icon className="w-5 h-5" />
                             </div>
                             <span className="text-[13px] font-bold text-[#1a1f36] leading-tight">{item.name}</span>
                          </div>
                          <div className={`w-10 h-6 rounded-full relative transition-colors ${item.status ? 'bg-[#1a1f36]' : 'bg-gray-200'}`}>
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.status ? 'right-1' : 'left-1'}`} />
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="p-8 bg-[#1a1f36]/[0.02] border-t border-gray-100 rounded-b-[48px] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#c9a84c] shadow-sm">
                          <Percent className="w-7 h-7" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-[16px] font-black text-[#1a1f36]">Set Custom Spend Limits</h4>
                          <p className="text-[12px] text-gray-400 font-medium">Weekly limit currently set to ₹25,000</p>
                       </div>
                    </div>
                    <Button className="h-12 px-8 bg-white border border-gray-200 text-[#1a1f36] rounded-xl hover:bg-gray-50 font-black text-[12px] shadow-sm">
                       Modify Limit
                    </Button>
                 </div>
              </section>
           </div>

           <aside className="lg:w-[320px] space-y-8 shrink-0">
              <div className="bg-rose-50 rounded-[40px] border border-rose-100 p-8 space-y-6 text-rose-900 shadow-sm">
                 <div className="space-y-4">
                    <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                       <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black leading-tight">Card Lost or Stolen?</h4>
                    <p className="text-[12px] font-medium leading-relaxed opacity-80 uppercase tracking-tight">
                       Block your cards instantly across all devices. This action is irreversible.
                    </p>
                 </div>
                 <Button className="w-full h-14 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-black shadow-xl shadow-rose-900/10">
                    Instant Block
                 </Button>
              </div>

              <div className="bg-amber-50/50 rounded-[40px] border border-amber-100 p-8 space-y-6 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                       <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                       <h5 className="text-[15px] font-black text-[#1a1f36]">Unclaimed Reward Points</h5>
                       <p className="text-[20px] font-black text-amber-600">8,420</p>
                    </div>
                 </div>
                 <Link to="#" className="w-full h-12 bg-white border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center font-black text-[12px] hover:bg-amber-100 transition-all shadow-sm">
                    Redeem to Cashback
                 </Link>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 p-8 space-y-6 shadow-sm">
                 <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Offers For You</h4>
                 <div className="space-y-4">
                    {[
                      { name: "5% Cashback at Amazon", exp: "2 days left" },
                      { name: "Buy 1 Get 1 Movie Ticket", exp: "Valid till Sunday" }
                    ].map((offer, i) => (
                       <div key={i} className="p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all cursor-pointer group">
                          <p className="text-[13px] font-bold text-[#1a1f36]">{offer.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-bold">{offer.exp}</p>
                       </div>
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

export default CardsPage;
