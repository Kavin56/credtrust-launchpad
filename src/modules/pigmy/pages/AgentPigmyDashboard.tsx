import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  HandCoins, Users, TrendingUp, Download, Play, 
  CheckCircle2, Search, Printer, History, RefreshCw, MapPin
} from 'lucide-react';
import { PigmyStats } from '../components/PigmyStats';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AgentPigmyDashboard = () => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Collection Recorded", {
        description: "Receipt #RCPT8821 generated. SMS sent to customer."
      });
      setLoading(false);
    }, 1000);
  };

  const assignedCustomers = [
    { id: 'PIGMY0001', name: 'Priya Murugan', status: 'PENDING', amount: 100, lastPaid: '2026-05-11' },
    { id: 'PIGMY0002', name: 'Ramesh R', status: 'PAID', amount: 500, lastPaid: '2026-05-12' },
    { id: 'PIGMY0003', name: 'Selvam K', status: 'PENDING', amount: 100, lastPaid: '2026-05-10' },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agent Dashboard</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Collection Mode: Active</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="gap-2 border-slate-200 font-bold">
              <Download className="h-4 w-4" /> Download Report
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 gap-2 font-bold shadow-lg shadow-blue-100">
              <Play className="h-4 w-4" /> Start Collection
           </Button>
        </div>
      </div>

      <PigmyStats 
        totalDeposits={125000} 
        totalWithdrawals={0}
        activeAccounts={45} 
        todayCollections={3400} 
        maturityAccounts={2}
        activeAgents={1} // Just self
        pendingCollections={12}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection Form */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none shadow-xl">
              <CardHeader className="bg-blue-900 text-white rounded-t-2xl">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <HandCoins className="h-5 w-5 text-blue-300" /> Collect Payment
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-slate-400">Search Customer</Label>
                       <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input placeholder="Enter Unique ID or Name" className="pl-10" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-slate-400">Amount Collected (₹)</Label>
                       <Input type="number" placeholder="100" required />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                       <Button type="button" variant="outline" className="flex-1 gap-2 border-blue-200 bg-blue-50 text-xs font-bold">
                          Cash on Hand
                       </Button>
                       <Button type="button" variant="outline" className="flex-1 gap-2 opacity-50 cursor-not-allowed text-xs font-bold">
                          <RefreshCw className="h-3 w-3" /> Sync Offline
                       </Button>
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold text-lg" disabled={loading}>
                       Submit Collection
                    </Button>
                    <div className="flex gap-2">
                       <Button type="button" variant="ghost" className="flex-1 text-[10px] font-black uppercase text-slate-500 gap-1">
                          <Printer className="h-3 w-3" /> Print Receipt
                       </Button>
                       <Button type="button" variant="ghost" className="flex-1 text-[10px] font-black uppercase text-slate-500 gap-1">
                          <History className="h-3 w-3" /> Recent Receipts
                       </Button>
                    </div>
                 </form>
              </CardContent>
           </Card>

           <Card className="border-none shadow-lg bg-emerald-900 text-white">
              <CardContent className="p-6 space-y-4">
                 <div className="flex justify-between items-center">
                    <p className="text-xs font-black uppercase opacity-60">Daily Target Progress</p>
                    <TrendingUp className="h-4 w-4 opacity-60" />
                 </div>
                 <div className="text-3xl font-black">74%</div>
                 <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[74%]" />
                 </div>
                 <p className="text-[10px] opacity-60 font-medium">₹3,400 of ₹4,595 Target Achieved</p>
                 <Button variant="ghost" className="w-full bg-white/5 border-none hover:bg-white/10 text-white text-xs font-bold" onClick={() => toast.info("Performance Report Generated")}>
                    View Performance
                 </Button>
              </CardContent>
           </Card>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2">
           <Card className="border-none shadow-xl overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                 <div>
                    <CardTitle className="text-lg">Assigned Customers</CardTitle>
                    <p className="text-xs text-slate-500 font-medium mt-1">Showing 3 customers on your route</p>
                 </div>
                 <Button variant="ghost" className="text-blue-600 text-xs font-bold" onClick={() => navigate('/agent/customers')}>View All Customers</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Unique ID</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Customer Name</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Amount</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {assignedCustomers.map((c) => (
                          <TableRow key={c.id}>
                             <TableCell className="font-bold text-xs">{c.id}</TableCell>
                             <TableCell className="font-bold">{c.name}</TableCell>
                             <TableCell>
                                <Badge className={c.status === 'PAID' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                                   {c.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right font-black">₹{c.amount}</TableCell>
                             <TableCell className="text-right">
                                <Button size="sm" variant={c.status === 'PAID' ? "ghost" : "default"} className={c.status === 'PAID' ? "text-emerald-600" : "bg-blue-600"}>
                                   {c.status === 'PAID' ? "View Receipt" : "Collect Now"}
                                </Button>
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentPigmyDashboard;
