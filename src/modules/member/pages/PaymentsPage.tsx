import React, { useState } from 'react';
import { 
  CreditCard, 
  ChevronRight, 
  Home, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  QrCode, 
  Smartphone, 
  Wallet,
  ShieldCheck,
  Zap,
  Star,
  Users,
  AlertCircle,
  Download,
  Calendar,
  Landmark,
  PiggyBank,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const pendingDues = [
  { 
    id: 'pay-1', 
    name: 'Saranam Fixed Deposit', 
    sub: 'Installment #4',
    type: 'FD/RD',
    amount: 5000, 
    due: '05 Apr 2026',
    status: 'Upcoming',
    icon: Landmark,
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  { 
    id: 'pay-2', 
    name: 'Udaya Emergency Credit', 
    sub: 'Monthly EMI',
    type: 'Loan',
    amount: 4250, 
    due: '31 Mar 2026',
    status: 'Due Today',
    icon: Zap,
    color: 'bg-rose-50 text-rose-600 border-rose-100'
  },
  { 
    id: 'pay-3', 
    name: 'Membership Maintenance', 
    sub: 'Annual Fee',
    type: 'Service',
    amount: 250, 
    due: '15 Apr 2026',
    status: 'Upcoming',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }
];

const PaymentsPage = () => {
  const [step, setStep] = useState(1);
  const [selectedDues, setSelectedDues] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('internal');
  const navigate = useNavigate();

  const totalAmount = pendingDues
    .filter(d => selectedDues.includes(d.id))
    .reduce((sum, d) => sum + d.amount, 0);

  const toggleSelection = (id: string) => {
    setSelectedDues(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handlePay = () => {
    toast.success("Payment successful! Receipt generated.");
    setStep(3);
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
          <span className="text-[#1a1f36] font-bold">Payments & Collections</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10 px-6">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#1a1f36]">Unified Payments Hub</h2>
              <p className="text-[13px] text-gray-400 font-bold">Fulfill your monthly obligations in one click</p>
           </div>
           <Link to="/accounts" className="flex items-center gap-2 text-[12px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">
              <History className="w-4 h-4" />
              Payment History
           </Link>
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
                   <div className="grid gap-6">
                      {pendingDues.map((d) => (
                        <div 
                           key={d.id}
                           onClick={() => toggleSelection(d.id)}
                           className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center justify-between group ${
                              selectedDues.includes(d.id) ? "border-[#1a1f36] bg-[#1a1f36]/[0.02] shadow-lg" : "border-gray-50 hover:border-gray-100"
                           }`}
                        >
                           <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${d.color}`}>
                                 <d.icon className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">{d.type}</p>
                                 <h4 className="font-bold text-[#1a1f36] text-[15px]">{d.name}</h4>
                                 <p className="text-[11px] text-gray-400">{d.sub} | Due {d.due}</p>
                              </div>
                           </div>
                           <div className="text-right flex items-center gap-6">
                              <div className="space-y-1">
                                 <p className="text-[16px] font-black text-[#1a1f36]">₹{d.amount.toLocaleString()}</p>
                                 <p className={`text-[10px] font-bold uppercase tracking-tighter ${d.status === 'Due Today' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {d.status}
                                 </p>
                              </div>
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                 selectedDues.includes(d.id) ? "bg-[#1a1f36] border-[#1a1f36] text-white" : "border-gray-100 group-hover:border-gray-200"
                              }`}>
                                 {selectedDues.includes(d.id) && <CheckCircle2 className="w-5 h-5" />}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   {totalAmount > 0 && (
                      <motion.div 
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                         className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between"
                      >
                         <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Selection Amount</p>
                            <p className="text-2xl font-black text-[#1a1f36]">₹{totalAmount.toLocaleString()}</p>
                         </div>
                         <Button onClick={handleNext} className="h-14 px-12 bg-[#1a1f36] text-white rounded-2xl hover:bg-black shadow-lg shadow-indigo-900/10 font-bold">
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                      </motion.div>
                   )}

                   {totalAmount === 0 && (
                      <div className="text-center py-10 opacity-40">
                         <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                         <p className="text-sm font-bold">Select items to proceed with payment</p>
                      </div>
                   )}
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
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Select Payment Method</h2>
                       <p className="text-gray-500 text-sm">Secure transactions via internal wallet or UPI</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div 
                         onClick={() => setPaymentMethod('internal')}
                         className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group ${
                            paymentMethod === 'internal' ? "border-[#1a1f36] bg-[#1a1f36]/[0.02]" : "border-gray-50 hover:border-gray-100"
                         }`}
                      >
                         <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6b21a8]">
                               <Wallet className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-[#1a1f36]">Internal Savings Wallet</h4>
                            <p className="text-[11px] text-gray-400 leading-tight">Instant deduction from your A/C XXXXXX6966</p>
                            <p className="text-[10px] font-bold text-emerald-600">Balance: ₹38,034.36</p>
                         </div>
                         {paymentMethod === 'internal' && (
                            <div className="absolute top-4 right-4">
                               <CheckCircle2 className="w-6 h-6 text-[#1a1f36]" />
                            </div>
                         )}
                      </div>

                      <div 
                         onClick={() => setPaymentMethod('upi')}
                         className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all relative overflow-hidden group ${
                            paymentMethod === 'upi' ? "border-[#1a1f36] bg-[#1a1f36]/[0.02]" : "border-gray-50 hover:border-gray-100"
                         }`}
                      >
                         <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                               <QrCode className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-[#1a1f36]">Scan & Pay UPI</h4>
                            <p className="text-[11px] text-gray-400 leading-tight">Pay using GPay, PhonePe, or BHIM</p>
                         </div>
                         {paymentMethod === 'upi' && (
                            <div className="absolute top-4 right-4">
                               <CheckCircle2 className="w-6 h-6 text-[#1a1f36]" />
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="bg-[#1a1f36] rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 h-fit lg:h-40">
                      <div className="space-y-1">
                         <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Total Payable Amount</p>
                         <p className="text-4xl font-black">₹{totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
                      <Button onClick={handlePay} className="h-14 px-16 bg-[#c9a84c] text-[#1a1f36] rounded-2xl hover:bg-white shadow-xl shadow-amber-900/20 font-black">
                         {paymentMethod === 'internal' ? 'Pay Instantly' : 'Generate QR Code'}
                         <Smartphone className="w-4 h-4 ml-2" />
                      </Button>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                   key="step3" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="p-10 text-center space-y-10"
                >
                   <div className="space-y-6">
                      <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-8 border-white shadow-xl">
                         <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-3xl font-black text-[#1a1f36]">Payment Successful!</h2>
                         <p className="text-gray-400 font-medium">Transaction ID: #CT77182281920</p>
                      </div>
                   </div>

                   <div className="max-w-sm mx-auto bg-gray-50 rounded-[40px] border border-gray-100 p-8 space-y-6">
                      <div className="flex justify-between items-center text-left">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Paid To</p>
                            <p className="text-[15px] font-bold text-[#1a1f36]">CredTrust Society</p>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Date</p>
                            <p className="text-[15px] font-bold text-[#1a1f36]">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                         </div>
                      </div>
                      <div className="h-px bg-dashed border-t border-gray-200" />
                      <div className="flex justify-between items-center text-left">
                         <p className="text-[12px] font-bold text-[#1a1f36]">Total Payment</p>
                         <p className="text-[20px] font-black text-[#6b21a8]">₹{totalAmount.toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-4">
                      <Button className="h-14 px-12 bg-[#1a1f36] text-white rounded-2xl hover:bg-black font-bold">
                         <Download className="w-4 h-4 mr-2" />
                         Download Receipt
                      </Button>
                      <Link to="/accounts" className="text-[13px] font-bold text-gray-400 hover:text-[#1a1f36] transition-colors">
                         View in Dashboard
                      </Link>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </section>

        {/* Support Banner */}
        <div className="mt-12 flex items-center justify-center gap-12 py-8 bg-[#1a1f36]/[0.02] rounded-[32px] border border-gray-100">
           <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div className="space-y-0.5">
                 <p className="text-[11px] font-bold text-[#1a1f36] leading-none">Secure SSL</p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">256-bit AES Encryption</p>
              </div>
           </div>
           <div className="h-8 w-px bg-gray-200" />
           <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500" />
              <div className="space-y-0.5">
                 <p className="text-[11px] font-bold text-[#1a1f36] leading-none">Instant Settlement</p>
                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Real-time ledger updates</p>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentsPage;
