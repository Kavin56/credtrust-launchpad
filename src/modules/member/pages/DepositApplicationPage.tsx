import React, { useState, useEffect } from 'react';
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
  Users,
  Upload,
  FileText,
  User as UserIcon
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/modules/login/AuthContext";
import { useQuery } from "@tanstack/react-query";


const schemes = [
  { 
    id: 'fd-6m', 
    name: 'Fixed Deposit (6 Months)', 
    short: 'FD',
    rate: 6.2, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenures: [6, 12, 60],
    desc: 'Short-term secure deposit with guaranteed 6.2% p.a. returns.',
    color: 'border-purple-200 bg-purple-50/30 text-purple-600'
  },
  { 
    id: 'fd-1y', 
    name: 'Fixed Deposit (1 Year)', 
    short: 'FD',
    rate: 6.5, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenures: [6, 12, 60],
    desc: 'Standard 1-year secure fixed deposit with 6.5% p.a. returns.',
    color: 'border-blue-200 bg-blue-50/30 text-blue-600'
  },
  { 
    id: 'fd-5y', 
    name: 'Fixed Deposit (5 Years)', 
    short: 'FD',
    rate: 7.5, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenures: [6, 12, 60],
    desc: 'Long-term wealth builder with 7.5% p.a. returns over 5 years.',
    color: 'border-indigo-200 bg-indigo-50/30 text-indigo-600'
  },
  { 
    id: 'fd-sr', 
    name: 'Senior Citizen Fixed Deposit', 
    short: 'Senior FD',
    rate: 8.0, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenures: [6, 12, 24, 36, 60],
    desc: 'Exclusive high-yield FD for senior citizens with 8.0% p.a. returns.',
    color: 'border-amber-200 bg-amber-50/30 text-amber-600'
  },
  { 
    id: 'rd-generic', 
    name: 'Recurring Deposit', 
    short: 'RD',
    rate: 7.0, 
    min: 500, 
    max: 1000000,
    type: 'Recurring',
    tenures: [12, 60],
    desc: 'Systematic monthly savings. 1 Year: 7.0%, 5 Years: 8.0%. Aged (Senior Citizen): 8.0%.',
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-600'
  },
  { 
    id: 'rd-sr', 
    name: 'Senior Citizen Recurring Deposit', 
    short: 'Senior RD',
    rate: 8.0, 
    min: 500, 
    max: 1000000,
    type: 'Recurring',
    tenures: [6, 12, 24, 36, 60],
    desc: 'Special high-interest monthly recurring plan for senior citizens with 8.0% p.a. returns.',
    color: 'border-orange-200 bg-orange-50/30 text-orange-600'
  },
  { 
    id: 'pigmy', 
    name: 'Pigmy Savings Scheme', 
    short: 'Pigmy',
    rate: 3.0, 
    min: 100, 
    max: 50000,
    type: 'Pigmy',
    tenures: [6, 12, 24, 36, 60],
    desc: 'Daily/monthly small savings scheme with 3.0% interest rate. (Min 6 Months, Max 5 Years)',
    color: 'border-rose-200 bg-rose-50/30 text-rose-600'
  }
];

