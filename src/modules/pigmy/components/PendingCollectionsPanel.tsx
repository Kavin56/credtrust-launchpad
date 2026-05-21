import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/modules/login/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PendingCollectionsPanel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [actingId, setActingId] = useState<string | null>(null);
  const [updatingAgentId, setUpdatingAgentId] = useState<string | null>(null);

  const isAdmin = user && ["ADMIN", "CEO"].includes(user.role);

  React.useEffect(() => {
    console.log("PendingCollectionsPanel version 103 mounted. User:", user?.email, "Role:", user?.role, "isAdmin:", isAdmin);
  }, [user, isAdmin]);

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["pigmy-pending-collections"],
    queryFn: async () => {
      const { data } = await api.get("/pigmy/collections/pending");
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data } = await api.get("/admin/agents");
      return data;
    },
    enabled: !!isAdmin,
  });

  const updateStatus = async (id: string, status: "COMPLETED" | "REJECTED") => {
    setActingId(id);
    try {
      await api.patch(`/pigmy/collections/${id}/status`, { status });
      toast.success(status === "COMPLETED" ? "Payment approved" : "Payment rejected");
      queryClient.invalidateQueries({ queryKey: ["pigmy-pending-collections"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-collections-recent"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-pigmy-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const handleAssignAgent = async (collectionId: string, agentId: string) => {
    setUpdatingAgentId(collectionId);
    try {
      await api.patch(`/pigmy/collections/${collectionId}/status`, {
        status: "PENDING",
        agentId: agentId === "none" ? "none" : agentId,
      });
      toast.success("Agent assigned to transaction");
      queryClient.invalidateQueries({ queryKey: ["pigmy-pending-collections"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-collections-recent"] });
      queryClient.invalidateQueries({ queryKey: ["pigmy-stats"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign agent");
    } finally {
      setUpdatingAgentId(null);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg flex items-center gap-2 text-[#1a1f36]">
          <Clock className="h-5 w-5 text-amber-500" />
          Pending online payments
          <Badge variant="secondary" className="ml-2">
            {pending.length}
          </Badge>
        </CardTitle>
        <p className="text-xs text-gray-500">
          Approve UPI/online deposits. Admins can approve any account; agents only assigned customers.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : pending.length === 0 ? (
          <p className="p-8 text-sm text-slate-500 text-center">No pending payments</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map((row: any) => {
                const currentAgentId = row.agentId || row.account?.agentId || "none";
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-bold">
                      {row.account?.accountNumber}
                    </TableCell>
                    <TableCell>{row.account?.member?.fullName || "—"}</TableCell>
                    <TableCell className="font-bold">₹{row.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.method}</Badge>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={currentAgentId}
                            onValueChange={(val) => handleAssignAgent(row.id, val)}
                            disabled={updatingAgentId === row.id}
                          >
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-white text-[#1a1f36] border-gray-200">
                              <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Unassigned</SelectItem>
                              {agents.map((agent: any) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.fullName} ({agent.agentCode})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {updatingAgentId === row.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">You</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 h-8"
                        disabled={actingId === row.id}
                        onClick={() => updateStatus(row.id, "COMPLETED")}
                      >
                        {actingId === row.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-600 border-red-200"
                        disabled={actingId === row.id}
                        onClick={() => updateStatus(row.id, "REJECTED")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
