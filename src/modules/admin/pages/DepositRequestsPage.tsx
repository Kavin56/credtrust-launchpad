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
  Wallet,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  Eye,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
  Users
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

const DepositRequestsPage = () => {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  
  const [txnAmount, setTxnAmount] = useState("");
  const [txnType, setTxnType] = useState("DEPOSIT");
  const [txnMode, setTxnMode] = useState("CASH");
  const [txnRefNo, setTxnRefNo] = useState("");
  const [isRecordingTxn, setIsRecordingTxn] = useState(false);

  const handleRecordTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || Number(txnAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsRecordingTxn(true);
    try {
      await api.post(`/deposits/${selectedApp.id}/transaction`, {
        amount: Number(txnAmount),
        type: txnType,
        paymentMode: txnMode,
        referenceNumber: txnRefNo
      });
      toast.success("Transaction recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      const { data } = await api.get(`/deposits?status=APPROVED`);
      const updated = data.find((d: any) => d.id === selectedApp.id);
      if (updated) {
        let parsedDetails = updated.additionalDetails;
        if (typeof updated.additionalDetails === 'string') {
          try { parsedDetails = JSON.parse(updated.additionalDetails); } catch (e) {}
        }
        let parsedDocs = updated.documents;
        if (typeof updated.documents === 'string') {
          try { parsedDocs = JSON.parse(updated.documents); } catch (e) {}
        }
        setSelectedApp({ ...updated, parsedDetails, parsedDocs });
      }
      setTxnAmount("");
      setTxnRefNo("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record transaction");
    } finally {
      setIsRecordingTxn(false);
    }
  };
  
  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["admin-deposits", filter],
    queryFn: async () => {
      const { data } = await api.get(`/deposits?status=${filter}`);
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string, status: string, remarks: string }) => {
      await api.put(`/deposits/${id}/status`, { status, remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deposits"] });
      toast.success("Deposit application status updated successfully");
      setIsModalOpen(false);
      setSelectedApp(null);
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

  const openAppDetails = (app: any) => {
    // Parse additional details if it is a JSON string
    let parsedDetails = app.additionalDetails;
    if (typeof app.additionalDetails === 'string') {
      try {
        parsedDetails = JSON.parse(app.additionalDetails);
      } catch (e) {
        parsedDetails = null;
      }
    }
    
    // Parse documents if it is a JSON string
    let parsedDocs = app.documents;
    if (typeof app.documents === 'string') {
      try {
        parsedDocs = JSON.parse(app.documents);
      } catch (e) {
        parsedDocs = null;
      }
    }

    setSelectedApp({
      ...app,
      parsedDetails,
      parsedDocs
    });
    setIsModalOpen(true);
  };

  const filteredApps = applications?.filter((app: any) => 
    app.member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <AdminNavbar />

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1a1f36] tracking-tight flex items-center gap-3">
              <Wallet className="h-8 w-8 text-[#c9a84c]" />
              Deposit Application Registry
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Verify, Approve and Manage Fixed Deposits, Recurring Deposits and Pigmy schemes
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
            {["PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === status
                    ? "bg-[#1a1f36] text-white shadow-md shadow-indigo-950/20"
                    : "bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {status} Requests
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by member or application number..."
              className="pl-9 h-10 text-xs bg-slate-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Table */}
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-gray-100">
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Application Details</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Member Info</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Deposit Type</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Deposit Amount</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Interest Rate</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Term (Months)</th>
                  <th className="p-4 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : filteredApps?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 text-sm font-medium">
                      No deposit applications found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredApps?.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[#1a1f36]">{app.applicationNo}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[#1a1f36]">{app.member?.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">ID: {app.member?.memberId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                          app.type === 'FD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          app.type === 'RD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {app.type} Deposit
                        </span>
                      </td>
                      <td className="p-4 font-black text-sm text-slate-900">
                        ₹{Number(app.amount).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-xs text-slate-600">
                        {app.interestRate}% p.a.
                      </td>
                      <td className="p-4 font-bold text-xs text-slate-600">
                        {app.termMonths} Months
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => openAppDetails(app)}
                          className="bg-[#1a1f36] hover:bg-black text-white text-xs font-bold h-8 px-4 rounded-lg gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>

      {/* Details Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 font-sans">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#c9a84c]" />
                Deposit Application Details
              </DialogTitle>
              {selectedApp && (
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                  selectedApp.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  selectedApp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {selectedApp.status}
                </span>
              )}
            </div>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              {/* Application Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-3 bg-slate-50 border-none">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Principal Amount</p>
                  <p className="text-lg font-black text-slate-900">₹{selectedApp.amount.toLocaleString()}</p>
                </Card>
                <Card className="p-3 bg-slate-50 border-none">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Interest Rate</p>
                  <p className="text-lg font-black text-slate-900">{selectedApp.interestRate}% p.a.</p>
                </Card>
                <Card className="p-3 bg-slate-50 border-none">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Tenure (Months)</p>
                  <p className="text-lg font-black text-slate-900">{selectedApp.termMonths} Months</p>
                </Card>
                <Card className="p-3 bg-slate-50 border-none">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Pending Instalments</p>
                  <p className="text-lg font-black text-slate-900">
                    {(() => {
                      const isFD = selectedApp.type !== 'RD';
                      const paidInst = isFD ? (selectedApp.status === 'APPROVED' ? 1 : 0) : (selectedApp.transactions?.filter((t: any) => t.type === 'DEPOSIT').length || 0);
                      const totalInst = isFD ? 1 : selectedApp.termMonths;
                      return `${Math.max(0, totalInst - paidInst)} / ${totalInst}`;
                    })()}
                  </p>
                </Card>
                <Card className="p-3 bg-slate-50 border-none">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Expected Maturity</p>
                  <p className="text-lg font-black text-emerald-600">
                    ₹{selectedApp.parsedDetails?.depositDetails?.expectedMaturity?.toLocaleString() || "—"}
                  </p>
                </Card>
              </div>

              {/* Applicant & Nominee Info Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Applicant Section */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User className="h-4 w-4" /> Applicant Information
                  </h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Full Name</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.applicant?.fullName || selectedApp.member?.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Registered ID</span>
                      <span className="font-bold font-mono">{selectedApp.parsedDetails?.applicant?.memberId || selectedApp.member?.memberId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Registered ID</span>
                      <span className="font-bold text-[#c9a84c]">{selectedApp.registeredId || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Contact / Email</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.applicant?.mobile || selectedApp.member?.contact}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Aadhaar No.</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.applicant?.aadhaar || "—"}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-semibold text-slate-500">PAN Card No.</span>
                      <span className="font-bold uppercase">{selectedApp.parsedDetails?.applicant?.pan || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Nominee Section */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Users className="h-4 w-4" /> Nominee Details
                  </h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Nominee Name</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.nominee?.name || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Relationship</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.nominee?.relationship || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Nominee Mobile</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.nominee?.mobile || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Aadhaar No.</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.nominee?.aadhaar || "—"}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-semibold text-slate-500">Share Percentage</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.nominee?.share || "100"}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank & Settlement Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building className="h-4 w-4" /> Bank Account Details
                  </h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Holder Name</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.bank?.holderName || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Bank Name</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.bank?.bankName || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Account Number</span>
                      <span className="font-bold font-mono">{selectedApp.parsedDetails?.bank?.accountNumber || "—"}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-semibold text-slate-500">IFSC Code</span>
                      <span className="font-bold uppercase font-mono">{selectedApp.parsedDetails?.bank?.ifsc || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Wallet className="h-4 w-4" /> Deposit Settlement Info
                  </h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-[#1a1f36]">
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Interest Payout Preference</span>
                      <span className="font-bold uppercase">{selectedApp.payoutMode || "Maturity"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                      <span className="font-semibold text-slate-500">Source of Funds</span>
                      <span className="font-bold">{selectedApp.parsedDetails?.depositDetails?.sourceOfFunds || "Savings"}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-semibold text-slate-500">Payment Mode</span>
                      <span className="font-bold uppercase">{selectedApp.parsedDetails?.depositDetails?.paymentMethod || "Online Transfer"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {selectedApp.parsedDocs && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Submitted Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(selectedApp.parsedDocs).map(([key, url]: any) => (
                      <a
                        key={key}
                        href={getDocUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white border border-slate-150 rounded-xl text-center block hover:bg-slate-50/50 hover:border-slate-300 transition-all shadow-sm"
                      >
                        <FileText className="h-5 w-5 mx-auto text-amber-600 mb-1" />
                        <span className="text-[10px] font-bold text-[#1a1f36] uppercase tracking-wider block">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions / Transactions / Repayments */}
              {selectedApp.status === "PENDING" ? (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Rejection Remarks (Mandatory for Rejection)</label>
                    <Input
                      placeholder="Add details, compliance status or reasons for rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                      onClick={() => handleAction(selectedApp.id, "REJECTED")}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                    </Button>
                    <Button
                      type="button"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => handleAction(selectedApp.id, "APPROVED")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Open Account
                    </Button>
                  </DialogFooter>
                </div>
              ) : selectedApp.status === "APPROVED" ? (
                <div className="pt-6 border-t border-gray-150 space-y-6">
                  {/* Processed Banners */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-800">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Account Active - Processed by {selectedApp.approvedBy || "Admin"}
                    </p>
                    {selectedApp.adminRemarks && (
                      <p className="text-emerald-700 mt-1 italic">Remarks: {selectedApp.adminRemarks}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Transaction History */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Transaction History</h4>
                      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                              <th className="p-2.5">Date</th>
                              <th className="p-2.5">Type</th>
                              <th className="p-2.5">Ref. No</th>
                              <th className="p-2.5 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-[#1a1f36]">
                            {selectedApp.transactions && selectedApp.transactions.length > 0 ? (
                              selectedApp.transactions.map((txn: any) => (
                                <tr key={txn.id} className="hover:bg-slate-50/55">
                                  <td className="p-2.5">{new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                  <td className="p-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                      txn.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {txn.type}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-[9px]">{txn.referenceNumber || "—"}</td>
                                  <td className="p-2.5 text-right font-bold">₹{txn.amount.toLocaleString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-slate-400 italic">No transactions.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Record Transaction Form */}
                    <form onSubmit={handleRecordTxn} className="space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Record Transaction</h4>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Type</label>
                            <select
                              value={txnType}
                              onChange={(e) => setTxnType(e.target.value)}
                              className="w-full h-9 border border-slate-200 bg-white px-2 rounded-md text-xs font-medium outline-none"
                            >
                              <option value="DEPOSIT">DEPOSIT</option>
                              <option value="WITHDRAWAL">WITHDRAWAL</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Mode</label>
                            <select
                              value={txnMode}
                              onChange={(e) => setTxnMode(e.target.value)}
                              className="w-full h-9 border border-slate-200 bg-white px-2 rounded-md text-xs font-medium outline-none"
                            >
                              <option value="CASH">CASH</option>
                              <option value="UPI">UPI</option>
                              <option value="CHEQUE">CHEQUE</option>
                              <option value="BANK_TRANSFER">BANK TRANSFER</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Amount (₹)</label>
                          <Input
                            type="number"
                            placeholder="Amount in ₹"
                            value={txnAmount}
                            onChange={(e) => setTxnAmount(e.target.value)}
                            className="h-9 border-slate-200 text-xs"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Reference / UTR ID</label>
                          <Input
                            placeholder="Optional transaction reference"
                            value={txnRefNo}
                            onChange={(e) => setTxnRefNo(e.target.value)}
                            className="h-9 border-slate-200 text-xs"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isRecordingTxn}
                          className="w-full h-10 bg-[#1a1f36] hover:bg-[#2d3356] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
                        >
                          {isRecordingTxn ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                          Submit Transaction
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 bg-slate-50/30 p-4 rounded-2xl text-xs space-y-2">
                  <p className="font-bold text-[#1a1f36] flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-500" /> Request rejected by {selectedApp.approvedBy || "Admin"}
                  </p>
                  {selectedApp.adminRemarks && (
                    <p className="text-slate-500 font-medium italic">Reason: {selectedApp.adminRemarks}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepositRequestsPage;
