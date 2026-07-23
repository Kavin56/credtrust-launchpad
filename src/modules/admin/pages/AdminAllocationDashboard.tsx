import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, UserCheck, RefreshCw, ArrowLeft, Loader2, Sparkles, Settings2, 
  UserPlus, UserMinus, Eye, Search, CheckCircle2, ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AdminAllocationDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [ratioModalOpen, setRatioModalOpen] = useState(false);
  const [viewUsersModalOpen, setViewUsersModalOpen] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAgentForView, setSelectedAgentForView] = useState<any>(null);
  const [newRatioInput, setNewRatioInput] = useState<number>(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchAccount, setSearchAccount] = useState("");

  // Allocation Dashboard Data
  const { data: dashboardData, isLoading: dashboardLoading, refetch } = useQuery({
    queryKey: ["allocation-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents/allocation-dashboard");
      return data;
    },
  });

  // Unassigned Accounts
  const { data: unassignedAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["unassigned-accounts", searchAccount],
    queryFn: async () => {
      const { data } = await api.get(`/admin/agents/accounts?q=${encodeURIComponent(searchAccount)}`);
      return data.filter((acc: any) => !acc.agentId);
    },
    enabled: allocateModalOpen,
  });

  // Accounts for View Users
  const { data: assignedUsers = [], isLoading: assignedLoading } = useQuery({
    queryKey: ["assigned-users", selectedAgentForView?.id],
    queryFn: async () => {
      if (!selectedAgentForView) return [];
      const { data } = await api.get(`/admin/agents/accounts`);
      return data.filter((acc: any) => acc.agentId === selectedAgentForView.id);
    },
    enabled: !!selectedAgentForView && viewUsersModalOpen,
  });

  const handleAllocate = async () => {
    if (!selectedAccountId) {
      toast.error("Please select a Pigmy account to allocate");
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post("/admin/agents/allocate-user", {
        accountId: selectedAccountId,
        agentId: selectedAgentId || undefined,
      });
      toast.success("User Allocated Successfully", {
        description: `Assigned to ${res.data.agentName} (${res.data.agentCode})`,
      });
      setAllocateModalOpen(false);
      setSelectedAccountId("");
      setSelectedAgentId("");
      queryClient.invalidateQueries({ queryKey: ["allocation-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to allocate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRatio = async () => {
    if (!newRatioInput || newRatioInput < 1) {
      toast.error("Ratio must be at least 1");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch("/admin/agents/allocation-ratio", { ratio: Number(newRatioInput) });
      toast.success(`Allocation ratio updated to ${newRatioInput}:1`);
      setRatioModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["allocation-dashboard"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update ratio");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAllocation = async (accountId: string) => {
    if (!window.confirm("Are you sure you want to remove allocation for this user?")) return;
    try {
      await api.delete(`/admin/agents/allocation/${accountId}`);
      toast.success("Allocation removed");
      queryClient.invalidateQueries({ queryKey: ["allocation-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["assigned-users"] });
    } catch (err: any) {
      toast.error("Failed to remove allocation");
    }
  };

  const suggested = dashboardData?.suggestedAgent;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/admin/pigmy")}
              className="text-xs font-bold text-slate-400 hover:text-[#1a1f36] transition-colors flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Pigmy Management
            </button>
            <h1 className="text-3xl font-black text-[#1a1f36] tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-[#c9a84c]" />
              Pigmy User Allocation Dashboard
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Rotational Round-Robin Allocation System ({dashboardData?.ratio || 10}:1 Ratio)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setNewRatioInput(dashboardData?.ratio || 10);
                setRatioModalOpen(true);
              }}
              variant="outline"
              className="bg-white border-slate-200 text-slate-700 font-bold text-xs h-11 rounded-xl gap-2 shadow-sm"
            >
              <Settings2 className="h-4 w-4 text-slate-500" /> Configure Ratio ({dashboardData?.ratio || 10}:1)
            </Button>

            <Button
              onClick={() => {
                setSelectedAgentId(suggested?.id || "");
                setAllocateModalOpen(true);
              }}
              className="bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-black text-xs h-11 px-6 rounded-xl gap-2 shadow-lg shadow-indigo-950/20"
            >
              <UserPlus className="h-4 w-4" /> Allocate User
            </Button>
          </div>
        </div>

        {/* Suggested Agent Alert Banner */}
        {suggested && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/50 shadow-sm rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-800 tracking-wider">Next Recommended Agent (Round Robin)</span>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">Cycle #{suggested.cycle}</Badge>
                  </div>
                  <p className="text-lg font-extrabold text-[#1a1f36] mt-0.5">
                    {suggested.fullName} <span className="text-xs font-bold text-slate-400">({suggested.agentCode})</span>
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Currently assigned: <span className="font-bold text-slate-700">{suggested.currentAssignedCount}</span> users
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedAgentId(suggested.id);
                  setAllocateModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-5 rounded-xl gap-1.5"
              >
                Allocate to {suggested.fullName.split(' ')[0]}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Agents</p>
            <p className="text-3xl font-black text-[#1a1f36] mt-2">{dashboardData?.agents?.length || 0}</p>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Allocated Users</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{dashboardData?.totalAssigned || 0}</p>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Ratio</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{dashboardData?.ratio || 10} : 1</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Users per Agent per cycle</p>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Cycle</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">#{dashboardData?.currentCycle || 1}</p>
          </Card>
        </div>

        {/* Allocation Management Table */}
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <CardTitle className="text-lg font-bold text-[#1a1f36]">Agent Capacity & Allocation Overview</CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Showing capacity and user counts for all active collection agents
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="text-xs font-bold gap-1.5 h-9 rounded-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Agent Details</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Total Assigned</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Remaining Capacity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400">Capacity Status</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : !dashboardData?.agents || dashboardData.agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                      No active agents found. Please register and approve an agent first.
                    </TableCell>
                  </TableRow>
                ) : (
                  dashboardData.agents.map((agent: any) => {
                    const isSuggested = suggested?.id === agent.id;
                    const isFull = agent.status === "Full";

                    return (
                      <TableRow key={agent.id} className={isSuggested ? "bg-amber-50/40" : ""}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#1a1f36]">{agent.fullName}</span>
                              {isSuggested && (
                                <Badge className="bg-amber-500 text-white text-[9px] font-black">
                                  SUGGESTED NEXT
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                              @{agent.username} · <span className="font-mono text-amber-700 font-bold">{agent.agentCode}</span>
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-black text-sm text-slate-900">{agent.totalAssigned} Users</span>
                        </TableCell>

                        <TableCell>
                          <span className="font-bold text-xs text-slate-600">{agent.remainingCapacity} Slots</span>
                        </TableCell>

                        <TableCell>
                          <Badge className={isFull ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}>
                            {isFull ? "FULL" : "AVAILABLE"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-bold h-8 px-3 rounded-lg gap-1"
                              onClick={() => {
                                setSelectedAgentForView(agent);
                                setViewUsersModalOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" /> View Users
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#1a1f36] hover:bg-black text-[#c9a84c] text-xs font-bold h-8 px-3 rounded-lg gap-1"
                              onClick={() => {
                                setSelectedAgentId(agent.id);
                                setAllocateModalOpen(true);
                              }}
                            >
                              <UserPlus className="h-3.5 w-3.5" /> Allocate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Allocate User Modal */}
      <Dialog open={allocateModalOpen} onOpenChange={setAllocateModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-bold text-[#1a1f36] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#c9a84c]" /> Allocate Pigmy User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Search & Select Pigmy User</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filter unassigned accounts..."
                  className="pl-9 h-9 text-xs"
                  value={searchAccount}
                  onChange={(e) => setSearchAccount(e.target.value)}
                />
              </div>

              {accountsLoading ? (
                <div className="py-6 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" /></div>
              ) : unassignedAccounts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center">No unassigned Pigmy accounts found.</p>
              ) : (
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose an unassigned account..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {unassignedAccounts.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.member?.fullName} ({acc.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Select Agent</span>
                {suggested && selectedAgentId === suggested.id && (
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3 inline" /> Round-Robin Recommended
                  </span>
                )}
              </Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Auto-select Round Robin Agent" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardData?.agents?.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.fullName} ({agent.agentCode}) — {agent.totalAssigned} assigned
                      {suggested?.id === agent.id ? " (Recommended)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAllocate}
              disabled={actionLoading || !selectedAccountId}
              className="w-full bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-black h-11 rounded-xl mt-2"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#c9a84c]" /> : "Confirm Allocation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Assigned Users Modal */}
      <Dialog open={viewUsersModalOpen} onOpenChange={setViewUsersModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-bold text-[#1a1f36]">
              Assigned Pigmy Users — {selectedAgentForView?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
            {assignedLoading ? (
              <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" /></div>
            ) : assignedUsers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No Pigmy users assigned to this agent yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {assignedUsers.map((acc: any) => (
                  <div key={acc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#1a1f36]">{acc.member?.fullName}</p>
                      <p className="text-xs text-slate-400 font-mono">Acc: {acc.accountNumber} · Contact: {acc.member?.contact}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-8 gap-1"
                      onClick={() => handleRemoveAllocation(acc.id)}
                    >
                      <UserMinus className="h-3.5 w-3.5" /> Unassign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Ratio Modal */}
      <Dialog open={ratioModalOpen} onOpenChange={setRatioModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-bold text-[#1a1f36] flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#c9a84c]" /> Allocation Ratio Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Pigmy Users per Agent (Ratio)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newRatioInput}
                onChange={(e) => setNewRatioInput(Number(e.target.value))}
                placeholder="10"
                className="h-11"
              />
              <p className="text-[11px] text-slate-400 italic">
                Default ratio is 10:1 (10 Pigmy Users per 1 Agent). Updating this will adjust future Round-Robin allocations.
              </p>
            </div>

            <Button
              onClick={handleUpdateRatio}
              disabled={actionLoading}
              className="w-full bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-black h-11 rounded-xl"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#c9a84c]" /> : "Save Ratio Setting"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAllocationDashboard;
