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
import { UserPlus, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function AgentManagementDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    agentCode: "",
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
        password: form.password,
        fullName: form.fullName,
        phone: form.phone || undefined,
        agentCode: form.agentCode || undefined,
      });
      toast.success("Agent created", {
        description: `${data.fullName} (${data.agentCode}) — login at /agent`,
      });
      setForm({ username: "", password: "", fullName: "", phone: "", agentCode: "" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1a1f36] hover:bg-black text-white gap-2 font-bold h-11 rounded-xl">
          <UserPlus className="h-4 w-4" /> Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#1a1f36]">New collection agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Username</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="agent01"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Full name</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Phone (optional)</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500">Agent code (optional)</Label>
            <Input
              value={form.agentCode}
              onChange={(e) => setForm({ ...form, agentCode: e.target.value.toUpperCase() })}
              placeholder="Auto-generated if empty"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-[#c9a84c] hover:bg-[#b0923f] text-[#1a1f36] font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save agent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
