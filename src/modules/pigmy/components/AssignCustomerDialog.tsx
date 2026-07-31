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
import { Users, Loader2, Search, UserCheck, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

export function AssignCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [search, setSearch] = useState("");
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: rawAgents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents");
      return data;
    },
    enabled: open,
  });

  const { data: rawAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["admin-assign-accounts", search],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents/accounts", {
        params: search ? { q: search } : {},
      });
      return data;
    },
    enabled: open,
  });

  const agents = Array.isArray(rawAgents) ? rawAgents : (rawAgents?.data || rawAgents?.items || []);
  const accounts = Array.isArray(rawAccounts) ? rawAccounts : (rawAccounts?.data || rawAccounts?.items || []);

  const filteredAccounts = accounts.filter((acc: any) => {
    if (showOnlyUnassigned && acc.agentId) return false;
    return true;
  });

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!agentId) {
      toast.error("Please select an agent from the dropdown first");
      return;
    }
    if (selected.length === 0) {
      toast.error("Select at least one customer account to assign");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/agents/assign-customers", {
        agentId,
        accountIds: selected,
      });
      toast.success(`Successfully assigned ${data.assignedCount} customer(s) to agent!`);
      setSelected([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pigmy-collections-recent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-assign-accounts"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Customer assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white text-[#1a1f36] border-gray-200 gap-2 font-bold h-11 rounded-xl shadow-sm hover:bg-slate-50"
        >
          <Users className="h-4 w-4 text-[#6b21a8]" /> Assign Customers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-white rounded-3xl p-6 max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" /> Assign Pigmy Customers to Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          
          {/* Agent Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Select Agent <span className="text-rose-500">*</span>
            </Label>
            {agentsLoading ? (
              <div className="p-3 text-xs text-slate-400 font-medium">Loading agents list...</div>
            ) : agents.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                No agents found. Please create an agent using "Manage Agents" button first.
              </div>
            ) : (
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-slate-50 text-[#1a1f36] font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#c9a84c] transition-all outline-none"
              >
                <option value="">-- Choose Pigmy Agent --</option>
                {agents.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName} ({a.username}) — Code: {a.agentCode}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Select Customers ({selected.length} selected)
              </Label>
              <button
                type="button"
                onClick={() => setShowOnlyUnassigned(!showOnlyUnassigned)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                  showOnlyUnassigned 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showOnlyUnassigned ? "Showing Unassigned Only" : "Showing All Customers"}
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10 h-11 rounded-xl border-gray-200 font-medium text-sm"
                placeholder="Search member name, ID, or contact number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Accounts Checklist */}
          <div className="border border-gray-200 rounded-2xl divide-y max-h-56 overflow-y-auto bg-slate-50">
            {accountsLoading ? (
              <div className="p-6 text-center text-sm text-slate-400 font-medium">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a1f36]" />
                Fetching customer list...
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <p className="text-sm font-bold text-slate-600">No customers found</p>
                <p className="text-xs text-slate-400">
                  {showOnlyUnassigned ? "All registered customers have already been assigned to an agent!" : "No registered members match your search."}
                </p>
              </div>
            ) : (
              filteredAccounts.map((acc: any) => {
                const isSelected = selected.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className={`flex items-center gap-3.5 p-3.5 hover:bg-white cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50/60' : ''
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(acc.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-[#1a1f36] truncate">
                          {acc.member?.fullName || "Unnamed Customer"}
                        </p>
                        {acc.agentId ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md">
                            Assigned
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{acc.accountNumber}</span> · Registered ID: {acc.member?.memberId || "N/A"}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Submit Action */}
          <Button
            onClick={handleAssign}
            disabled={loading || !agentId || selected.length === 0}
            className="w-full h-12 rounded-xl bg-[#1a1f36] hover:bg-black text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `Assign ${selected.length} Customer(s) to Selected Agent`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