const DepositApplicationPage = () => {
  const location = useLocation();
  const routerState = location.state as { schemeName?: string } | null;

  const [step, setStep] = useState(1);
  const [selectedScheme, setSelectedScheme] = useState(() => {
    if (routerState?.schemeName) {
      const found = schemes.find(s => s.name.toLowerCase().includes(routerState.schemeName!.toLowerCase()) || routerState.schemeName!.toLowerCase().includes(s.id));
      if (found) return found;
    }
    return schemes[0];
  });
  const [amount, setAmount] = useState(schemes[0].min);
  const [tenure, setTenure] = useState(6);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic Form Fields State
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: "",
    memberId: "",
    dob: "",
    gender: "Male",
    mobile: "",
    email: "",
    aadhaar: "",
    pan: "",
    address: "",
    
    // Deposit Specifics
    payoutPreference: "On Maturity",
    sourceOfFunds: "Salary",
    paymentMethod: "UPI",
    depositDateEveryMonth: "5",

    // Nominee Info
    nomineeName: "",
    nomineeRelationship: "",
    nomineeDob: "",
    nomineeAadhaar: "",
    nomineeMobile: "",
    nomineeAddress: "",
    nomineeShare: "100",

    // Bank Account Info
    bankHolderName: "",
    bankName: "",
    bankBranch: "",
    bankAccountNumber: "",
    bankIfsc: "",

    declarationAccepted: "false"
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-Fetch Member Profile
  const { data: profile } = useQuery({
    queryKey: ["member-profile"],
    queryFn: async () => {
      const { data } = await api.get("/members/me");
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        memberId: profile.memberId || profile.id || "",
        mobile: profile.contact || "",
        address: profile.address || "",
        email: user?.email || ""
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (selectedScheme.tenures && selectedScheme.tenures.length > 0) {
      setTenure(selectedScheme.tenures[0]);
    } else {
      setTenure(12);
    }
    setAmount(selectedScheme.min);
    setErrors({});
  }, [selectedScheme]);

  const getDynamicRate = () => {
    let isAged = false;
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age >= 60) {
        isAged = true;
      }
    }

    if (selectedScheme.id.startsWith('fd') || selectedScheme.type === 'Fixed') {
      if (isAged) return 8.0;
      if (tenure === 6) return 6.2;
      if (tenure === 12) return 6.5;
      if (tenure === 60) return 7.5;
      return selectedScheme.rate;
    }

    if (selectedScheme.id.startsWith('rd') || selectedScheme.type === 'Recurring') {
      if (isAged) return 8.0;
      if (tenure === 12) return 7.0;
      if (tenure === 60) return 8.0;
      return selectedScheme.rate;
    }

    return selectedScheme.rate;
  };

  const calculateMaturity = () => {
    const currentRate = getDynamicRate();
    const rate = currentRate / 100;
    const time = tenure / 12;
    if (selectedScheme.type === 'Recurring') {
       // RD Maturity calculation
       return amount * tenure + (amount * tenure * (tenure + 1) * rate) / (2 * 12);
    } else if (selectedScheme.type === 'Pigmy') {
       return amount * tenure + (amount * tenure * (tenure + 1) * rate) / (2 * 12);
    }
    // FD Compound Interest Formula (Quarterly compounding standard)
    return amount * Math.pow(1 + (currentRate / 400), 4 * time);
  };

  const getRequiredDocuments = () => {
    const docs = [
      { id: 'applicantAadhaar', name: 'Applicant Aadhaar Card' },
      { id: 'applicantPan', name: 'Applicant PAN Card' },
      { id: 'applicantPhoto', name: 'Passport Size Photograph' },
      { id: 'applicantSignature', name: 'Signature Image' },
      { id: 'nomineeAadhaarDoc', name: 'Nominee Aadhaar Copy' },
      { id: 'bankChequeDoc', name: 'Cancelled Cheque or Passbook Front Page' }
    ];

    if (selectedScheme.type === 'Recurring' && formData.paymentMethod === 'Auto Debit Mandate') {
      docs.push({ id: 'autoDebitMandateDoc', name: 'Auto Debit Authorization Form' });
    }

    return docs;
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      // Validate Applicant Details
      const reqApplicantFields = ['fullName', 'memberId', 'dob', 'mobile', 'email', 'aadhaar', 'pan', 'address', 'registeredId'];
      reqApplicantFields.forEach(f => {
        if (!formData[f] || !formData[f].trim()) {
          newErrors[f] = "This field is required";
        }
      });

      const phoneRegex = /^\d{10}$/;
      if (formData.mobile && !phoneRegex.test(formData.mobile)) {
        newErrors.mobile = "Mobile must be a valid 10-digit number";
      }

      const aadhaarRegex = /^\d{12}$/;
      if (formData.aadhaar && !aadhaarRegex.test(formData.aadhaar)) {
        newErrors.aadhaar = "Aadhaar must be a valid 12-digit number";
      }

      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (formData.pan && !panRegex.test(formData.pan.toUpperCase())) {
        newErrors.pan = "PAN must be a valid 10-character alphanumeric ID";
      }

      // Check min/max amount limits
      if (amount < selectedScheme.min) {
        newErrors.amount = `Minimum amount is ₹${selectedScheme.min.toLocaleString()}`;
      }
      if (amount > selectedScheme.max) {
        newErrors.amount = `Maximum amount is ₹${selectedScheme.max.toLocaleString()}`;
      }
    }

    if (currentStep === 3) {
      // Validate Nominee & Bank Details
      const reqFields = ['nomineeName', 'nomineeRelationship', 'nomineeDob', 'nomineeAadhaar', 'nomineeMobile', 'nomineeAddress', 'nomineeShare', 'bankHolderName', 'bankName', 'bankBranch', 'bankAccountNumber', 'bankIfsc'];
      reqFields.forEach(f => {
        if (!formData[f] || !formData[f].trim()) {
          newErrors[f] = "This field is required";
        }
      });

      const phoneRegex = /^\d{10}$/;
      if (formData.nomineeMobile && !phoneRegex.test(formData.nomineeMobile)) {
        newErrors.nomineeMobile = "Mobile must be a valid 10-digit number";
      }

      const aadhaarRegex = /^\d{12}$/;
      if (formData.nomineeAadhaar && !aadhaarRegex.test(formData.nomineeAadhaar)) {
        newErrors.nomineeAadhaar = "Aadhaar must be a valid 12-digit number";
      }

      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (formData.bankIfsc && !ifscRegex.test(formData.bankIfsc.toUpperCase())) {
        newErrors.bankIfsc = "IFSC code format invalid";
      }
    }

    if (currentStep === 4) {
      // Validate uploads
      const docs = getRequiredDocuments();
      docs.forEach(doc => {
        if (!uploadedFiles[doc.id]) {
          newErrors[doc.id] = `${doc.name} upload is compulsory`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const simulateFileUpload = (docId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [docId]: file }));
    setUploadProgress(prev => ({ ...prev, [docId]: 10 }));

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const curr = prev[docId] || 0;
        if (curr >= 100) {
          clearInterval(interval);
          toast.success(`${file.name} uploaded successfully!`);
          return prev;
        }
        return { ...prev, [docId]: curr + 30 };
      });
    }, 200);

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      toast.error("Format invalid! Please upload PDF, JPG, JPEG, or PNG files only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit.");
      return;
    }

    simulateFileUpload(docId, file);
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      toast.error("Please fill all required fields or upload mandatory files to continue.");
      return;
    }

    if (step === 2) {
      const regId = (formData.registeredId || '').toString().trim();
      if (!regId) {
        setErrors(prev => ({ ...prev, registeredId: "Registered ID is required" }));
        toast.error("Registered ID is required");
        return;
      }

      // Format registered ID (e.g. ROJA-001) directly without backend database check
      const formatted = regId.toUpperCase().startsWith('ROJA-') ? regId.toUpperCase() : `ROJA-${regId}`;
      setFormData(prev => ({ ...prev, registeredId: formatted }));

      // Clear error
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.registeredId;
        return updated;
      });
    }

    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (formData.declarationAccepted !== "true") {
      toast.error("Please accept the declaration before submitting.");
      return;
    }
    if (!uploadedFiles['applicantSignature']) {
      toast.error("Signature image upload is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const fdNumber = `SHR-DP-${selectedScheme.short}-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = new FormData();
      payload.append('kind', selectedScheme.type === "Recurring" ? "RD" : selectedScheme.type === "Pigmy" ? "PIGMY" : "FD");
      payload.append('principal', amount.toString());
      payload.append('rate', getDynamicRate().toString());
      payload.append('tenureMonths', tenure.toString());
      payload.append('payoutMode', formData.payoutPreference);
      payload.append('status', 'PENDING');
      payload.append('registeredId', formData.registeredId || '');

      const additionalDetails = {
        certificateNumber: fdNumber,
        applicant: {
          fullName: formData.fullName,
          memberId: formData.memberId,
          dob: formData.dob,
          gender: formData.gender,
          mobile: formData.mobile,
          email: formData.email,
          aadhaar: formData.aadhaar,
          pan: formData.pan,
          address: formData.address,
        },
        depositDetails: {
          sourceOfFunds: formData.sourceOfFunds,
          paymentMethod: formData.paymentMethod,
          depositDateEveryMonth: formData.depositDateEveryMonth,
          expectedMaturity: Math.round(calculateMaturity())
        },
        nominee: {
          name: formData.nomineeName,
          relationship: formData.nomineeRelationship,
          dob: formData.nomineeDob,
          aadhaar: formData.nomineeAadhaar,
          mobile: formData.nomineeMobile,
          address: formData.nomineeAddress,
          share: formData.nomineeShare,
        },
        bank: {
          holderName: formData.bankHolderName,
          bankName: formData.bankName,
          branch: formData.bankBranch,
          accountNumber: formData.bankAccountNumber,
          ifsc: formData.bankIfsc,
        },
        timestamp: new Date().toISOString()
      };
      payload.append('additionalDetails', JSON.stringify(additionalDetails));

      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) {
          payload.append(key, file);
        }
      });

      await api.post("/deposits", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(`Deposit request submitted successfully! Temp ID: ${fdNumber}`);
      navigate("/accounts?tab=deposits");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit deposit request.");
    } finally {
      setIsSubmitting(false);
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
           {[1, 2, 3, 4, 5].map((i) => (
             <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= i ? "bg-[#1a1f36] text-white scale-110 shadow-lg shadow-black/10" : "bg-gray-200 text-gray-400"
                   }`}>
                      {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-[#1a1f36]" : "text-gray-300"}`}>
                      {i === 1 ? "Scheme" : i === 2 ? "Applicant" : i === 3 ? "Nominee/Bank" : i === 4 ? "Documents" : "Review"}
                   </span>
                </div>
                {i < 5 && (
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
                              <div className="text-[10px] font-bold text-slate-500 space-y-1">
                                 <p>Min Deposit: ₹{s.min.toLocaleString()}</p>
                                 <p>Max Deposit: ₹{s.max.toLocaleString()}</p>
                              </div>
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
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Applicant & Deposit Details</h2>
                       <p className="text-gray-500 text-sm">Please fill the mandatory information below marked with a red asterisk (*)</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {/* Registered ID field */}
                      <div className="space-y-2 md:col-span-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Registered ID <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.registeredId || ""} onChange={(e) => handleInputChange("registeredId", e.target.value)} placeholder="Enter Customer/Member ID (e.g. 001)" className="h-12 rounded-xl" />
                         {errors.registeredId && <p className="text-xs text-red-500 font-bold">{errors.registeredId}</p>}
                      </div>

                      {/* Auto-Fetched editable applicant details */}
                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Full Name <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} className="h-12 rounded-xl" />
                         {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Member ID <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.memberId} onChange={(e) => handleInputChange("memberId", e.target.value)} className="h-12 rounded-xl" />
                         {errors.memberId && <p className="text-xs text-red-500 font-bold">{errors.memberId}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth <span className="text-red-500 font-black">*</span></Label>
                         <Input type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="h-12 rounded-xl" />
                         {errors.dob && <p className="text-xs text-red-500 font-bold">{errors.dob}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gender <span className="text-red-500 font-black">*</span></Label>
                         <select value={formData.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="w-full border rounded-xl h-12 px-3 text-sm">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                         </select>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.mobile} onChange={(e) => handleInputChange("mobile", e.target.value)} className="h-12 rounded-xl" />
                         {errors.mobile && <p className="text-xs text-red-500 font-bold">{errors.mobile}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="h-12 rounded-xl" />
                         {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Aadhaar Number <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.aadhaar} onChange={(e) => handleInputChange("aadhaar", e.target.value)} className="h-12 rounded-xl" placeholder="12 digit number" />
                         {errors.aadhaar && <p className="text-xs text-red-500 font-bold">{errors.aadhaar}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">PAN Number <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.pan} onChange={(e) => handleInputChange("pan", e.target.value)} className="h-12 rounded-xl" placeholder="ABCDE1234F" />
                         {errors.pan && <p className="text-xs text-red-500 font-bold">{errors.pan}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Residential Address <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} className="h-12 rounded-xl" />
                         {errors.address && <p className="text-xs text-red-500 font-bold">{errors.address}</p>}
                      </div>

                      {/* Deposit Fields */}
                      <div className="space-y-2 border-t pt-6 md:col-span-2">
                         <h3 className="font-bold text-slate-800 text-[14px]">Deposit Scheme details</h3>
                      </div>

                      {selectedScheme.type === 'Pigmy' && (
                         <div className="md:col-span-2 p-5 bg-rose-50/40 border border-rose-100 rounded-3xl flex items-start gap-4 text-xs leading-relaxed text-slate-600">
                            <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                               <h4 className="font-bold text-slate-800">Pigmy Savings Scheme Info</h4>
                               <p>• <strong>Interest Rate:</strong> 3.0% per annum.</p>
                               <p>• <strong>Tenure Range:</strong> Minimum 6 Months (180 days) up to Maximum 5 Years (60 months).</p>
                               <p>• <strong>Deposit Frequency:</strong> Daily/monthly small savings collectors or self-pay.</p>
                               <p>• <strong>Minimum Deposit:</strong> ₹100. <strong>Maximum Deposit:</strong> ₹50,000.</p>
                            </div>
                         </div>
                      )}

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Deposit Amount (₹) <span className="text-red-500 font-black">*</span></Label>
                         <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="h-12 rounded-xl text-lg font-bold" />
                         {errors.amount && <p className="text-xs text-red-500 font-bold">{errors.amount}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tenure (Months) <span className="text-red-500 font-black">*</span></Label>
                         <select value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full border rounded-xl h-12 px-3 text-sm">
                            {(selectedScheme.type === 'Pigmy' ? [6, 12, 24, 36, 48, 60] : selectedScheme.tenures || [6, 12, 24, 36, 60]).map(m => (
                               <option key={m} value={m}>{m} Months</option>
                            ))}
                         </select>
                         <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                           <span className="text-[10px] font-bold text-gray-400">Applicable Interest Rate:</span>
                           <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                             {getDynamicRate()}% p.a.
                           </span>
                           {formData.dob && (() => {
                             const birthDate = new Date(formData.dob);
                             const ageDiff = Date.now() - birthDate.getTime();
                             const ageDate = new Date(ageDiff);
                             const age = Math.abs(ageDate.getUTCFullYear() - 1970);
                             if (age >= 60 && selectedScheme.type !== 'Pigmy') {
                               return (
                                 <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                   Senior Citizen Bonus Applied
                                 </span>
                               );
                             }
                             return null;
                           })()}
                         </div>
                      </div>

                      {selectedScheme.type === 'Fixed' ? (
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Interest Payout Preference <span className="text-red-500 font-black">*</span></Label>
                            <select value={formData.payoutPreference} onChange={(e) => handleInputChange("payoutPreference", e.target.value)} className="w-full border rounded-xl h-12 px-3 text-sm">
                               <option>Monthly</option>
                               <option>Quarterly</option>
                               <option>Half-Yearly</option>
                               <option>Annually</option>
                               <option>On Maturity</option>
                            </select>
                         </div>
                      ) : (
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Preferred Payment Method <span className="text-red-500 font-black">*</span></Label>
                            <select value={formData.paymentMethod} onChange={(e) => handleInputChange("paymentMethod", e.target.value)} className="w-full border rounded-xl h-12 px-3 text-sm">
                               <option>UPI</option>
                               <option>Net Banking</option>
                               <option>Debit Card</option>
                               <option>Bank Transfer</option>
                               <option>Auto Debit Mandate</option>
                            </select>
                         </div>
                      )}

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Source of Funds <span className="text-red-500 font-black">*</span></Label>
                         <select value={formData.sourceOfFunds} onChange={(e) => handleInputChange("sourceOfFunds", e.target.value)} className="w-full border rounded-xl h-12 px-3 text-sm">
                            <option>Salary</option>
                            <option>Business Income</option>
                            <option>Agriculture Income</option>
                            <option>Pension</option>
                            <option>Savings</option>
                            <option>Other</option>
                         </select>
                      </div>

                      {selectedScheme.type === 'Recurring' && (
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Installment Date (Every Month)</Label>
                            <select value={formData.depositDateEveryMonth} onChange={(e) => handleInputChange("depositDateEveryMonth", e.target.value)} className="w-full border rounded-xl h-12 px-3 text-sm">
                               {[1, 5, 10, 15, 20, 25].map(d => (
                                  <option key={d} value={d}>{d}th of month</option>
                               ))}
                            </select>
                         </div>
                      )}

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:col-span-2 grid grid-cols-2 gap-4">
                         <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Expected Maturity Amount</p>
                            <p className="text-2xl font-black text-slate-800">₹{Math.round(calculateMaturity()).toLocaleString()}</p>
                         </div>
                         <div className="text-center border-l">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Maturity Date</p>
                            <p className="text-lg font-bold text-slate-700">
                               {new Date(Date.now() + tenure * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
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
                   className="p-10 space-y-10"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Nominee & Bank Account Details</h2>
                       <p className="text-gray-500 text-sm">Mandatory nominee and bank transaction details for deposit servicing</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {/* Nominee details */}
                      <div className="md:col-span-2 border-b pb-2">
                         <h3 className="font-bold text-[#1a1f36] text-[14px]">Nominee Details</h3>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominee Name <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeName} onChange={(e) => handleInputChange("nomineeName", e.target.value)} className="h-12 rounded-xl" />
                         {errors.nomineeName && <p className="text-xs text-red-500 font-bold">{errors.nomineeName}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Relationship <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeRelationship} onChange={(e) => handleInputChange("nomineeRelationship", e.target.value)} placeholder="e.g. Spouse, Son" className="h-12 rounded-xl" />
                         {errors.nomineeRelationship && <p className="text-xs text-red-500 font-bold">{errors.nomineeRelationship}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominee Date of Birth <span className="text-red-500 font-black">*</span></Label>
                         <Input type="date" value={formData.nomineeDob} onChange={(e) => handleInputChange("nomineeDob", e.target.value)} className="h-12 rounded-xl" />
                         {errors.nomineeDob && <p className="text-xs text-red-500 font-bold">{errors.nomineeDob}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominee Aadhaar <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeAadhaar} onChange={(e) => handleInputChange("nomineeAadhaar", e.target.value)} className="h-12 rounded-xl" placeholder="12-digit number" />
                         {errors.nomineeAadhaar && <p className="text-xs text-red-500 font-bold">{errors.nomineeAadhaar}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominee Mobile <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeMobile} onChange={(e) => handleInputChange("nomineeMobile", e.target.value)} className="h-12 rounded-xl" />
                         {errors.nomineeMobile && <p className="text-xs text-red-500 font-bold">{errors.nomineeMobile}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Share Percentage (%) <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeShare} type="number" max="100" min="1" onChange={(e) => handleInputChange("nomineeShare", e.target.value)} className="h-12 rounded-xl" />
                         {errors.nomineeShare && <p className="text-xs text-red-500 font-bold">{errors.nomineeShare}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominee Address <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.nomineeAddress} onChange={(e) => handleInputChange("nomineeAddress", e.target.value)} className="h-12 rounded-xl" />
                         {errors.nomineeAddress && <p className="text-xs text-red-500 font-bold">{errors.nomineeAddress}</p>}
                      </div>

                      {/* Bank account details */}
                      <div className="md:col-span-2 border-b pb-2 pt-6">
                         <h3 className="font-bold text-[#1a1f36] text-[14px]">Primary Bank Account Details (For Payouts)</h3>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Holder Name <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.bankHolderName} onChange={(e) => handleInputChange("bankHolderName", e.target.value)} className="h-12 rounded-xl" />
                         {errors.bankHolderName && <p className="text-xs text-red-500 font-bold">{errors.bankHolderName}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bank Name <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.bankName} onChange={(e) => handleInputChange("bankName", e.target.value)} className="h-12 rounded-xl" />
                         {errors.bankName && <p className="text-xs text-red-500 font-bold">{errors.bankName}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Branch Name <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.bankBranch} onChange={(e) => handleInputChange("bankBranch", e.target.value)} className="h-12 rounded-xl" />
                         {errors.bankBranch && <p className="text-xs text-red-500 font-bold">{errors.bankBranch}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Number <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.bankAccountNumber} onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)} className="h-12 rounded-xl" />
                         {errors.bankAccountNumber && <p className="text-xs text-red-500 font-bold">{errors.bankAccountNumber}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">IFSC Code <span className="text-red-500 font-black">*</span></Label>
                         <Input value={formData.bankIfsc} onChange={(e) => handleInputChange("bankIfsc", e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" className="h-12 rounded-xl" />
                         {errors.bankIfsc && <p className="text-xs text-red-500 font-bold">{errors.bankIfsc}</p>}
                      </div>
                   </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                   key="step4" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Upload Verification Documents</h2>
                       <p className="text-gray-500 text-sm">Please upload all mandatory files (Max size: 5MB, Supported formats: PDF, JPG, JPEG, PNG)</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {getRequiredDocuments().map((doc) => {
                         const progress = uploadProgress[doc.id] || 0;
                         const file = uploadedFiles[doc.id];
                         return (
                            <div key={doc.id} className="p-5 border border-dashed border-gray-200 hover:border-[#1a1f36] rounded-2xl flex flex-col justify-between space-y-3 transition-colors relative bg-slate-50/50">
                               <div>
                                  <div className="flex justify-between items-start">
                                     <span className="text-xs font-bold text-[#1a1f36] capitalize pr-4">
                                       {doc.name} <span className="text-red-500 font-black">*</span>
                                     </span>
                                     <FileText className="w-4 h-4 text-slate-400" />
                                  </div>
                                  {file && (
                                     <p className="text-[10px] text-emerald-600 font-bold truncate mt-1">{file.name}</p>
                                  )}
                                </div>
                               
                               <div className="space-y-2">
                                  {progress > 0 && progress < 100 && (
                                     <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                     </div>
                                  )}
                                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-[#1a1f36] cursor-pointer hover:bg-slate-50 transition-colors">
                                     <Upload className="w-3.5 h-3.5" />
                                     {file ? "Change File" : "Upload File"}
                                     <input 
                                       type="file" 
                                       accept=".pdf,.jpg,.jpeg,.png"
                                       className="hidden" 
                                       onChange={(e) => handleFileChange(doc.id, e)}
                                     />
                                  </label>
                               </div>
                               {errors[doc.id] && <p className="text-[10px] font-bold text-red-500">{errors[doc.id]}</p>}
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                   key="step5" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="p-10 space-y-10"
                >
                   <div className="text-center space-y-4">
                       <div className="w-20 h-20 rounded-full bg-indigo-50 text-[#1a1f36] flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                          <Calculator className="w-10 h-10" />
                       </div>
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Review and Declare</h2>
                       <p className="text-gray-500 text-sm">Fine tune your options and accept the declaration to submit</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
                      <div className="space-y-6">
                         <div className="bg-[#1a1f36] rounded-[32px] p-8 text-white flex flex-col justify-center space-y-5 shadow-xl relative overflow-hidden">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Expected Maturity Amount</span>
                            <h3 className="text-4xl font-black">₹{Math.round(calculateMaturity()).toLocaleString()}</h3>
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-3 text-[11px] font-bold text-white/60 uppercase">
                               <div className="flex justify-between">
                                  <span>Deposit Rate</span>
                                  <span className="text-white">{getDynamicRate()}% p.a.</span>
                               </div>
                               <div className="flex justify-between">
                                  <span>Total Tenure</span>
                                  <span className="text-white">{tenure} Months</span>
                               </div>
                               <div className="flex justify-between">
                                  <span>{['Recurring', 'Pigmy'].includes(selectedScheme.type) ? 'Monthly Installment' : 'Initial Investment'}</span>
                                  <span className="text-white">₹{amount.toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span>Total Principal Paid</span>
                                  <span className="text-white">₹{(['Recurring', 'Pigmy'].includes(selectedScheme.type) ? amount * tenure : amount).toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span>Expected Interest</span>
                                  <span className="text-white">₹{Math.round(calculateMaturity() - (['Recurring', 'Pigmy'].includes(selectedScheme.type) ? amount * tenure : amount)).toLocaleString()}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex gap-3 items-start border p-4 rounded-xl bg-slate-50">
                            <input 
                              type="checkbox" 
                              id="declare-check"
                              className="mt-1 w-4 h-4 cursor-pointer"
                              checked={formData.declarationAccepted === "true"}
                              onChange={(e) => handleInputChange("declarationAccepted", e.target.checked ? "true" : "false")}
                            />
                            <label htmlFor="declare-check" className="text-xs text-slate-600 font-medium leading-relaxed cursor-pointer select-none">
                               I hereby declare that the information provided is true and correct. I agree to abide by the rules and regulations of the Society.
                            </label>
                         </div>

                         <div className="p-5 border border-dashed rounded-2xl space-y-3 bg-slate-50/50">
                            <label className="text-xs font-bold text-slate-700 block">
                               Applicant Signature Upload <span className="text-red-500 font-black">*</span>
                            </label>
                            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 bg-white rounded-xl text-xs font-bold text-[#1a1f36] cursor-pointer hover:bg-slate-50 transition-colors">
                               <Upload className="w-4 h-4" />
                               {uploadedFiles['applicantSignature'] ? uploadedFiles['applicantSignature'].name : "Upload Signature Image"}
                               <input 
                                 type="file" 
                                 accept=".jpg,.jpeg,.png" 
                                 className="hidden" 
                                 onChange={(e) => handleFileChange("applicantSignature", e)}
                               />
                            </label>
                            {errors['applicantSignature'] && <p className="text-[10px] text-red-500 font-bold">{errors['applicantSignature']}</p>}
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="bg-gray-50/50 p-10 flex justify-between items-center border-t border-gray-100">
              {step > 1 ? (
                <Button type="button" onClick={handleBack} variant="ghost" className="h-14 px-8 font-bold text-gray-500 rounded-2xl hover:bg-[#1a1f36]/5">
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Back
                </Button>
              ) : <div />}

              {step < 5 ? (
                <Button type="button" onClick={handleNext} className="h-14 px-12 font-bold bg-[#1a1f36] text-white rounded-2xl hover:bg-[#2d3356] shadow-lg shadow-black/10">
                   Next Step
                   <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                   type="button" 
                   disabled={isSubmitting} 
                   onClick={handleSubmit} 
                   className="h-14 px-12 font-bold bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] shadow-lg shadow-amber-900/10 flex items-center gap-2"
                >
                   {isSubmitting ? "Submitting Application..." : "Submit Application"}
                   <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
           </div>
        </section>
        
        {/* Support Banner */}
        <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Licensed Cooperative</div>
           <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Secure Custody</div>
           <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> 50K+ Active Members</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DepositApplicationPage;
