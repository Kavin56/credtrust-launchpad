import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  FileUp, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Gem,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface EnrollPigmyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  profile: any;
}

export const EnrollPigmyModal = ({ open, onOpenChange, onSuccess, profile }: EnrollPigmyModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [registeredId, setRegisteredId] = useState('');
  const [registeredIdError, setRegisteredIdError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthlyPaymentDate, setMonthlyPaymentDate] = useState('');
  
  const [kycData, setKycData] = useState({
    aadhaarNumber: profile?.aadhaarNumber || '',
    panNumber: profile?.panNumber || '',
  });

  const [files, setFiles] = useState<{
    aadhaarDoc: File | null;
    panDoc: File | null;
  }>({
    aadhaarDoc: null,
    panDoc: null,
  });

  useEffect(() => {
    if (open) {
      fetchSchemes();
      // Reset to step 1 if opening for the first time
      if (!profile?.aadhaarNumber || !profile?.panNumber) {
        setStep(1);
      } else {
        setStep(2);
      }
    }
  }, [open, profile]);

  const fetchSchemes = async () => {
    try {
      const { data } = await api.get('/pigmy/schemes');
      setSchemes(data);
    } catch (error) {
      console.error('Failed to fetch schemes', error);
    }
  };

  const handleKycSubmit = async () => {
    // If they already have KYC, skip to step 2
    if (profile?.aadhaarNumber && profile?.panNumber) {
      setStep(2);
      return;
    }

    if (!kycData.aadhaarNumber || !kycData.panNumber) {
      toast.error("Please provide both Aadhaar and PAN numbers");
      return;
    }

    setLoading(true);
    try {
      // Update profile with KYC numbers
      await api.patch('/members/me', {
        aadhaarNumber: kycData.aadhaarNumber,
        panNumber: kycData.panNumber,
      });

      // Handle file uploads if any
      if (files.aadhaarDoc || files.panDoc) {
        const formData = new FormData();
        if (files.aadhaarDoc) formData.append('aadhaarDoc', files.aadhaarDoc);
        if (files.panDoc) formData.append('panDoc', files.panDoc);
        
        await api.post('/members/complete-profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success("KYC details updated successfully");
      setStep(2);
    } catch (error) {
      toast.error("Failed to update KYC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const regId = registeredId.trim();
    if (!regId) {
      setRegisteredIdError("Registered ID is required");
      toast.error("Registered ID is required");
      return;
    }

    if (!startDate || !endDate || !monthlyPaymentDate) {
      toast.error("Start Date, End Date, and Monthly Payment Date are required");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error("End Date cannot be earlier than Start Date");
      return;
    }

    if (!selectedSchemeId) {
      toast.error("Please select a savings scheme");
      return;
    }

    setLoading(true);
    try {
      setRegisteredIdError("");

      await api.post('/pigmy/self-enroll', {
        schemeId: selectedSchemeId,
        registeredId: regId,
        startDate,
        endDate,
        monthlyPaymentDate,
      });
      toast.success("Welcome to Pigmy Savings!", {
        description: "Your account is now active. Start your daily savings today."
      });
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'aadhaarDoc' | 'panDoc') => {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white border-none text-[#1a1f36] p-0 overflow-hidden rounded-[40px] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#fcd34d]" />
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-10 space-y-8"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fcd34d] bg-[#fcd34d]/10 w-fit px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity Verification</span>
                </div>
                <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">KYC Verification</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-base">
                  Verify your identity to unlock your micro-savings account.
                </DialogDescription>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aadhaar Card Number</Label>
                  <Input 
                    placeholder="XXXX XXXX XXXX" 
                    value={kycData.aadhaarNumber}
                    onChange={(e) => setKycData({...kycData, aadhaarNumber: e.target.value})}
                    className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">PAN Card Number</Label>
                  <Input 
                    placeholder="ABCDE1234F" 
                    value={kycData.panNumber}
                    onChange={(e) => setKycData({...kycData, panNumber: e.target.value})}
                    className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all uppercase font-bold text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">Aadhaar Copy</Label>
                      <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-[#fcd34d] transition-all group">
                         <div className="flex flex-col items-center">
                            <FileUp className="w-5 h-5 text-slate-300 group-hover:text-[#fcd34d] transition-colors" />
                            <span className="text-[10px] font-bold text-slate-400 mt-2">{files.aadhaarDoc ? 'Selected' : 'Upload PDF'}</span>
                         </div>
                         <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'aadhaarDoc')} />
                      </label>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black text-slate-400 uppercase">PAN Copy</Label>
                      <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-[#fcd34d] transition-all group">
                         <div className="flex flex-col items-center">
                            <FileUp className="w-5 h-5 text-slate-300 group-hover:text-[#fcd34d] transition-colors" />
                            <span className="text-[10px] font-bold text-slate-400 mt-2">{files.panDoc ? 'Selected' : 'Upload PDF'}</span>
                         </div>
                         <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'panDoc')} />
                      </label>
                   </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  onClick={handleKycSubmit} 
                  disabled={loading}
                  className="w-full bg-[#fcd34d] hover:bg-[#fbbf24] text-[#1a1f36] h-16 rounded-[20px] font-black text-xl shadow-xl shadow-[#fcd34d]/20 group transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "VERIFY & CONTINUE"}
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 space-y-8"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#fcd34d] bg-[#fcd34d]/10 w-fit px-3 py-1 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scheme Selection</span>
                </div>
                <DialogTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none">Choose Your Plan</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-base">
                  Select a savings scheme that works for you.
                </DialogDescription>
              </div>

              {/* Registered ID Field */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  Registered ID <span className="text-red-500 font-black">*</span>
                </Label>
                <Input
                  value={registeredId}
                  onChange={(e) => {
                    setRegisteredId(e.target.value);
                    if (registeredIdError) setRegisteredIdError('');
                  }}
                  placeholder="Enter Registered ID (e.g. ROJA-001)"
                  className="bg-slate-50 border-slate-100 h-12 rounded-xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all font-bold text-sm"
                />
                {registeredIdError && (
                  <p className="text-xs font-bold text-red-500 mt-1">{registeredIdError}</p>
                )}
              </div>

              {/* Start Date & End Date fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    Start Date <span className="text-red-500 font-black">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-50 border-slate-100 h-12 rounded-xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    End Date <span className="text-red-500 font-black">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-50 border-slate-100 h-12 rounded-xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {/* Monthly Payment Date selection */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  Monthly Payment Date <span className="text-red-500 font-black">*</span>
                </Label>
                <select
                  value={monthlyPaymentDate}
                  onChange={(e) => setMonthlyPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 h-12 rounded-xl focus:border-[#fcd34d] focus:ring-[#fcd34d]/20 transition-all font-bold text-sm px-3 bg-white"
                >
                  <option value="">Select Preferred Monthly Payment Date</option>
                  {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 py-2">
                 <div className="grid gap-4">
                    {loading && schemes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="w-8 h-8 text-[#fcd34d] animate-spin" />
                        <p className="text-slate-400 font-bold text-sm uppercase">Fetching plans...</p>
                      </div>
                    ) : schemes.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-8 text-center space-y-2">
                        <p className="font-black text-[#1a1f36] uppercase tracking-tight">No plans available</p>
                        <p className="text-xs text-slate-400 font-medium">Please contact support or try again later.</p>
                      </div>
                    ) : schemes.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSchemeId(s.id)}
                        className={`p-6 rounded-[24px] border-2 transition-all text-left flex items-center justify-between group ${
                          selectedSchemeId === s.id 
                            ? 'bg-[#fcd34d]/5 border-[#fcd34d]' 
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className={`font-black uppercase tracking-tight text-lg ${selectedSchemeId === s.id ? 'text-[#1a1f36]' : 'text-slate-600'}`}>
                            {s.name}
                          </p>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {s.maturityPeriod} Mo.</span>
                            <span className="flex items-center gap-1.5 text-[#fcd34d]"><TrendingUp className="w-3.5 h-3.5" /> {s.interestRate}% P.A.</span>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedSchemeId === s.id ? 'bg-[#fcd34d] border-[#fcd34d]' : 'border-slate-200'
                        }`}>
                          {selectedSchemeId === s.id && <CheckCircle2 className="w-5 h-5 text-[#1a1f36]" />}
                        </div>
                      </button>
                    ))}
                 </div>
              </div>


              <div className="flex gap-4 pt-4">
                 <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-[20px] font-bold border-2 border-slate-100 text-slate-400">BACK</Button>
                 <Button 
                   onClick={handleEnroll} 
                   disabled={loading || !selectedSchemeId}
                   className="flex-[2] bg-[#fcd34d] hover:bg-[#fbbf24] text-[#1a1f36] h-16 rounded-[20px] font-black text-xl shadow-xl shadow-[#fcd34d]/20"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : "START MY SAVINGS"}
                 </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#fcd34d]/20 blur-3xl rounded-full" />
                <div className="bg-[#fcd34d] p-10 rounded-[40px] relative shadow-2xl shadow-[#fcd34d]/30">
                  <Gem className="w-24 h-24 text-[#1a1f36]" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-tight text-[#1a1f36]">Welcome!</h2>
                <p className="text-slate-500 font-bold text-lg">Your Pigmy account is officially active.</p>
              </div>

              <Button 
                onClick={() => {
                  onSuccess();
                  onOpenChange(false);
                }}
                className="w-full bg-[#1a1f36] text-[#fcd34d] hover:bg-black h-16 rounded-[20px] font-black text-xl shadow-2xl"
              >
                GO TO DASHBOARD
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
