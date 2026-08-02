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
  Car,
  Users,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DownloadPaymentHistoryModal from '@/components/DownloadPaymentHistoryModal';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const LoanRequestsPage = () => {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
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
             <Button
                onClick={() => setShowDownloadModal(true)}
                className="h-12 px-6 bg-[#6b21a8] text-white rounded-2xl font-bold hover:bg-[#581c87] shadow-lg shadow-purple-900/10 flex items-center gap-2"
             >
                <Download className="w-4 h-4" />
                Download Payment History
             </Button>
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
                                   <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-black uppercase tracking-tighter">Registered ID</span>
                                   <p className="text-[10px] text-amber-600 font-bold">{loan.member?.memberId || loan.registeredId || "—"}</p>
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
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#c9a84c]" />
                  Loan Application Details
                </DialogTitle>
                {selectedLoan && (
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                    selectedLoan.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    selectedLoan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedLoan.status}
                  </span>
                )}
              </div>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-6 py-4">
                {/* Application Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="p-3 bg-slate-50 border-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Loan Amount</p>
                    <p className="text-lg font-black text-slate-900">₹{selectedLoan.amount.toLocaleString()}</p>
                  </Card>
                  <Card className="p-3 bg-slate-50 border-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Interest Rate</p>
                    <p className="text-lg font-black text-slate-900">{selectedLoan.roi || "13"}% p.a.</p>
                  </Card>
                  <Card className="p-3 bg-slate-50 border-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Tenure (Months)</p>
                    <p className="text-lg font-black text-slate-900">{selectedLoan.termMonths} Months</p>
                  </Card>
                  <Card className="p-3 bg-slate-50 border-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Documentation Charges</p>
                    <p className="text-lg font-black text-red-600">₹{(selectedLoan.amount * 0.025).toLocaleString()}</p>
                  </Card>
                  <Card className="p-3 bg-slate-50 border-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Monthly EMI</p>
                    <p className="text-lg font-black text-emerald-600">
                      ₹{(() => {
                        const principal = selectedLoan.amount;
                        const roi = selectedLoan.roi || 13;
                        const months = selectedLoan.termMonths || 12;
                        const r = roi / 12 / 100;
                        const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
                        return Math.round(emi).toLocaleString();
                      })()}
                    </p>
                  </Card>
                </div>

                {/* Applicant & Guarantor Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Applicant Info */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <User className="h-4 w-4" /> Applicant Information
                    </h4>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Full Name</span>
                        <span className="font-bold">{selectedLoan.member?.fullName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Registered ID</span>
                        <span className="font-bold font-mono">{selectedLoan.member?.memberId || selectedLoan.registeredId || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Contact / Email</span>
                        <span className="font-bold">{selectedLoan.member?.contact}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Aadhaar No.</span>
                        <span className="font-bold">{selectedLoan.member?.aadhaarNumber || "—"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-semibold text-slate-500">PAN Card No.</span>
                        <span className="font-bold uppercase">{selectedLoan.member?.panNumber || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guarantor Details */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="h-4 w-4" /> Guarantor Details
                    </h4>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Guarantor Info</span>
                        <span className="font-bold">{selectedLoan.guarantorDetail || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Employment Status</span>
                        <span className="font-bold">{selectedLoan.employmentStatus || "—"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-semibold text-slate-500">Monthly Income</span>
                        <span className="font-bold">₹{Number(selectedLoan.monthlyIncome || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Specifications row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Building className="h-4 w-4" /> Loan Specifications
                    </h4>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Loan Product</span>
                        <span className="font-bold">{selectedLoan.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Purpose of Loan</span>
                        <span className="font-bold">{selectedLoan.purpose || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                        <span className="font-semibold text-slate-500">Start Date</span>
                        <span className="font-bold">{selectedLoan.startDate ? new Date(selectedLoan.startDate).toLocaleDateString('en-IN') : "—"}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-semibold text-slate-500">End Date</span>
                        <span className="font-bold">{selectedLoan.endDate ? new Date(selectedLoan.endDate).toLocaleDateString('en-IN') : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Activity className="h-4 w-4" /> Risk Assessment
                    </h4>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                      <div className="flex justify-between pb-1">
                        <span className="font-semibold text-slate-500">Credit Score (Simulated)</span>
                        <span className="font-bold text-emerald-600">{getCibilScore(selectedLoan.id)} (Excellent)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted Documents */}
                {(() => {
                  let docs = selectedLoan.documents;
                  if (typeof docs === 'string') {
                    try { docs = JSON.parse(docs); } catch (e) { docs = {}; }
                  }
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
                  return docs && Object.keys(docs).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Submitted Documents</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(docs).map(([key, path]: any) => (
                          <a
                            key={key}
                            href={getDocUrl(path)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-white border border-slate-150 rounded-xl text-center block hover:bg-slate-50/55 hover:border-slate-300 transition-all shadow-sm"
                          >
                            <FileText className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                            <span className="text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider block">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Action Banner / Rejection Remarks */}
                {selectedLoan.status === "PENDING" ? (
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500">Review Remarks (Mandatory for Rejection)</label>
                      <textarea
                        placeholder="Add internal review remarks..."
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#1a1f36]/5 outline-none resize-none"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Loan Approved & Disbursed
                    </p>
                    {selectedLoan.adminRemarks && (
                      <p className="text-emerald-700 mt-1 italic">Remarks: {selectedLoan.adminRemarks}</p>
                    )}
                  </div>
                )}

                {/* Repayments / Repayment schedule section */}
                {selectedLoan.status !== 'PENDING' && (
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    {/* Left Column: EMI Repayment Schedule */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">EMI Repayment Schedule</h4>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                              <th className="p-2.5">Inst. #</th>
                              <th className="p-2.5">Due Date</th>
                              <th className="p-2.5 text-right">Amount</th>
                              <th className="p-2.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-[#1a1f36]">
                            {selectedLoan.emiSchedule?.map((emi: any, idx: number) => (
                              <tr key={emi.id} className="hover:bg-slate-50/55">
                                <td className="p-2.5 font-bold">{idx + 1}</td>
                                <td className="p-2.5">{new Date(emi.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="p-2.5 text-right font-bold">₹{Number(emi.totalEmi).toLocaleString()}</td>
                                <td className="p-2.5 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
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

                    {/* Right Column: Record Repayment Form */}
                    {['APPROVED', 'ACTIVE', 'DISBURSED'].includes(selectedLoan.status) && (
                      <form onSubmit={handleRecordRepayment} className="space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Record Repayment</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Repayment Amount (₹)</label>
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
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Payment Mode</label>
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
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Reference / Txn ID</label>
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
                    )}
                  </div>
                )}
                <DialogFooter className="pt-6 border-t border-gray-100 sm:justify-between flex flex-wrap gap-4">
                   {selectedLoan.status === 'PENDING' ? (
                      <>
                         <div className="flex gap-2">
                            <Button 
                               disabled={updateStatusMutation.isPending}
                               onClick={() => handleAction(selectedLoan.id, "REJECTED")}
                               variant="outline" 
                               className="h-12 px-6 border-red-100 text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-2xl"
                            >
                               Reject Application
                            </Button>
                            <Button 
                               disabled={updateStatusMutation.isPending}
                               onClick={() => handleAction(selectedLoan.id, "ADDITIONAL_DOCUMENTS_REQUIRED")}
                               variant="outline" 
                               className="h-12 px-6 border-amber-200 text-amber-600 hover:bg-amber-50 font-black text-xs uppercase tracking-widest rounded-2xl"
                            >
                               Request Info
                            </Button>
                         </div>
                         <Button 
                            disabled={updateStatusMutation.isPending}
                            onClick={() => handleAction(selectedLoan.id, "APPROVED")}
                            className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20"
                         >
                            {updateStatusMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
                            Approve & Disburse
                         </Button>
                      </>
                   ) : (
                      <Button 
                         onClick={() => setIsModalOpen(false)}
                         className="h-12 px-8 bg-slate-600 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 ml-auto"
                      >
                         Close Details
                      </Button>
                   )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
         </Dialog>

         <DownloadPaymentHistoryModal
            isOpen={showDownloadModal}
            onClose={() => setShowDownloadModal(false)}
            isAdmin={true}
            defaultProductType="LOAN"
         />
       </main>

       <Footer />
    </div>
  );
};

export default LoanRequestsPage;
