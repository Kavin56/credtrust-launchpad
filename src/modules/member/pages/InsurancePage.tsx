import React from 'react';
import { 
  HeartPulse, 
  Car, 
  Umbrella, 
  Info, 
  ChevronRight, 
  Home, 
  ShieldCheck,
  Zap,
  Activity,
  FileCheck,
  AlertTriangle,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const InsuranceProduct = ({ name, icon: Icon, desc, color, status }: any) => (
  <div className="bg-white rounded-[40px] border border-gray-100 p-8 hover:border-[#6b21a8] transition-all group flex flex-col justify-between h-72 shadow-sm">
     <div className="space-y-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform`}>
           <Icon className="w-8 h-8" />
        </div>
        <div>
           <h3 className="text-xl font-bold text-[#1a1f36]">{name}</h3>
           <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">{desc}</p>
        </div>
     </div>
     <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
        <div className="space-y-0.5">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status</p>
           <span className={`px-3 py-1 rounded-full text-[9px] font-bold border ${
              status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
           }`}>{status}</span>
        </div>
        <button className="px-6 py-2 bg-[#f8fafc] text-[#1a1f36] text-[11px] font-black rounded-xl border border-transparent hover:border-indigo-100 hover:bg-[#6b21a8] hover:text-white transition-all uppercase tracking-widest">
           {status === 'Active' ? 'View' : 'Apply'}
        </button>
     </div>
  </div>
);

const InsurancePage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Insurance</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-grow space-y-10">
             <section className="bg-gradient-to-br from-[#1a1f36] to-[#0f172a] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-20" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                   <div className="space-y-6 max-w-md">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-widest">
                         <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                         ISO 27001 Certified Protection
                      </div>
                      <h2 className="text-4xl font-black leading-tight">Comprehensive Protection <br />for Your Future</h2>
                      <p className="text-white/60 text-sm leading-relaxed font-medium">
                         Secure your family's health, assets, and lifestyle with our bespoke insurance products at competitive premiums.
                      </p>
                      <div className="flex gap-4 pt-4">
                         <Button className="h-14 px-10 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-black transition-all shadow-xl shadow-emerald-900/20">
                            Check Premiums
                         </Button>
                         <Button variant="outline" className="h-14 px-10 border-white/20 text-white rounded-2xl hover:bg-white/10 font-bold">
                            View Policy
                         </Button>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
                      {[
                        { label: "Claims Settled", value: "98.4%", icon: FileCheck },
                        { label: "Active Policies", value: "2", icon: Activity },
                        { label: "Next Renewal", value: "12 Oct 24", icon: History },
                        { label: "Trust Score", value: "High", icon: ShieldCheck }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/10 space-y-2">
                           <stat.icon className="w-5 h-5 text-emerald-400" />
                           <p className="text-2xl font-black">{stat.value}</p>
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </section>

             <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                <InsuranceProduct 
                   name="Life Insurance" 
                   icon={Umbrella} 
                   desc="Term and endowment plans to secure your family's financial future."
                   color="bg-blue-50 text-blue-600"
                   status="Active"
                />
                <InsuranceProduct 
                   name="Health Plan" 
                   icon={HeartPulse} 
                   desc="Cashless hospitalization and critical illness coverage for all ages."
                   color="bg-rose-50 text-rose-600"
                   status="Not Applied"
                />
                <InsuranceProduct 
                   name="Accident Cover" 
                   icon={Info} 
                   desc="Support during unforeseen medical crises or disability."
                   color="bg-amber-50 text-amber-600"
                   status="In Review"
                />
                <InsuranceProduct 
                   name="Motor Insurance" 
                   icon={Car} 
                   desc="Zero-depreciation and comprehensive cover for your vehicles."
                   color="bg-[#1a1f36]/5 text-[#1a1f36]"
                   status="Active"
                />
             </div>

             <section className="bg-white rounded-[40px] border border-gray-100 p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-bold text-[#1a1f36]">Active Policy Timeline</h3>
                   <button className="text-[11px] font-black text-[#6b21a8] uppercase tracking-widest">Download All Certificates</button>
                </div>
                <div className="space-y-4">
                   {[
                     { name: "Family Floater Gold", id: "POL-7718-2", date: "12 Oct 2024", amount: "₹18,200", status: "Upcoming Renewal" },
                     { name: "BMW X5 Insurance", id: "POL-1102-X", date: "05 Jan 2025", amount: "₹42,500", status: "Paid" }
                   ].map((pol, i) => (
                      <div key={i} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between flex-wrap gap-4 group hover:border-emerald-600 transition-all cursor-pointer">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-transparent group-hover:border-emerald-100">
                               <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                               <h4 className="text-[14px] font-bold text-[#1a1f36]">{pol.name}</h4>
                               <p className="text-[11px] text-gray-400 font-medium">Policy #: {pol.id}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-12">
                            <div className="text-left">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Renewal Date</p>
                               <p className="text-[13px] font-bold text-[#1a1f36]">{pol.date}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[15px] font-black text-emerald-600">{pol.amount}</p>
                               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{pol.status}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>

          <aside className="lg:w-[320px] space-y-8 shrink-0">
             <div className="bg-rose-50/50 rounded-[40px] border border-rose-100 p-8 space-y-8 text-rose-900">
                <div className="space-y-4">
                   <div className="w-16 h-16 rounded-[28px] bg-white flex items-center justify-center text-rose-600 shadow-sm">
                      <AlertTriangle className="w-8 h-8" />
                   </div>
                   <h4 className="text-xl font-bold leading-tight">Claiming Insurance?</h4>
                   <p className="text-[12px] text-rose-800 leading-relaxed font-medium opacity-80">
                      Our emergency claim settlement desk is available 24/7. Dial <span className="font-black">1800-CRED-TRUST</span> for assistance.
                   </p>
                </div>
                <Button className="w-full h-14 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 font-black text-[13px] shadow-xl shadow-rose-900/10">
                   Report Emergency
                </Button>
             </div>

             <div className="bg-white rounded-[40px] border border-gray-100 p-8 space-y-8 shadow-sm">
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-2">Knowledge Base</h4>
                <div className="space-y-4">
                   {[
                     { title: "Understand No Claim Bonus", time: "3m read" },
                     { title: "Life vs Health Insurance", time: "5m read" },
                     { title: "Section 80D Benefits", time: "2m read" }
                   ].map((item, i) => (
                      <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                         <h5 className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#6b21a8] transition-colors">{item.title}</h5>
                         <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
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

export default InsurancePage;
