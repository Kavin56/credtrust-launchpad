import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Landmark, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Calculator, 
  ShieldCheck,
  ChevronRight,
  Upload,
  Loader2,
  Info
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/login/AuthContext";

const MAX_UPLOAD_MB = 20;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const isAllowedDocument = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return (
    ALLOWED_FILE_TYPES.has(file.type) ||
    ALLOWED_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  );
};

const validateDocument = (file: File | null, label: string) => {
  if (!file) {
    return `${label} is required.`;
  }

  if (!isAllowedDocument(file)) {
    return `${label} must be a PDF, JPG, or PNG file.`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `${label} is too large. Max ${MAX_UPLOAD_MB} MB.`;
  }

  return null;
};

const LoanApply = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    amount: 23000,
    tenure: 12,
    interestRate: 12.5,
    employmentStatus: "Salaried",
    monthlyIncome: 45000,
    purpose: "Personal Use",
  });

  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [incomeProofFile, setIncomeProofFile] = useState<File | null>(null);
  const [emi, setEmi] = useState(0);

  // EMI Calculation: [P x R x (1+R)^N]/[(1+R)^N-1]
  useEffect(() => {
    const P = formData.amount;
    const r = formData.interestRate / 12 / 100;
    const n = formData.tenure;
    const emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(emiValue));
  }, [formData.amount, formData.tenure, formData.interestRate]);

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    label: string,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    const nextFile = event.target.files?.[0] || null;
    if (!nextFile) {
      setter(null);
      return;
    }

    const validationError = validateDocument(nextFile, label);
    if (validationError) {
      setter(null);
      event.target.value = "";
      toast.error(validationError);
      return;
    }

    setter(nextFile);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply for a loan");
      return;
    }

    const idProofError = validateDocument(idProofFile, "ID proof");
    if (idProofError) {
      toast.error(idProofError);
      return;
    }

    const incomeProofError = validateDocument(incomeProofFile, "Income proof");
    if (incomeProofError) {
      toast.error(incomeProofError);
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("memberId", user.id);
      formDataObj.append("type", "Personal Loan");
      formDataObj.append("amount", formData.amount.toString());
      formDataObj.append("interestRate", formData.interestRate.toString());
      formDataObj.append("termMonths", formData.tenure.toString());
      formDataObj.append("purpose", formData.purpose);
      formDataObj.append("employmentStatus", formData.employmentStatus);
      formDataObj.append("monthlyIncome", formData.monthlyIncome.toString());
      
      if (idProofFile) {
        formDataObj.append("idProof", idProofFile);
      }
      
      if (incomeProofFile) {
        formDataObj.append("incomeProof", incomeProofFile);
      }

      await api.post("/loans/apply", formDataObj);
      setStep(4); // Success step
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to submit application. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Eligibility", icon: Calculator },
    { id: 2, title: "Documents", icon: FileText },
    { id: 3, title: "Review", icon: ShieldCheck },
  ];

  const canProceedToReview = idProofFile !== null && incomeProofFile !== null;

  // After successful submission, auto-redirect to dashboard.
  useEffect(() => {
    if (step !== 4) return;
    const t = window.setTimeout(() => {
      navigate("/dashboard");
    }, 5000);
    return () => window.clearTimeout(t);
  }, [step, navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Stepper Header */}
          {step > 0 && step < 4 && (
            <div className="flex justify-center mb-12">
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                      step === s.id ? "bg-[#1a1f36] text-white shadow-lg" : 
                      step > s.id ? "bg-emerald-50 text-emerald-600" : "text-slate-400"
                    }`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                        step === s.id ? "border-white/20 bg-white/10" : "border-current opacity-50"
                      }`}>
                        {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">{s.title}</span>
                    </div>
                    {idx < steps.length - 1 && <div className="w-8 h-px bg-slate-100" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-12">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a84c]/10 text-[#a08530] text-sm font-bold mb-4">
                    Loan Application
                  </span>
                  <h1 className="text-4xl font-heading font-bold text-[#1a1f36] mb-4">
                    Apply for Your Loan in Minutes
                  </h1>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Please complete the following steps to submit your loan application. Our team will review it within 24 hours.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {[
                    { icon: Landmark, title: "Eligibility", desc: "Check your pre-approved limit" },
                    { icon: ArrowRight, title: "Documents", desc: "Upload ID and income proof" },
                    { icon: CheckCircle2, title: "Approval", desc: "Get funds in your account" }
                  ].map((s, idx) => (
                    <Card key={idx} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#1a1f36]/5 flex items-center justify-center mx-auto mb-4">
                          <s.icon className="w-6 h-6 text-[#1a1f36]" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{idx + 1}. {s.title}</h3>
                        <p className="text-sm text-gray-500">{s.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="border-gray-100 shadow-xl overflow-hidden">
                  <div className="bg-[#1a1f36] p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
                    <p className="text-white/60 mb-6">Our digital loan process is easy, fast, and secure.</p>
                    <Button 
                      onClick={() => setStep(1)}
                      className="bg-[#c9a84c] text-[#1a1f36] hover:bg-[#d4b65c] font-bold h-12 px-8"
                    >
                      Start New Application
                    </Button>
                  </div>
                  <div className="p-8 bg-white">
                    <div className="space-y-4">
                      <h4 className="font-bold text-[#1a1f36]">Required Information:</h4>
                      <ul className="space-y-3">
                        {[
                          "Valid government-issued ID",
                          "Income proof (Last 3 months salary slip)",
                          "Bank account details",
                          "Residential address proof"
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                    <CardContent className="p-10 space-y-8">
                      <div>
                        <h2 className="text-2xl font-black text-[#1a1f36] mb-2">Loan Calculator</h2>
                        <p className="text-slate-400 text-sm font-medium">Configure your preferred loan amount and tenure.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loan Amount</Label>
                            <span className="text-xl font-black text-[#1a1f36]">₹{formData.amount.toLocaleString()}</span>
                          </div>
                          <Slider 
                            value={[formData.amount]} 
                            min={1000} 
                            max={23000} 
                            step={1000}
                            onValueChange={([val]) => {
                              if (val > 23000) {
                                setFormData({...formData, amount: 23000});
                                toast.error("Maximum Loan Limit Exceeded!", {
                                  description: "The maximum allowed loan amount is ₹23,000.",
                                });
                              } else {
                                setFormData({...formData, amount: val});
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tenure (Months)</Label>
                            <span className="text-xl font-black text-[#1a1f36]">{formData.tenure} Months</span>
                          </div>
                          <Slider 
                            value={[formData.tenure]} 
                            min={6} 
                            max={60} 
                            step={6}
                            onValueChange={([val]) => setFormData({...formData, tenure: val})}
                          />
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interest Rate</p>
                              <p className="text-lg font-black text-[#1a1f36]">{formData.interestRate}% <span className="text-[10px] text-slate-400 font-bold uppercase">p.a.</span></p>
                           </div>
                           <ShieldCheck className="w-8 h-8 text-[#c9a84c] opacity-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-6">
                    <Card className="bg-[#1a1f36] text-white border-none shadow-2xl shadow-[#1a1f36]/20 rounded-[40px] overflow-hidden p-10 flex flex-col justify-center relative group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Landmark size={120} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-[#c9a84c] uppercase tracking-[0.2em] mb-4">Estimated EMI</p>
                        <h3 className="text-6xl font-black mb-4 tracking-tighter">₹{emi.toLocaleString()}</h3>
                        <p className="text-white/40 text-sm font-medium">Payable monthly for {formData.tenure} installments</p>
                      </div>
                    </Card>

                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full h-20 bg-[#c9a84c] hover:bg-[#d4b65c] text-[#1a1f36] rounded-[32px] font-black text-lg uppercase tracking-widest shadow-xl shadow-[#c9a84c]/20 transition-all hover:scale-[1.02]"
                    >
                      Next Step
                      <ChevronRight className="ml-3 w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white p-10">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#1a1f36] mb-2">Professional Details</h2>
                    <p className="text-slate-400 text-sm font-medium">Verification documents help us approve your loan faster.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Employment Status</Label>
                        <select 
                          className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-[#1a1f36]/5 outline-none"
                          value={formData.employmentStatus}
                          onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})}
                        >
                          <option>Salaried</option>
                          <option>Self-Employed</option>
                          <option>Business Owner</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Income</Label>
                        <Input 
                          type="number"
                          className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                          value={formData.monthlyIncome}
                          onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload Documents (Compulsory)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Label 
                          htmlFor="id-proof"
                          className={`p-6 border-2 border-dashed rounded-3xl transition-colors flex flex-col items-center gap-3 text-center cursor-pointer ${
                            idProofFile ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-[#c9a84c]/30 bg-slate-50/50"
                          }`}
                        >
                           <input 
                              id="id-proof" 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              onChange={(e) =>
                                handleDocumentChange(e, "ID proof", setIdProofFile)
                              }
                           />
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${idProofFile ? "bg-emerald-500 text-white" : "bg-white text-[#c9a84c]"}`}>
                             {idProofFile ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-4 h-4" />}
                           </div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-tighter ${idProofFile ? "text-emerald-700" : "text-[#1a1f36]"}`}>
                                {idProofFile ? "ID Proof Selected" : "ID Proof (PAN/Aadhar)"}
                              </p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                                {idProofFile ? idProofFile.name : `PDF, JPG, or PNG (Max ${MAX_UPLOAD_MB}MB)`}
                              </p>
                           </div>
                        </Label>

                        <Label 
                          htmlFor="income-proof"
                          className={`p-6 border-2 border-dashed rounded-3xl transition-colors flex flex-col items-center gap-3 text-center cursor-pointer ${
                            incomeProofFile ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-[#c9a84c]/30 bg-slate-50/50"
                          }`}
                        >
                           <input 
                              id="income-proof" 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              onChange={(e) =>
                                handleDocumentChange(e, "Income proof", setIncomeProofFile)
                              }
                           />
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${incomeProofFile ? "bg-emerald-500 text-white" : "bg-white text-[#c9a84c]"}`}>
                             {incomeProofFile ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-4 h-4" />}
                           </div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-tighter ${incomeProofFile ? "text-emerald-700" : "text-[#1a1f36]"}`}>
                                {incomeProofFile ? "Income Proof Selected" : "Income Proof"}
                              </p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                                {incomeProofFile ? incomeProofFile.name : `Salary Slip PDF/JPG/PNG (Max ${MAX_UPLOAD_MB}MB)`}
                              </p>
                           </div>
                        </Label>
                      </div>
                      {!canProceedToReview && (
                        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-2">
                           <Info className="w-3 h-3" /> Please upload both documents to continue.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-16 rounded-2xl border-slate-100 text-slate-400 font-bold">Back</Button>
                      <Button 
                        disabled={!canProceedToReview}
                        onClick={() => setStep(3)} 
                        className={`flex-[2] h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all ${
                          canProceedToReview ? "bg-[#1a1f36] text-white hover:bg-[#2d3356] shadow-[#1a1f36]/10" : "bg-slate-100 text-slate-300"
                        }`}
                      >
                        Continue Review
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
                  <div className="p-10 bg-[#1a1f36] text-white flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest mb-1">Final Summary</p>
                      <h2 className="text-3xl font-bold">Review Request</h2>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-[#c9a84c]" />
                    </div>
                  </div>
                  
                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-y-10">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Requested</p>
                        <p className="text-3xl font-bold text-[#1a1f36]">₹{formData.amount.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly EMI</p>
                        <p className="text-3xl font-bold text-emerald-600">₹{emi.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ROI (Fixed)</p>
                        <p className="text-xl font-bold text-slate-700">{formData.interestRate}% p.a.</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tenure</p>
                        <p className="text-xl font-bold text-slate-700">{formData.tenure} Months</p>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Submission Notice</p>
                          <p className="text-[11px] text-amber-900/70 font-medium leading-relaxed">
                            By clicking "Confirm Application", you authorize CredTrust to verify your credit profile. Digital approval usually takes less than 24 hours.
                          </p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                      <Button disabled={loading} onClick={() => setStep(2)} variant="ghost" className="flex-1 h-16 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-colors">Back</Button>
                      <Button 
                        disabled={loading}
                        onClick={handleApply}
                        className="flex-[2] h-16 bg-[#10b981] text-white hover:bg-[#059669] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/10 transition-all active:scale-95"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading Documents...
                          </span>
                        ) : (
                          "Confirm Application"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-20"
              >
                <div className="w-32 h-32 rounded-[48px] bg-emerald-500 text-white flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30 scale-110">
                  <CheckCircle2 size={64} />
                </div>
                <h2 className="text-5xl font-black text-[#1a1f36] mb-6 tracking-tight">Application Filed</h2>
                <p className="text-slate-400 text-lg font-medium mb-12 max-w-sm mx-auto">
                  Your request for ₹{formData.amount.toLocaleString()} is currently being processed by our underwriting team.
                </p>
                <div className="space-y-4">
                  <Button onClick={() => navigate("/dashboard")} className="w-full h-16 bg-[#1a1f36] text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-xl">Go to Dashboard</Button>
                  <Button onClick={() => setStep(1)} variant="ghost" className="text-slate-400 font-bold hover:text-[#1a1f36]">File another request</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanApply;
