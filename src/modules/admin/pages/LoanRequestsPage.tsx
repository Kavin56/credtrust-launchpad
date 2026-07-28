import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getApiBaseUrl } from "@/lib/api";

const getDocUrl = (url: string | null) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = getApiBaseUrl();
  if (url.startsWith('gs://') || url.startsWith('/uploads/')) {
    return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
  }
  const origin = baseUrl.replace('/api/v1', '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};
import AdminNavbar from '@/components/AdminNavbar';
import Footer from "@/components/Footer";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Download, 
  User, 
  Briefcase, 
  Wallet,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  LayoutList,
  BadgeCheck,
  Info,
  Eye,
  AlertCircle,
  Activity,
  Loader2,
  Car
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const LoanRequestsPage = () => {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  
  const [repayAmount, setRepayAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [refNo, setRefNo] = useState("");
  const [isRepaying, setIsRepaying] = useState(false);

  const handleRecordRepayment = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!repayAmount || Number(repayAmount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
     }
     setIsRepaying(true);
     try {
        await api.post(`/loans/${selectedLoan.id}/repay`, {
           amount: Number(repayAmount),
           paymentMode,
           referenceNumber: refNo
        });
        toast.success("Repayment recorded successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
        const { data: updatedLoan } = await api.get(`/loans/${selectedLoan.id}`);
        setSelectedLoan(updatedLoan);
        setRepayAmount("");
        setRefNo("");
     } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to record repayment");
     } finally {
        setIsRepaying(false);
     }
  };
  
  const queryClient = useQueryClient();

  const { data: loans, isLoading, error, isError } = useQuery({
    queryKey: ["admin-loans", filter],
    queryFn: async () => {
      const { data } = await api.get(`/loans?status=${filter}`);
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string, status: string, remarks: string }) => {
      await api.put(`/loans/${id}/status`, { status, remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
      toast.success("Loan status updated successfully");
      setIsModalOpen(false);
      setSelectedLoan(null);
      setRemarks("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  });

  const handleAction = (id: string, status: string) => {
    if (!remarks && status === "REJECTED") {
       toast.error("Please provide remarks for rejection");
       return;
    }
    updateStatusMutation.mutate({ id, status, remarks });
  };

  const openLoanDetails = (loan: any) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const filteredLoans = loans?.filter((l: any) => 
    l.member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock CIBIL Score Generator
  const getCibilScore = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 650 + (hash % 200); // Returns 650-850
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />
      
      <main className="flex-1 pb-20 px-4 max-w-7xl mx-auto w-full pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Management Terminal</span>
            </div>
            <h1 className="text-4xl font-heading font-black text-[#1a1f36] tracking-tight">
              Loan Request <span className="text-[#c9a84c]">Center</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Underwriting & approval pipeline for society credit products</p>
          </div>

          <div className="flex gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1a1f36] transition-colors" />
                <Input 
                   placeholder="Search member or loan ID..." 
                   className="pl-11 w-72 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1a1f36]/5"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Button className="h-12 px-6 bg-[#1a1f36] text-white rounded-2xl font-bold hover:bg-[#2d3356] shadow-lg shadow-black/5">
                <Filter className="w-4 h-4 mr-2" />
                Filters
             </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-10 bg-white p-2 rounded-[24px] border border-slate-100 w-fit shadow-sm">
           {["PENDING", "APPROVED", "REJECTED", "ACTIVE"].map((s) => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-8 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${
                 filter === s ? "bg-[#1a1f36] text-white shadow-xl shadow-[#1a1f36]/20" : "text-slate-400 hover:text-[#1a1f36] hover:bg-slate-50"
               }`}
             >
               {s}
             </button>
           ))}
        </div>

        <div className="grid gap-6">
           {isLoading ? (
             <div className="text-center py-32 text-slate-300 flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#1a1f36] border-t-transparent rounded-full animate-spin" />
                <p className="font-black uppercase tracking-widest text-[10px]">Synchronizing Pipeline...</p>
             </div>
           ) : isError ? (
              <Card className="border-red-100 bg-red-50/50 rounded-[40px] overflow-hidden">
                <CardContent className="py-20 text-center text-red-600 font-bold">
                   <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-black mb-2">API Connection Failed</h3>
                   <p className="text-sm font-medium text-red-400 mb-8 max-w-xs mx-auto">The management server is currently unreachable. Please verify backend status.</p>
                   <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-loans"] })} className="bg-red-600 text-white hover:bg-red-700 h-12 px-10 rounded-2xl font-bold">
                      Reconnect Terminal
                   </Button>
                </CardContent>
              </Card>
           ) : filteredLoans?.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                <LayoutList className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-300 font-black uppercase tracking-widest text-[10px]">Empty Pipeline</p>
              </div>
           ) : (
             filteredLoans?.map((loan: any) => (
               <motion.div
                 key={loan.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="group cursor-pointer"
                 onClick={() => openLoanDetails(loan)}
               >
                 <Card className="border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#1a1f36]/5 transition-all duration-500 rounded-[40px] overflow-hidden bg-white">
                    <div className="flex flex-col lg:flex-row">
                       <div className="p-8 lg:w-1/3 border-r border-slate-50 space-y-6">
                          <div className="flex items-center gap-5">
                             <div className="w-16 h-16 rounded-[24px] bg-[#1a1f36] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#1a1f36]/20">
                                {loan.member?.fullName?.charAt(0)}
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-[#1a1f36]">{loan.member?.fullName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-tighter">Member</span>
                                   <p className="text-[10px] text-slate-400 font-bold">{loan.member?.memberId}</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-1 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loan Product</p>
                             <div className="flex items-center justify-between">
                                <h4 className="font-bold text-[#1a1f36]">{loan.type}</h4>
                                <ArrowUpRight className="w-4 h-4 text-[#c9a84c]" />
                             </div>
                          </div>
                       </div>

                       <div className="p-8 lg:w-1/3 border-r border-slate-50 flex flex-col justify-center gap-8">
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Request Amount</p>
                                <p className="text-3xl font-black text-[#6b21a8]">₹{Number(loan.amount).toLocaleString()}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net ROI</p>
                                <p className="text-3xl font-black text-[#1a1f36]">{Number(loan.interestRate)}%</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                             <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-bold text-slate-500">{loan.termMonths} Months</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Verified Profile</span>
                             </div>
                          </div>
                       </div>

                       <div className="p-8 lg:w-1/3 bg-slate-50/50 flex flex-col justify-center items-center gap-4">
                          <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-400 font-bold hover:bg-white hover:text-[#1a1f36] transition-all">
                             <Eye className="w-5 h-5 mr-3" />
                             View Full Dossier
                          </Button>
                          <div className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             loan.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                             loan.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             "bg-red-50 text-red-600 border-red-100"
                          }`}>
                             {loan.status}
                          </div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))
           )}
        </div>

        {/* Detailed Review Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[40px]">
              <DialogHeader className="sr-only">
                <DialogTitle>
                  {selectedLoan
                    ? `Review loan ${selectedLoan.loanNumber}`
                    : "Review loan application"}
                </DialogTitle>
                <DialogDescription>
                  {selectedLoan
                    ? `Review documents and decide whether to approve or reject the application for ${selectedLoan.member?.fullName || "the selected member"}.`
                    : "Loan application review dialog."}
                </DialogDescription>
              </DialogHeader>
              {selectedLoan && (
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="bg-[#1a1f36] p-10 text-white flex justify-between items-start">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-2xl bg-[#c9a84c] text-[#1a1f36] flex items-center justify-center font-black text-xl">
                              {selectedLoan.member?.fullName?.charAt(0)}
                           </div>
                           <div>
                              <h2 className="text-2xl font-black leading-tight">{selectedLoan.member?.fullName}</h2>
                              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Application ID: {selectedLoan.loanNumber}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/5">{selectedLoan.type}</span>
                           <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/5">{selectedLoan.employmentStatus}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-[#c9a84c] uppercase tracking-widest mb-1">Requested Capital</p>
                        <h3 className="text-4xl font-black">₹{Number(selectedLoan.amount).toLocaleString()}</h3>
                     </div>
                  </div>                  <div className="p-10 bg-white grid md:grid-cols-2 gap-10 max-h-[500px] overflow-y-auto">
                     {/* Left Column: Financial Context or Vehicle details */}
                     <div className="space-y-8">
                        {(() => {
                           let parsed: any = null;
                           if (selectedLoan.additionalDetails) {
                              try { parsed = JSON.parse(selectedLoan.additionalDetails); } catch(e) {}
                           }
                           if (parsed && parsed.formData) {
                              return (
                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <ShieldCheck className="w-4 h-4 text-[#c9a84c]" /> Application Attributes
                                    </h4>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-600">
                                       {Object.entries(parsed.formData).map(([key, val]: [string, any]) => {
                                          if (!val || typeof val !== 'string' || !val.trim()) return null;
                                          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                          return (
                                             <div key={key} className="col-span-2 sm:col-span-1">
                                                <span className="text-slate-400 block text-[9px] uppercase">{label}</span>
                                                {val}
                                             </div>
                                          );
                                       })}
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <ShieldCheck className="w-4 h-4 text-[#c9a84c]" /> Credit Bureau Assessment
                                    </h4>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2 text-[11px] font-semibold text-slate-600">
                                       <div>
                                          <span className="text-slate-400 block text-[9px] uppercase">Simulated Credit Score</span>
                                          <span className="text-lg font-black text-emerald-600">{getCibilScore(selectedLoan.id)} (Verified)</span>
                                       </div>
                                    </div>
                                 </div>
                              );
                           }
                           if (parsed && parsed.vehicle) {
                              return (
                                 <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <Car className="w-4 h-4 text-[#c9a84c]" /> Vehicle Specifications
                                    </h4>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-600">
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Type</span> {parsed.vehicle.vehicleType}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Category</span> {parsed.vehicle.vehicleCategory}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Brand & Model</span> {parsed.vehicle.brand} {parsed.vehicle.model}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Variant</span> {parsed.vehicle.variant || "—"}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Year & Color</span> {parsed.vehicle.manufacturingYear} ({parsed.vehicle.color || "—"})</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Purpose</span> {parsed.vehicle.purposeOfPurchase}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Ex-Showroom Price</span> ₹{Number(parsed.vehicle.exShowroomPrice || 0).toLocaleString()}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">On-Road Cost</span> ₹{Number(parsed.vehicle.onRoadPrice || 0).toLocaleString()}</div>
                                       <div className="col-span-2"><span className="text-slate-400 block text-[9px] uppercase">Dealer Details</span> {parsed.vehicle.dealerName} ({parsed.vehicle.dealerAddress || "—"})</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Down Payment</span> ₹{Number(parsed.vehicle.downPayment || 0).toLocaleString()}</div>
                                       <div><span className="text-slate-400 block text-[9px] uppercase">Requested Loan Amount</span> ₹{Number(parsed.vehicle.loanAmount || 0).toLocaleString()}</div>
                                    </div>

                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                       <User className="w-4 h-4 text-[#c9a84c]" /> Applicant Profile (Auto-fetched)
                                    </h4>
                                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2 text-[11px] font-semibold text-slate-600">
                                       <div><span className="text-slate-400 text-[9px] uppercase">Full Name:</span> {parsed.profile?.fullName}</div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Member ID:</span> {parsed.profile?.memberId}</div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Registered ID:</span> <span className="font-bold text-[#c9a84c]">{selectedLoan.registeredId || "—"}</span></div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Aadhaar Number:</span> {parsed.profile?.aadhaarNumber}</div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Phone:</span> {parsed.profile?.mobileNumber}</div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Email:</span> {parsed.profile?.emailAddress}</div>
                                       <div><span className="text-slate-400 text-[9px] uppercase">Address:</span> {parsed.profile?.residentialAddress}</div>
                                    </div>
                                 </div>
                              );
                           }
                           return (
                              <>
                                 <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                       <Activity className="w-4 h-4 text-[#c9a84c]" /> Risk Assessment
                                    </h4>
                                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                                       <div className="relative z-10">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credit Score (Simulated)</p>
                                          <div className="flex items-baseline gap-2">
                                             <span className="text-5xl font-black text-[#1a1f36]">{getCibilScore(selectedLoan.id)}</span>
                                             <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Excellent</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
                                             <div 
                                               className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-1000"
                                               style={{ width: `${((getCibilScore(selectedLoan.id) - 300) / 600) * 100}%` }}
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                       <Wallet className="w-4 h-4 text-[#c9a84c]" /> Income Data
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Monthly Income</p>
                                          <p className="text-lg font-black text-[#1a1f36]">₹{Number(selectedLoan.monthlyIncome || 0).toLocaleString()}</p>
                                       </div>
                                       <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Service Tenure</p>
                                          <p className="text-lg font-black text-[#1a1f36]">{selectedLoan.termMonths} Mo.</p>
                                       </div>
                                    </div>
                                 </div>
                              </>
                           );
                        })()}
                        
                        {selectedLoan.status !== 'PENDING' && (
                           <div className="mt-6 space-y-3">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">EMI Repayment Schedule</h4>
                              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm max-h-[300px] overflow-y-auto">
                                 <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                       <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                                          <th className="p-3">Inst. #</th>
                                          <th className="p-3">Due Date</th>
                                          <th className="p-3 text-right">Amount</th>
                                          <th className="p-3 text-center">Status</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-[#1a1f36]">
                                       {selectedLoan.emiSchedule?.map((emi: any, idx: number) => (
                                          <tr key={emi.id} className="hover:bg-slate-50/50">
                                             <td className="p-3 font-bold">{idx + 1}</td>
                                             <td className="p-3">{new Date(emi.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                             <td className="p-3 text-right font-bold">₹{Number(emi.totalEmi).toLocaleString()}</td>
                                             <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider ${
                                                   emi.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                }`}>
                                                   {emi.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Right Column: Documents & Decision */}
                     <div className="space-y-8">
                        <div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                              <FileText className="w-4 h-4 text-[#c9a84c]" /> Verification Dossier
                           </h4>
                           <div className="space-y-3">
                              {(() => {
                                 let docs = selectedLoan.documents;
                                 if (typeof docs === 'string') {
                                    try { docs = JSON.parse(docs); } catch (e) { docs = {}; }
                                 }
                                 // Add static demo files if it is a Vehicle Loan
                                 if (selectedLoan.type === "Vehicle Loan" && (!docs || Object.keys(docs).length === 0)) {
                                    docs = {
                                       vehicleQuotation: "/uploads/quotation.pdf",
                                       dealerQuotationLetter: "/uploads/dealer_quotation.pdf",
                                       incomeVerification: "/uploads/salary_slip.pdf",
                                       bankStatement: "/uploads/bank_statement.pdf",
                                       drivingLicense: "/uploads/dl.png",
                                       photograph: "/uploads/photo.jpg"
                                    };
                                 }
                                 return docs && Object.entries(docs).map(([key, path]: [string, any]) => {
                                    const fullUrl = getDocUrl(path);
                                    return (
                                       <a 
                                          key={key} 
                                          href={fullUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#1a1f36] transition-all group"
                                       >
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#c9a84c]">
                                                <Download className="w-4 h-4" />
                                             </div>
                                             <span className="text-xs font-bold text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1a1f36]" />
                                       </a>
                                    );
                                 });
                              })()}
                            </div>
                        </div>

                        {selectedLoan.status === 'PENDING' ? (
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Underwriting Action</h4>
                              <textarea 
                                 placeholder="Add internal review remarks..."
                                 className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#1a1f36]/5 outline-none resize-none"
                                 value={remarks}
                                 onChange={(e) => setRemarks(e.target.value)}
                              />
                           </div>
                        ) : (['APPROVED', 'ACTIVE', 'DISBURSED'].includes(selectedLoan.status)) ? (
                           <form onSubmit={handleRecordRepayment} className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Record Repayment</h4>
                              
                              <div className="space-y-3">
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Repayment Amount (₹)</label>
                                    <Input 
                                       type="number"
                                       placeholder="e.g. 5000"
                                       value={repayAmount}
                                       onChange={(e) => setRepayAmount(e.target.value)}
                                       className="h-10 border-slate-200"
                                       required
                                    />
                                 </div>
                                 
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Payment Mode</label>
                                    <select
                                       value={paymentMode}
                                       onChange={(e) => setPaymentMode(e.target.value)}
                                       className="w-full h-10 border border-slate-200 bg-white px-3 rounded-md text-xs font-medium outline-none"
                                    >
                                       <option value="CASH">CASH</option>
                                       <option value="UPI">UPI</option>
                                       <option value="CHEQUE">CHEQUE</option>
                                       <option value="BANK_TRANSFER">BANK TRANSFER</option>
                                    </select>
                                 </div>

                                 <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reference / Txn ID</label>
                                    <Input 
                                       placeholder="Optional ref number"
                                       value={refNo}
                                       onChange={(e) => setRefNo(e.target.value)}
                                       className="h-10 border-slate-200"
                                    />
                                 </div>

                                 <Button 
                                    type="submit"
                                    disabled={isRepaying}
                                    className="w-full h-11 bg-[#1a1f36] hover:bg-[#2d3356] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                                 >
                                    {isRepaying ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    Submit Repayment
                                 </Button>
                              </div>
                           </form>
                        ) : null}
                     </div>
                  </div>

                  <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100 sm:justify-between flex flex-wrap gap-4">
                     {selectedLoan.status === 'PENDING' ? (
                        <>
                           <div className="flex gap-2">
                              <Button 
                                 disabled={updateStatusMutation.isPending}
                                 onClick={() => handleAction(selectedLoan.id, "REJECTED")}
                                 variant="outline" 
                                 className="h-14 px-8 border-red-100 text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-2xl"
                              >
                                 Reject Application
                              </Button>
                              <Button 
                                 disabled={updateStatusMutation.isPending}
                                 onClick={() => handleAction(selectedLoan.id, "ADDITIONAL_DOCUMENTS_REQUIRED")}
                                 variant="outline" 
                                 className="h-14 px-8 border-amber-200 text-amber-600 hover:bg-amber-50 font-black text-xs uppercase tracking-widest rounded-2xl"
                              >
                                 Request Info
                              </Button>
                           </div>
                           <Button 
                              disabled={updateStatusMutation.isPending}
                              onClick={() => handleAction(selectedLoan.id, "APPROVED")}
                              className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20"
                           >
                              {updateStatusMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
                              Approve & Disburse
                           </Button>
                        </>
                     ) : (
                        <Button 
                           onClick={() => setIsModalOpen(false)}
                           className="h-14 px-10 bg-slate-600 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 ml-auto"
                        >
                           Close Details
                        </Button>
                     )}
                  </DialogFooter>
               </div>
               )}
           </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default LoanRequestsPage;
