import React, { useState } from 'react';
import { 
  PiggyBank, 
  ChevronRight, 
  Home, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Landmark, 
  CreditCard, 
  Calculator,
  ShieldCheck,
  Zap,
  Star,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/modules/login/AuthContext";

const schemes = [
  { 
    id: 'sfd', 
    name: 'Saranam Fixed Deposit', 
    short: 'SFD',
    rate: 8.25, 
    min: 10000, 
    type: 'Fixed',
    desc: 'Our standard high-yield fixed deposit with guaranteed returns.',
    color: 'border-purple-200 bg-purple-50/30'
  },
  { 
    id: 'elite', 
    name: 'Mahadevan Elite Deposit', 
    short: 'HNI',
    rate: 9.10, 
    min: 2500000, 
    type: 'Fixed',
    desc: 'Exclusive high-balance deposit for institutional and HNI members.',
    color: 'border-amber-200 bg-amber-50/30'
  },
  { 
    id: 'mis', 
    name: 'Padi Monthly Income Scheme', 
    short: 'MIS',
    rate: 8.50, 
    min: 50000, 
    type: 'Monthly',
    desc: 'Regular monthly payouts for senior citizens with healthcare perks.',
    color: 'border-blue-200 bg-blue-50/30'
  },
  { 
    id: 'irumudi', 
    name: 'Irumudi Recurring Plan', 
    short: 'RD',
    rate: 7.75, 
    min: 500, 
    type: 'Recurring',
    desc: 'Systematic monthly savings for small savers and salaried members.',
    color: 'border-emerald-200 bg-emerald-50/30'
  }
];

const DepositApplicationPage = () => {
  const [step, setStep] = useState(1);
  const [selectedScheme, setSelectedScheme] = useState(schemes[0]);
  const [amount, setAmount] = useState(selectedScheme.min);
  const [tenure, setTenure] = useState(12);
  const [accountId, setAccountId] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const calculateMaturity = () => {
    const rate = selectedScheme.rate / 100;
    const time = tenure / 12;
    if (selectedScheme.type === 'Recurring') {
       // RD Maturity Formula: P * [(1+r/n)^(nt)-1] / (1-(1+r/n)^(-1/n))
       // Simpler approx: Total * Rate * (n+1)/(2*12)
       return amount * tenure + (amount * tenure * (tenure + 1) * rate) / (2 * 12);
    }
    return amount + (amount * rate * time);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = async () => {
    try {
      await api.post("/deposits", {
        kind: selectedScheme.type === "Recurring" ? "RD" : "FD",
        principal: amount,
        rate: selectedScheme.rate,
        tenureMonths: tenure,
        startDate: new Date().toISOString(),
        payoutMode: "maturity",
        accountId,
      });
      toast.success("Deposit application submitted successfully!");
      navigate("/accounts");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Unable to create deposit");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/accounts" className="hover:text-[#6b21a8]">Accounts</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Open New Deposit</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stepper Progress */}
        <div className="flex justify-between items-center mb-12 px-6">
           {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= i ? "bg-[#1a1f36] text-white scale-110 shadow-lg shadow-black/10" : "bg-gray-200 text-gray-400"
                   }`}>
                      {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-[#1a1f36]" : "text-gray-300"}`}>
                      {i === 1 ? "Scheme" : i === 2 ? "Tenure" : i === 3 ? "Nominee" : "Review"}
                   </span>
                </div>
                {i < 4 && (
                   <div className="flex-grow h-0.5 bg-gray-100 mx-4 -mt-6">
                      <div className="h-full bg-[#1a1f36] transition-all duration-700" style={{ width: step > i ? '100%' : '0%' }} />
                   </div>
                )}
             </React.Fragment>
           ))}
        </div>

        <section className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                   key="step1" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Select Deposit Scheme</h2>
                       <p className="text-gray-500 text-sm">Choose the plan that best fits your financial goals</p>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                      {schemes.map((s) => (
                        <button 
                           key={s.id}
                           onClick={() => setSelectedScheme(s)}
                           className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${
                              selectedScheme.id === s.id ? "border-[#1a1f36] shadow-xl scale-[1.02]" : "border-gray-100 hover:border-gray-200"
                           } ${s.color}`}
                        >
                           <div className="relative z-10 space-y-4">
                              <div className="flex justify-between items-start">
                                 <div className="px-3 py-1 bg-white/60 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">
                                    {s.type}
                                 </div>
                                 <span className="text-[20px] font-black text-[#1a1f36]">{s.rate}%</span>
                              </div>
                              <h3 className="font-bold text-[15px] text-[#1a1f36] pr-8">{s.name}</h3>
                              <p className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</p>
                              <p className="text-[10px] font-bold text-[#1a1f36]">Min: ₹{s.min.toLocaleString()}</p>
                           </div>
                           {selectedScheme.id === s.id && (
                              <div className="absolute -bottom-2 -right-2 transform rotate-12 opacity-5 scale-150">
                                 <Landmark className="w-24 h-24" />
                              </div>
                           )}
                        </button>
                      ))}
                   </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                   key="step2" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-10"
                >
                   <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                      <div className="w-12 h-12 rounded-2xl bg-[#1a1f36] flex items-center justify-center text-[#c9a84c]">
                         {selectedScheme.id === 'irumudi' ? <PiggyBank className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                      </div>
                      <div>
                         <h3 className="font-bold text-[#1a1f36]">{selectedScheme.name}</h3>
                         <p className="text-[11px] text-gray-400">Current Rate: <span className="font-bold text-[#1a1f36]">{selectedScheme.rate}% p.a.</span></p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="space-y-4">
                           <Label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Deposit Amount (₹)</Label>
                           <Input 
                              type="number" 
                              value={amount} 
                              onChange={(e) => setAmount(Number(e.target.value))}
                               className="h-16 text-2xl font-black rounded-2xl border-gray-100 focus:border-[#1a1f36] transition-all"
                            />
                            <p className="text-[10px] font-bold text-gray-400">Minimum required: ₹{selectedScheme.min.toLocaleString()}</p>
                         </div>
                         
                        <div className="space-y-4">
                           <Label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Tenure (Months)</Label>
                            <div className="flex items-center gap-4">
                               {[6, 12, 24, 36, 60].map(m => (
                                 <button 
                                    key={m}
                                    onClick={() => setTenure(m)}
                                    className={`flex-grow py-3 rounded-xl font-bold border transition-all ${
                                       tenure === m ? "bg-[#1a1f36] text-white border-[#1a1f36]" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                    }`}
                                 >
                                    {m}m
                                 </button>
                               ))}
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Debit Account ID</Label>
                           <Input
                             placeholder="Choose member account ID"
                             value={accountId}
                             onChange={(e) => setAccountId(e.target.value)}
                             className="h-12 rounded-2xl border-gray-100 focus:border-[#1a1f36]"
                           />
                        </div>
                     </div>
                      </div>

                      <div className="bg-[#1a1f36]/[0.02] rounded-[40px] p-8 border border-gray-100 flex flex-col justify-center text-center space-y-6">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm border border-gray-50 text-[#6b21a8]">
                            <Calculator className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Maturity Value</p>
                            <p className="text-3xl font-black text-[#1a1f36]">₹{Math.round(calculateMaturity()).toLocaleString()}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Interest Earned</p>
                            <p className="text-lg font-bold text-emerald-600">+₹{Math.round(calculateMaturity() - (selectedScheme.type === 'Recurring' ? amount * tenure : amount)).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                   key="step3" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Add Nominee Details</h2>
                       <p className="text-gray-500 text-sm">Secure your investment by adding a beneficiary</p>
                   </div>

                   <div className="space-y-6 max-w-md mx-auto">
                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Nominee Name</Label>
                         <Input placeholder="Full Name" className="h-12 rounded-xl border-gray-100" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Relationship</Label>
                            <Input placeholder="e.g. Spouse" className="h-12 rounded-xl border-gray-100" />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Nominee Age</Label>
                            <Input type="number" placeholder="Enter Age" className="h-12 rounded-xl border-gray-100" />
                         </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                         <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                         <p className="text-[11px] text-amber-800 font-medium">By proceeding, you agree that the nominee named above is entitled to the proceeds in case of the depositors demise.</p>
                      </div>
                   </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                   key="step4" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="p-10 space-y-10"
                >
                   <div className="text-center space-y-4">
                       <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                          <ShieldCheck className="w-10 h-10" />
                       </div>
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Review Application</h2>
                   </div>

                   <div className="bg-gray-50 rounded-[40px] border border-gray-100 overflow-hidden">
                      <div className="p-8 space-y-8">
                         <div className="flex justify-between items-center text-center px-4">
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected Scheme</p>
                               <p className="text-[16px] font-bold text-[#1a1f36]">{selectedScheme.name}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate</p>
                               <p className="text-[16px] font-bold text-[#6b21a8]">{selectedScheme.rate}%</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-px bg-gray-200">
                            <div className="bg-white p-6 space-y-1">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Principal Amount</p>
                               <p className="text-[20px] font-black text-[#1a1f36]">₹{amount.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 space-y-1 text-right">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maturity Date</p>
                               <p className="text-[20px] font-black text-[#1a1f36]">{new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                         </div>

                         <div className="flex items-center justify-center gap-12 pt-4 bg-white/50 rounded-2xl py-6 border border-white">
                             <div className="flex flex-col items-center gap-1">
                                <Zap className="w-5 h-5 text-[#c9a84c]" />
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Maturity Value</span>
                                <span className="text-[24px] font-black text-[#1a1f36]">₹{Math.round(calculateMaturity()).toLocaleString()}</span>
                             </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="bg-gray-50/50 p-10 flex justify-between items-center border-t border-gray-100">
              {step > 1 ? (
                <Button onClick={handleBack} variant="ghost" className="h-14 px-8 font-bold text-gray-500 rounded-2xl hover:bg-[#1a1f36]/5">
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Back
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button onClick={handleNext} className="h-14 px-12 font-bold bg-[#1a1f36] text-white rounded-2xl hover:bg-[#2d3356] shadow-lg shadow-black/10">
                   Next Step
                   <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="h-14 px-12 font-bold bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] shadow-lg shadow-amber-900/10">
                   Open Deposit
                   <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              )}
           </div>
        </section>
        
        {/* Support Banner */}
        <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Licensed Cooperative</div>
           <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> DICGC Insured</div>
           <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> 50K+ Active Saviours</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DepositApplicationPage;
