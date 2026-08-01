import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getApiBaseUrl } from "@/lib/api";
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
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DownloadPaymentHistoryModal from '@/components/DownloadPaymentHistoryModal';

const PigmyRequestsPage = () => {
  const [filter, setFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["admin-pigmy-applications", filter],
    queryFn: async () => {
      const { data } = await api.get(`/pigmy/applications?status=${filter}`);
      return data;
    },
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents");
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, remarks, agentId }: { id: string, status: string, remarks: string, agentId?: string }) => {
      await api.put(`/pigmy/applications/${id}/status`, { status, remarks, agentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pigmy-applications"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
      toast.success("Pigmy application status updated successfully");
      setIsModalOpen(false);
      setSelectedApp(null);
      setRemarks("");
      setSelectedAgentId("");
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
    updateStatusMutation.mutate({ 
      id, 
      status, 
      remarks, 
      agentId: (selectedAgentId && selectedAgentId !== 'none') ? selectedAgentId : undefined 
    });
  };

  const getDocUrl = (url: string | null) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
  };

  const openAppDetails = (app: any) => {
    setSelectedApp(app);
    setSelectedAgentId(app.agentId || "");
    setRemarks("");
    setIsModalOpen(true);
  };

  const filteredApps = applications?.filter((app: any) => 
    app.member?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.registeredId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <AdminNavbar />

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1a1f36] tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-[#c9a84c]" />
              PIGMY Account Applications
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Verify customer profile information, identity docs and approve/assign agent for PIGMY enrollments
            </p>
          </div>
          <Button
            onClick={() => setShowDownloadModal(true)}
            className="h-12 px-6 bg-[#6b21a8] text-white rounded-2xl font-bold hover:bg-[#581c87] shadow-lg shadow-purple-900/10 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Collection History
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
            {["PENDING", "ACTIVE", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === status
                    ? "bg-[#1a1f36] text-white shadow-md shadow-indigo-950/20"
                    : "bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {status === "ACTIVE" ? "APPROVED" : status} Requests
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID or account number..."
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
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Account / App Number</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Registered ID</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Customer Info</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Scheme Name</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Interest Rate</th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">Enrollment Date</th>
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
                      No PIGMY applications found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredApps?.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[#1a1f36]">{app.accountNumber}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            ID: {app.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-xs font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded">
                          {app.registeredId || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-[#1a1f36]">{app.member?.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {app.member?.contact} | {app.member?.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-xs text-slate-800">{app.scheme?.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-xs text-emerald-600">{app.scheme?.interestRate}% p.a.</span>
                      </td>
                      <td className="p-4">
                        <p className="text-xs text-slate-600 font-medium">
                          {new Date(app.startDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => openAppDetails(app)}
                          className="bg-slate-50 border border-slate-200 text-[#1a1f36] hover:bg-[#1a1f36] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider h-8"
                        >
                          Review & Verify
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

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto font-sans">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-2xl font-black text-[#1a1f36] flex items-center gap-2">
              <Users className="h-6 w-6 text-[#c9a84c]" />
              Verify PIGMY Account Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete review of member profile, submitted identity documents, and PIGMY scheme enrollment choices.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 py-4">
              {/* Member Profile Info */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#c9a84c]" /> Member Profile Info
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3.5 text-xs text-[#1a1f36]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</span>
                    <span className="font-bold">{selectedApp.member?.fullName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Registered ID</span>
                    <span className="font-bold font-mono text-[#c9a84c]">{selectedApp.registeredId || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact Number</span>
                    <span className="font-bold">{selectedApp.member?.contact || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email ID</span>
                    <span className="font-bold">{selectedApp.member?.user?.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date of Birth</span>
                    <span className="font-bold">
                      {selectedApp.member?.dob ? new Date(selectedApp.member.dob).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</span>
                    <span className="font-bold capitalize">{selectedApp.member?.gender || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Scheme Enrollment Details */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" /> Scheme Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3.5 text-xs text-[#1a1f36]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Scheme Name</span>
                    <span className="font-bold">{selectedApp.scheme?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Interest Rate</span>
                    <span className="font-bold text-emerald-600">{selectedApp.scheme?.interestRate}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Maturity Period</span>
                    <span className="font-bold">{selectedApp.scheme?.maturityPeriod} Months</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Min Daily Deposit</span>
                    <span className="font-bold">₹{selectedApp.scheme?.minAmount?.toLocaleString() || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pending Instalments</span>
                    <span className="font-bold">
                      {(() => {
                        const paidInst = selectedApp.payments?.filter((p: any) => p.status === 'PAID').length || 0;
                        const totalInst = selectedApp.scheme?.maturityPeriod || 12;
                        return `${Math.max(0, totalInst - paidInst)} / ${totalInst}`;
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Maturity Date</span>
                    <span className="font-bold">
                      {selectedApp.maturityDate ? new Date(selectedApp.maturityDate).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#6b21a8]" /> Uploaded Identity Documents
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Aadhaar */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold text-xs text-[#1a1f36]">Aadhaar Card</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {selectedApp.member?.aadhaarNumber ? `XXXX XXXX ${String(selectedApp.member.aadhaarNumber).slice(-4)}` : "No Aadhaar Entered"}
                      </p>
                    </div>
                    {selectedApp.member?.aadhaarDocUrl ? (
                      <Button
                        onClick={() => window.open(getDocUrl(selectedApp.member.aadhaarDocUrl), '_blank', 'noopener,noreferrer')}
                        className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#1a1f36] hover:text-white rounded-lg text-[9px] font-black h-8 px-2.5 uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No File</span>
                    )}
                  </div>

                  {/* PAN */}
                  <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-bold text-xs text-[#1a1f36]">PAN Card</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {selectedApp.member?.panNumber || "No PAN Entered"}
                      </p>
                    </div>
                    {selectedApp.member?.panDocUrl ? (
                      <Button
                        onClick={() => window.open(getDocUrl(selectedApp.member.panDocUrl), '_blank', 'noopener,noreferrer')}
                        className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-[#1a1f36] hover:text-white rounded-lg text-[9px] font-black h-8 px-2.5 uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No File</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Assignment & Admin Actions */}
              {selectedApp.status === "PENDING" && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" /> Assign Agent & Remarks
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Collection Agent (Optional)</label>
                      <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                        <SelectTrigger className="w-full h-10 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Select collection agent to assign" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="none">No Agent / Manual</SelectItem>
                          {agents.map((ag: any) => (
                            <SelectItem key={ag.id} value={ag.id}>
                              {ag.name} ({ag.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Remarks / Reason</label>
                      <Input
                        placeholder="Add verification notes or rejection reasons..."
                        className="h-10 text-xs bg-white border-slate-200"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Display if not Pending */}
              {selectedApp.status !== "PENDING" && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-[#1a1f36]">
                  <span>Verification Status</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    selectedApp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {selectedApp.status === 'ACTIVE' ? 'APPROVED' : selectedApp.status}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Close
            </Button>
            {selectedApp && selectedApp.status === "PENDING" && (
              <>
                <Button
                  onClick={() => handleAction(selectedApp.id, "PENDING")}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs"
                >
                  <Clock className="w-4 h-4 mr-1.5" /> Place on Wait
                </Button>
                <Button
                  onClick={() => handleAction(selectedApp.id, "REJECTED")}
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Reject
                </Button>
                <Button
                  onClick={() => handleAction(selectedApp.id, "ACTIVE")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Verify & Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
        <DownloadPaymentHistoryModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          isAdmin={true}
          defaultProductType="PIGMY"
        />
      </Dialog>

      <Footer />
    </div>
  );
};

export default PigmyRequestsPage;
