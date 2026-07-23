import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, ArrowLeft, Plus, User, Phone, Shield, Trash2, CheckCircle2, XCircle, KeyRound, Mail } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AgentManagementDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AgentManagementDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AgentManagementDialogProps = {}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;

  const [view, setView] = useState<"list" | "create">("list");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    agentCode: "",
    uniqueAgentKey: "",
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents");
      return data;
    },
    enabled: open,
  });

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.fullName) {
      toast.error("Username, password, and full name are required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/agents", {
        username: form.username,
        email: form.email || undefined,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || undefined,
        agentCode: form.agentCode || undefined,
        uniqueAgentKey: form.uniqueAgentKey || undefined,
      });
      toast.success("Agent Registered (Pending Admin Approval)", {
        description: `Agent ${data.fullName} (${data.agentCode}) registered. Key: ${data.uniqueAgentKey}`,
      });
      setForm({ username: "", email: "", password: "", fullName: "", phone: "", agentCode: "", uniqueAgentKey: "" });
      setView("list");
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agentId: string, fullName: string) => {
    setActionId(agentId);
    try {
      await api.patch(`/admin/agents/${agentId}/approve`);
      toast.success(`Agent ${fullName} Approved`, {
        description: "Account status is now Active and login is enabled.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve agent");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (agentId: string, fullName: string) => {
    setActionId(agentId);
    try {
      await api.patch(`/admin/agents/${agentId}/reject`);
      toast.error(`Agent ${fullName} Rejected`);
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject agent");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (agentId: string, fullName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete agent "${fullName}"? This will unassign the agent from all accounts and pending transactions.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/agents/${agentId}`);
      toast.success("Agent deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete agent");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setView("list"); }}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="bg-[#1a1f36] hover:bg-black text-white gap-2 font-bold h-11 rounded-xl">
            <UserPlus className="h-4 w-4" /> Manage Agents
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl rounded-2xl p-6">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#c9a84c]" />
              {view === "list" ? "Collection Agents" : "Register Agent"}
            </DialogTitle>
            {view === "list" && (
              <Button
                size="sm"
                onClick={() => setView("create")}
                className="bg-[#c9a84c] hover:bg-[#b0923f] text-white gap-1 text-xs font-bold rounded-xl"
              >
                <Plus className="h-3 w-3" /> Register Agent
              </Button>
            )}
          </div>
        </DialogHeader>

        {view === "list" ? (
          <div className="py-4 space-y-4">
            {agentsLoading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : agents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <User className="h-12 w-12 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-400">No agents registered yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("create")}
                  className="text-xs font-bold border-gray-200 mt-2"
                >
                  Register your first agent
                </Button>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100 pr-1">
                {agents.map((agent: any) => {
                  const isPending = agent.status === "PENDING_APPROVAL" || agent.status === "Pending Approval";
                  const isRejected = agent.status === "REJECTED";
                  const isActive = agent.status === "ACTIVE";

                  return (
                    <div key={agent.id} className="py-3 flex justify-between items-center group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[#1a1f36]">{agent.fullName}</p>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            isPending ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {isActive ? "ACTIVE" : isPending ? "PENDING APPROVAL" : "REJECTED"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 font-medium">
                          <span>@{agent.username}</span>
                          {agent.email && <span>· {agent.email}</span>}
                          {agent.phone && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-0.5"><Phone className="h-3 w-3 inline" /> {agent.phone}</span>
                            </>
                          )}
                        </p>
                        <p className="text-[11px] text-amber-700 font-mono flex items-center gap-1">
                          <KeyRound className="h-3 w-3 inline text-amber-600" /> Key: <span className="font-bold">{agent.uniqueAgentKey}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-2.5 rounded-lg"
                              disabled={actionId === agent.id}
                              onClick={() => handleApprove(agent.id, agent.fullName)}
                            >
                              {actionId === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs font-bold h-8 px-2.5 rounded-lg"
                              disabled={actionId === agent.id}
                              onClick={() => handleReject(agent.id, agent.fullName)}
                            >
                              {actionId === agent.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
                              Reject
                            </Button>
                          </div>
                        )}

                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                            {agent.agentCode}
                          </span>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(agent.id, agent.fullName)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <button
              onClick={() => setView("list")}
              className="text-xs font-bold text-slate-400 hover:text-[#1a1f36] transition-colors flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-3 w-3" /> Back to agents list
            </button>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Username *</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="agent01"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Email (Optional)</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="agent@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Arun Kumar"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Phone (optional)</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Agent Code (optional)</Label>
                <Input
                  value={form.agentCode}
                  onChange={(e) => setForm({ ...form, agentCode: e.target.value.toUpperCase() })}
                  placeholder="AGT-0015"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Unique Key (optional)</Label>
                <Input
                  value={form.uniqueAgentKey}
                  onChange={(e) => setForm({ ...form, uniqueAgentKey: e.target.value })}
                  placeholder="KEY-123456"
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-black h-12 rounded-xl mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#c9a84c]" /> : "Submit Agent Registration"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
