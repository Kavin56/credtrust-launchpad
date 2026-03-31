import React from 'react';
import { 
  Settings, 
  Percent, 
  FileText, 
  Lock, 
  ChevronRight, 
  Home, 
  Smartphone, 
  ShieldCheck,
  Zap,
  Activity,
  Headset,
  Search,
  ArrowRight,
  MonitorSmartphone,
  Download,
  AlertCircle,
  Link,
  MessageSquare,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ServiceDirectory = ({ title, items }: any) => (
  <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-6">
     <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest px-4">{title}</h3>
     <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
           <div key={i} className="p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between group cursor-pointer active:scale-95">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#6b21a8] shadow-sm transition-all">
                    <item.icon className="w-6 h-6" />
                 </div>
                 <span className="text-[14px] font-bold text-[#1a1f36] leading-tight group-hover:text-[#6b21a8] transition-colors">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all" />
           </div>
        ))}
     </div>
  </div>
);

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <RouterLink to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </RouterLink>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Banking Services</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           <div className="flex-grow space-y-12">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black text-[#1a1f36]">Service Directory</h2>
                    <p className="text-sm text-gray-400 font-medium">One-stop shop for all your banking requests and configurations</p>
                 </div>
                 <div className="flex items-center bg-white h-14 px-6 rounded-2xl border border-gray-100 shadow-sm w-80 group focus-within:border-[#6b21a8] transition-all">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search services..." className="bg-transparent border-none outline-none pl-3 text-sm font-bold w-full" />
                 </div>
              </div>

              <div className="grid gap-8">
                 <ServiceDirectory 
                    title="Account Related"
                    items={[
                       { name: "Order Certificate", icon: FileCheck },
                       { name: "Statement Requests", icon: FileText },
                       { name: "Manage Nomination", icon: HelpCircle },
                       { name: "Address Update", icon: Search }
                    ]}
                 />

                 <ServiceDirectory 
                    title="Tax & Finance"
                    items={[
                       { name: "Form 15G / 15H", icon: Percent },
                       { name: "Interest Certificate", icon: Zap },
                       { name: "Tax Dashboard", icon: Activity },
                       { name: "Annual Summary", icon: FileText }
                    ]}
                 />

                 <ServiceDirectory 
                    title="Cheque & Security"
                    items={[
                       { name: "Order Cheque Book", icon: FileText },
                       { name: "e-Secure Lock", icon: Lock },
                       { name: "Block / Unblock NetBanking", icon: ShieldCheck },
                       { name: "Manage IP Whitelist", icon: MonitorSmartphone }
                    ]}
                 />
              </div>
           </div>

           <aside className="lg:w-[320px] space-y-8 shrink-0">
              <div className="bg-[#1a1f36] rounded-[40px] p-8 text-white space-y-8 shadow-2xl shadow-indigo-900/10">
                 <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-[#c9a84c] shadow-inner backdrop-blur-md">
                       <Headset className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold leading-tight">24/7 Digital Support</h4>
                    <p className="text-[12px] text-white/50 leading-relaxed font-medium uppercase tracking-tight">
                       Have questions about our digital services? Connect with our virtual assistant for instant support.
                    </p>
                 </div>
                 <Button className="w-full h-14 bg-[#c9a84c] text-white rounded-2xl hover:bg-white hover:text-[#1a1f36] font-black text-[13px] shadow-xl shadow-black/20">
                    Connect to AI Chat
                 </Button>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 p-8 space-y-8 shadow-sm">
                 <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Recent Requests</h4>
                 <div className="space-y-6">
                    {[
                      { name: "Interest Certificate", status: "Completed", date: "Yesterday" },
                      { name: "Cheque Book Order", status: "In Transit", date: "02 Apr 2026" }
                    ].map((req, i) => (
                       <div key={i} className="flex flex-col gap-1 border-l-4 border-[#6b21a8] pl-4">
                          <p className="text-[13px] font-bold text-[#1a1f36]">{req.name}</p>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                             <span className={req.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}>{req.status}</span>
                             <span className="text-gray-300">•</span>
                             <span className="text-gray-400">{req.date}</span>
                          </div>
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

export default ServicesPage;
