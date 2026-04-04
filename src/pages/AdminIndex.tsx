import React from 'react';
import AdminLandingHeader from "@/components/AdminLandingHeader";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Gavel, 
  Landmark, 
  ArrowRight,
  ShieldAlert,
  FileText,
  PieChart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminIndex = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Member Governance",
      desc: "Complete oversight of member lifecycle, from onboarding and KYC approval to relationship management.",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Loan Portfolio Control",
      desc: "Advanced credit risk analysis, automated disbursement workflows, and real-time NPA tracking.",
      icon: Gavel,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Financial Auditing",
      desc: "Comprehensive ledger reconciliation, tax compliance reporting, and real-time trial balance monitoring.",
      icon: PieChart,
      color: "text-[#c9a84c]",
      bg: "bg-[#c9a84c]/10"
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-[#c9a84c]/30">
      <AdminLandingHeader />
      
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#1a1f36]">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#c9a84c] rounded-full blur-[160px]" />
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-600 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-[10px] font-black tracking-widest uppercase mb-8">
              Governance & Oversight
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.95]">
              Administrative <br /> <span className="text-[#c9a84c]">Control Center.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-400 font-medium mb-12">
              Empowering CredTrust management with high-fidelity tools for audit, member governance, and financial stewardship.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => navigate('/admin/login')}
                className="h-16 px-10 rounded-2xl bg-[#c9a84c] hover:bg-[#b89531] text-[#1a1f36] font-black text-lg transition-all shadow-xl shadow-[#c9a84c]/20"
              >
                Access Staff Portal
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <button className="text-white hover:text-[#c9a84c] font-bold transition-colors">
                View Audit Guidelines
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK STATS */}
      <div className="max-w-[1200px] mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 items-center">
          <div className="text-center md:border-r border-gray-100 last:border-0 p-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Managed Members</p>
             <h4 className="text-4xl font-bold text-[#1a1f36]">CT +8,200</h4>
          </div>
          <div className="text-center md:border-r border-gray-100 last:border-0 p-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portfolio Value</p>
             <h4 className="text-4xl font-bold text-[#1a1f36]">₹124.5 Cr</h4>
          </div>
          <div className="text-center p-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Compliance Rating</p>
             <h4 className="text-4xl font-bold text-emerald-600">AAA+</h4>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-bold text-[#1a1f36] mb-4 tracking-tight">Institutional Stewardship</h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto italic">Precision management for a growing cooperative ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl shadow-black/[0.02] group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-8 border-2 border-white shadow-sm`}>
                  <f.icon className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1f36] mb-4">{f.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                  {f.desc}
                </p>
                <button className="flex items-center gap-2 text-[13px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                  Access Portal <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURE BLOCK */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="bg-[#1a1f36] rounded-[48px] p-16 text-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10">
                   <ShieldCheck className="w-5 h-5 text-[#c9a84c]" />
                   <span className="text-[12px] font-bold text-white/80 uppercase tracking-widest">Enterprise Bank Security</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tighter">Authorized Access Personnel Only.</h2>
                <p className="text-white/40 max-w-lg mx-auto font-medium mb-12 italic">
                  By accessing the staff portal, you agree to the CredTrust Confidentiality and Data Stewardship Agreement.
                </p>
                <Button 
                  onClick={() => navigate('/admin/login')}
                  variant="outline" 
                  className="h-16 px-12 rounded-2xl border-white/20 hover:bg-white/5 text-white font-bold text-lg"
                >
                  Proceed to Login
                </Button>
             </div>
          </div>
        </div>
      </section>

      <Ticker />
      <Footer />
    </div>
  );
};

export default AdminIndex;
