import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Header from "@/components/Header";
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
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const LoanRequestsPage = () => {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
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
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  });

  const handleAction = (id: string, status: string) => {
    const remarks = prompt(`Enter remarks for ${status.toLowerCase()}:`);
    if (remarks !== null) {
      updateStatusMutation.mutate({ id, status, remarks });
    }
  };

  const filteredLoans = loans?.filter((l: any) => 
    l.member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
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
                 className="group"
               >
                 <Card className="border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#1a1f36]/5 transition-all duration-500 rounded-[40px] overflow-hidden bg-white">
                    <div className="flex flex-col lg:flex-row">
                       {/* Left side: Member & Product */}
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

                       {/* Center: Financial Data */}
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
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Self-Verified</span>
                             </div>
                          </div>
                       </div>

                       {/* Right side: Actions (the "Side One") */}
                       <div className="p-8 lg:w-1/3 bg-slate-50/50 flex flex-col justify-center items-center gap-4">
                          {loan.status === "PENDING" ? (
                             <div className="w-full space-y-3">
                                <Button 
                                   onClick={() => handleAction(loan.id, "APPROVED")}
                                   className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02]"
                                >
                                   <CheckCircle2 className="w-5 h-5 mr-3" />
                                   Approve Request
                                </Button>
                                <Button 
                                   onClick={() => handleAction(loan.id, "REJECTED")}
                                   variant="outline" 
                                   className="w-full h-14 bg-white border-red-100 text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                                >
                                   <XCircle className="w-5 h-5 mr-3" />
                                   Reject Application
                                </Button>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center gap-3">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
                                   loan.status === "APPROVED" ? "border-emerald-50 bg-emerald-500 text-white" : 
                                   loan.status === "REJECTED" ? "border-red-50 bg-red-500 text-white" : "border-blue-50 bg-blue-500 text-white"
                                }`}>
                                   {loan.status === "APPROVED" ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${
                                   loan.status === "APPROVED" ? "text-emerald-600" : "text-red-600"
                                }`}>
                                   Entry {loan.status}
                                </span>
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Footer: Expandable Metadata */}
                    <div className="bg-[#1a1f36] p-8 grid md:grid-cols-3 gap-10">
                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                             <Briefcase className="w-4 h-4 text-[#c9a84c]" /> Financial Profile
                          </h5>
                          <div className="space-y-2">
                             <p className="text-[14px] font-bold text-white">{loan.employmentStatus || "Standard Income"}</p>
                             <p className="text-2xl font-black text-[#c9a84c]">₹{Number(loan.monthlyIncome || 0).toLocaleString()} <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">per month</span></p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                             <FileText className="w-4 h-4 text-[#c9a84c]" /> Digital Dossier
                          </h5>
                          <div className="flex flex-wrap gap-2">
                             {loan.documents && Object.entries(loan.documents).map(([key, url]: [string, any]) => (
                                url && (
                                  <a 
                                    key={key} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white/80 hover:bg-white/10 hover:text-white transition-all uppercase tracking-tighter"
                                  >
                                    <Download className="w-3 h-3 inline mr-2 text-[#c9a84c]" />
                                    {key.replace(/([A-Z])/g, ' $1')}
                                  </a>
                                )
                             ))}
                             {!loan.documents && <p className="text-xs text-white/20 font-medium italic">No digital copies attached</p>}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-3">
                             <ShieldCheck className="w-4 h-4 text-[#c9a84c]" /> Security Context
                          </h5>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <p className="text-xs text-white/60 font-medium leading-relaxed">
                                <span className="text-white font-bold">Vetting Detail:</span> {loan.guarantorDetail || "Unsecured credit request. Review member share capital history before approval."}
                             </p>
                             {loan.adminRemarks && (
                               <p className="text-[10px] text-[#c9a84c] font-black mt-3 flex items-center gap-2">
                                  <Info className="w-3 h-3" /> NOTE: {loan.adminRemarks}
                               </p>
                             )}
                          </div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))
           )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanRequestsPage;
