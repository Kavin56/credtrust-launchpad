import React, { useState } from 'react';
import { 
  Landmark, 
  ChevronRight, 
  Home, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Database, 
  CreditCard, 
  Calculator,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Briefcase,
  Gem,
  CircleDollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const loanTypes = [
  { 
    id: 'gold', 
    name: 'Swamy Gold Loan', 
    short: 'GL',
    rate: 12.00, 
    max: 200000, 
    desc: 'Instant liquidity against gold ornaments with minimal documentation.',
    icon: Gem,
    color: 'border-amber-200 bg-amber-50/30 text-amber-600'
  },
  { 
    id: 'shg', 
    name: 'Annadanam SHG Credit', 
    short: 'SHG',
    rate: 10.00, 
    max: 500000, 
    desc: 'Community lending for Self Help Groups and NGOs at subsidised rates.',
    icon: Users,
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-600'
  },
  { 
    id: 'emergency', 
    name: 'Udaya Emergency Loan', 
    short: 'EL',
    rate: 15.00, 
    max: 25000, 
    desc: 'Quick flat-rate loan for immediate personal or medical emergencies.',
    icon: Zap,
    color: 'border-blue-200 bg-blue-50/30 text-blue-600'
  },
  { 
    id: 'festival', 
    name: 'Gopuram Festival Loan', 
    short: 'FL',
    rate: 12.50, 
    max: 100000, 
    desc: 'Limited-period loan for family festivals, education, or travel.',
    icon: Star,
    color: 'border-purple-200 bg-purple-50/30 text-purple-600'
  }
];

const LoanApplicationPage = () => {
  const [step, setStep] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(loanTypes[0]);
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);
  const navigate = useNavigate();

  const calculateEMI = () => {
    const r = selectedLoan.rate / (12 * 100);
    const n = tenure;
    const p = amount;
    // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = () => {
    toast.success("Loan application submitted for approval!");
    navigate("/accounts?tab=loans");
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
          <span className="text-[#1a1f36] font-bold">Apply for Loan</span>
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
                      {i === 1 ? "Type" : i === 2 ? "Tenure" : i === 3 ? "Security" : "Review"}
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
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Choose Loan Category</h2>
                       <p className="text-gray-500 text-sm">Select the credit solution that fits your requirements</p>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                      {loanTypes.map((l) => (
                        <button 
                           key={l.id}
                           onClick={() => setSelectedLoan(l)}
                           className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${
                              selectedLoan.id === l.id ? "border-[#1a1f36] shadow-xl scale-[1.02]" : "border-gray-100 hover:border-gray-200"
                           } ${l.color}`}
                        >
                           <div className="relative z-10 space-y-4">
                              <div className="flex justify-between items-start">
                                 <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                    <l.icon className="w-5 h-5" />
                                 </div>
                                 <span className="text-[18px] font-black">{l.rate}% p.a.</span>
                              </div>
                              <h3 className="font-bold text-[16px] text-[#1a1f36]">{l.name}</h3>
                              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px]">{l.desc}</p>
                              <div className="flex justify-between items-end">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Limit</p>
                                 <p className="text-[14px] font-black text-[#1a1f36]">₹{l.max.toLocaleString()}</p>
                              </div>
                           </div>
                           {selectedLoan.id === l.id && (
                              <div className="absolute -bottom-4 -right-4 transform rotate-12 opacity-5 scale-150">
                                 <Briefcase size={120} />
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
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white shadow-sm ${selectedLoan.color}`}>
                         <selectedLoan.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-[#1a1f36]">{selectedLoan.name}</h3>
                         <p className="text-[11px] text-gray-400">Interest Calculation: <span className="font-bold text-[#1a1f36]">{selectedLoan.rate}% p.a. Reducing</span></p>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="space-y-4">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Loan Amount (₹)</Label>
                            <Input 
                               type="number" 
                               value={amount} 
                               onChange={(e) => setAmount(Math.min(Number(e.target.value), selectedLoan.max))}
                               className="h-16 text-2xl font-black rounded-2xl border-gray-100 focus:border-[#1a1f36] transition-all"
                            />
                            <div className="flex justify-between items-center text-[10px] font-bold">
                               <p className="text-gray-400">Scale current limit</p>
                               <p className="text-[#1a1f36]">Max: ₹{selectedLoan.max.toLocaleString()}</p>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <Label className="text-[12px] font-bold uppercase tracking-widest text-gray-400">Repayment Period (Months)</Label>
                            <div className="grid grid-cols-4 gap-3">
                               {[12, 24, 36, 48].map(m => (
                                 <button 
                                    key={m}
                                    onClick={() => setTenure(m)}
                                    className={`py-3 rounded-xl font-bold border transition-all text-xs ${
                                       tenure === m ? "bg-[#1a1f36] text-white border-[#1a1f36]" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                    }`}
                                 >
                                    {m}m
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="bg-[#1a1f36] rounded-[40px] p-8 text-white flex flex-col justify-center text-center space-y-6 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                         
                         <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#c9a84c]">
                            <Calculator className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-none">Estimated Monthly EMI</p>
                            <p className="text-4xl font-black text-white">₹{Math.round(calculateEMI()).toLocaleString()}</p>
                         </div>
                         <div className="pt-6 border-t border-white/10 flex justify-between text-[11px] font-bold text-white/60 uppercase">
                            <span>Interest Payable</span>
                            <span className="text-white">₹{Math.round(calculateEMI() * tenure - amount).toLocaleString()}</span>
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
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Security & Guarantor</h2>
                       <p className="text-gray-500 text-sm">Most society loans require a member guarantor or collateral</p>
                   </div>

                   <div className="max-w-lg mx-auto space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 cursor-pointer hover:border-[#1a1f36] transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#1a1f36]">
                               <Users className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-[#1a1f36]">Existing Member Guarantor</h4>
                            <p className="text-[10px] text-gray-400 leading-tight">Must have active share capital &gt; ₹5,000</p>
                         </div>
                         <div className="space-y-4 p-6 bg-[#1a1f36] rounded-3xl border border-transparent shadow-xl shadow-indigo-900/10 text-white cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#c9a84c]">
                               <Gem className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold">Physical Collateral (Gold/Asset)</h4>
                            <p className="text-[10px] text-white/50 leading-tight">Instant approval after physical verification</p>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4">
                         <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Guarantor Member ID / Remarks</Label>
                         <Input placeholder="Enter ID or Description of security" className="h-14 rounded-2xl border-gray-100" />
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                         <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1" />
                         <div className="space-y-1">
                            <h5 className="text-[13px] font-bold text-emerald-900 leading-none">KYC Pre-Approved</h5>
                            <p className="text-[11px] text-emerald-700 leading-tight">Your KYC status is verified. No further ID proofs required.</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                   key="step4" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-4">
                       <div className="w-20 h-20 rounded-full bg-[#c9a84c] text-white flex items-center justify-center mx-auto border-4 border-white shadow-xl shadow-[#c9a84c]/20">
                          <CircleDollarSign className="w-10 h-10" />
                       </div>
                       <div className="space-y-1">
                          <h2 className="text-2xl font-bold text-[#1a1f36]">Final Application Review</h2>
                          <p className="text-gray-400 text-sm">Please verify the terms below before signing digitally</p>
                       </div>
                   </div>

                   <div className="bg-[#f8fafc] rounded-[40px] border border-gray-100 p-10 space-y-8">
                      <div className="flex justify-between items-center px-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Product</p>
                            <p className="text-[18px] font-bold text-[#1a1f36]">{selectedLoan.name}</p>
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processing Fee</p>
                            <p className="text-[18px] font-bold text-emerald-600">₹0 (Waiver)</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-px bg-gray-200 overflow-hidden rounded-[24px]">
                         <div className="bg-white p-8 space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested Principal</p>
                            <p className="text-[26px] font-black text-[#1a1f36]">₹{amount.toLocaleString()}</p>
                         </div>
                         <div className="bg-white p-8 space-y-1 text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Installment / Period</p>
                            <p className="text-[26px] font-black text-[#6b21a8]">{tenure} Months</p>
                         </div>
                      </div>

                      <div className="bg-[#1a1f36] p-8 rounded-[32px] flex items-center justify-between text-white">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                               <ShieldCheck className="w-6 h-6 text-[#c9a84c]" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calculated EMI</p>
                               <p className="text-2xl font-black">₹{Math.round(calculateEMI()).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="h-10 w-px bg-white/10" />
                         <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-[#c9a84c]">Total Interest</p>
                            <p className="text-2xl font-black">₹{Math.round(calculateEMI() * tenure - amount).toLocaleString()}</p>
                         </div>
                      </div>

                      <p className="text-[11px] text-gray-400 font-bold text-center px-10 leading-relaxed uppercase tracking-widest">
                         By clicking submit, I authorize CredTrust Society to verify my eligibility and assess security as per the State Cooperative Act.
                      </p>
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
              ) : (
                <Link to="/accounts?tab=loans" className="text-[13px] font-bold text-gray-400 hover:text-[#1a1f36] transition-colors pl-4">Cancel Application</Link>
              )}

              {step < 4 ? (
                <Button onClick={handleNext} className="h-14 px-12 font-bold bg-[#1a1f36] text-white rounded-2xl hover:bg-[#2d3356] shadow-lg shadow-black/10">
                   Continue
                   <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="h-14 px-16 font-bold bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] shadow-lg shadow-amber-900/10">
                   Submit Application
                   <Zap className="w-4 h-4 ml-2" />
                </Button>
              )}
           </div>
        </section>
        
        {/* Loan Help Banner */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
           <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
              <Landmark className="w-6 h-6 text-[#c9a84c]" />
              <div>
                 <p className="text-[13px] font-bold text-[#1a1f36]">Fast Approval</p>
                 <p className="text-[10px] text-gray-400">Within 24 working hours</p>
              </div>
           </div>
           <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
              <Database className="w-6 h-6 text-[#6b21a8]" />
              <div>
                 <p className="text-[13px] font-bold text-[#1a1f36]">Paperless Digital</p>
                 <p className="text-[10px] text-gray-400">Secure e-verification</p>
              </div>
           </div>
           <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                 <p className="text-[13px] font-bold text-[#1a1f36]">Fair Interest</p>
                 <p className="text-[10px] text-gray-400">Fixed/Reducing options</p>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanApplicationPage;
