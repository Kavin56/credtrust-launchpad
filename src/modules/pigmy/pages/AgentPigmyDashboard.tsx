import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  HandCoins, Users, TrendingUp, Download, Play, 
  CheckCircle2, Search, Printer, History, RefreshCw, MapPin, Loader2
} from 'lucide-react';
import { PigmyStats } from '../components/PigmyStats';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/modules/login/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { PendingCollectionsPanel } from '../components/PendingCollectionsPanel';

const AgentPigmyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-pigmy-stats'],
    queryFn: async () => {
      const res = await api.get('/pigmy/stats');
      return res.data;
    }
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['agent-customers'],
    queryFn: async () => {
      const res = await api.get('/pigmy/agent/customers');
      return res.data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = selectedAccountId || customers?.find((c: any) => c.accountNumber === searchId)?.id;
    if (!accountId || !collectAmount) {
      toast.error("Please select a customer and enter amount");
      return;
    }
    setLoading(true);
    try {
      await api.post('/pigmy/collection', {
        accountId,
        amount: Number(collectAmount),
        method: 'CASH',
        remarks: 'Agent Collection'
      });

      const account = customers?.find((c: any) => c.id === accountId);
      toast.success("Collection Recorded", {
        description: account ? `Cash recorded for ${account.member?.fullName}.` : undefined,
      });
      setCollectAmount('');
      setSearchId('');
      setSelectedAccountId('');
      queryClient.invalidateQueries(['agent-pigmy-stats']);
      queryClient.invalidateQueries(['agent-customers']);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 bg-[#1a1f36] text-white border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#c9a84c] uppercase tracking-widest">Agent Portal</p>
            <p className="text-sm font-bold">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pigmy" className="text-xs font-bold text-white/60 hover:text-white">Pigmy home</Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 gap-2"
              onClick={() => { logout(); navigate('/agent/login'); }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agent Dashboard</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Assigned customers & collections</p>
        </div>
      </div>

      <PendingCollectionsPanel />

      {!statsLoading && stats ? (
        <PigmyStats 
          totalDeposits={stats.totalDeposits} 
          totalWithdrawals={stats.totalWithdrawals}
          activeAccounts={stats.activeAccounts} 
          todayCollections={stats.todayCollections} 
          maturityAccounts={stats.maturityAccounts}
          activeAgents={1}
          pendingCollections={stats.pendingCollections}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-sm" />)}
        </div>
      )}

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
                          <Input 
                            placeholder="Enter Unique ID or Name" 
                            className="pl-10" 
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-slate-400">Amount Collected (₹)</Label>
                       <Input 
                        type="number" 
                        placeholder="100" 
                        required 
                        value={collectAmount}
                        onChange={(e) => setCollectAmount(e.target.value)}
                       />
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
                       {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Submit Collection"}
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
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {customersLoading ? "Loading customers..." : `Showing ${customers?.length || 0} customers on your route`}
                    </p>
                 </div>
                 <Button variant="ghost" className="text-blue-600 text-xs font-bold">View All Customers</Button>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Unique ID</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Customer Name</TableHead>
                          <TableHead className="text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Scheme</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {!customersLoading && customers && customers.map((c: any) => (
                          <TableRow key={c.id}>
                             <TableCell className="font-bold text-xs">{c.accountNumber}</TableCell>
                             <TableCell className="font-bold">{c.member?.fullName}</TableCell>
                             <TableCell>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                   ACTIVE
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right font-bold text-xs">{c.scheme?.name}</TableCell>
                             <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="default" 
                                  className="bg-blue-600"
                                  onClick={() => {
                                    setSearchId(c.accountNumber);
                                    setSelectedAccountId(c.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                   Collect Now
                                </Button>
                             </TableCell>
                          </TableRow>
                       ))}
                       {customersLoading && [1,2,3].map(i => (
                         <TableRow key={i} className="animate-pulse">
                            <TableCell colSpan={5} className="h-12 bg-slate-100" />
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AgentPigmyDashboard;
