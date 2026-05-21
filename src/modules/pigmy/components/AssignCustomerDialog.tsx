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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Loader2, Search } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

export function AssignCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents");
      return data;
    },
    enabled: open,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["admin-assign-accounts", search],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents/accounts", {
        params: search ? { q: search } : {},
      });
      return data;
    },
    enabled: open,
  });

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAssign = async () => {
    if (!agentId || selected.length === 0) {
      toast.error("Select an agent and at least one account");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/admin/agents/assign-customers", {
        agentId,
        accountIds: selected,
      });
      toast.success(`Assigned ${data.assignedCount} account(s)`);
      setSelected([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pigmy-collections-recent"] });
      queryClient.invalidateQueries({ queryKey: ["agent-customers"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white text-[#1a1f36] border-gray-200 gap-2 font-bold h-11 rounded-xl"
        >
          <Users className="h-4 w-4" /> Assign Customers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1a1f36]">Assign Pigmy customers to agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.fullName} ({a.username}) — {a.agentCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Search account or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="border rounded-xl divide-y max-h-48 overflow-y-auto">
            {accountsLoading ? (
              <p className="p-4 text-sm text-slate-400">Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No accounts found</p>
            ) : (
              accounts.map((acc: any) => (
                <label
                  key={acc.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.includes(acc.id)}
                    onCheckedChange={() => toggle(acc.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-[#1a1f36] truncate">
                      {acc.member?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {acc.accountNumber} · {acc.scheme?.name}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          <Button
            onClick={handleAssign}
            disabled={loading}
            className="w-full bg-[#1a1f36] text-white font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign selected"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
