import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PigmyStats } from '../components/PigmyStats';
import { PigmyCharts } from '../components/PigmyCharts';
import AdminNavbar from '@/components/AdminNavbar';
import { NewEntryDialog } from '../components/NewEntryDialog';
import { AgentManagementDialog } from '../components/AgentManagementDialog';
import { AssignCustomerDialog } from '../components/AssignCustomerDialog';
import { PendingCollectionsPanel } from '../components/PendingCollectionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Download, Search, Bell, Calendar, Filter, RefreshCw,
  UserPlus, ShieldCheck, Database, Landmark, ShieldAlert, Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const PigmyDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [agentDialogOpen, setAgentDialogOpen] = React.useState(false);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['pigmy-stats'],
    queryFn: async () => {
      const res = await api.get('/pigmy/stats');
      return res.data;
    }
  });

  const { data: recentCollections, isLoading: collectionsLoading } = useQuery({
    queryKey: ['pigmy-collections-recent'],
    queryFn: async () => {
      const res = await api.get('/pigmy/collections/recent?limit=10');
      return res.data;
    }
  });

  // Filter States
  const [filterPigmyId, setFilterPigmyId] = React.useState('');
  const [filterTimeframe, setFilterTimeframe] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('');

  // Filter Logic
  const filteredCollections = React.useMemo(() => {
    if (!recentCollections) return [];
    
    return recentCollections.filter((item: any) => {
      if (filterPigmyId && !item.account?.accountNumber?.toLowerCase().includes(filterPigmyId.toLowerCase())) {
        return false;
      }
      if (filterDate) {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (itemDate !== filterDate) return false;
      }
      if (filterTimeframe !== 'all') {
        const itemD = new Date(item.date);
        const now = new Date();
        
        if (filterTimeframe === 'today') {
           if (itemD.toDateString() !== now.toDateString()) return false;
        } else if (filterTimeframe === 'week') {
           const weekAgo = new Date();
           weekAgo.setDate(now.getDate() - 7);
           if (itemD < weekAgo) return false;
        } else if (filterTimeframe === 'month') {
           if (itemD.getMonth() !== now.getMonth() || itemD.getFullYear() !== now.getFullYear()) return false;
        } else if (filterTimeframe === 'year') {
           if (itemD.getFullYear() !== now.getFullYear()) return false;
        }
      }
      return true;
    });
  }, [recentCollections, filterPigmyId, filterDate, filterTimeframe]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-500/30">
      <AdminNavbar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em]">Admin Control</span>
            </div>
            <h1 className="text-4xl font-heading font-bold text-[#1a1f36] tracking-tight">Management Overview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <Button variant="outline" className="bg-[#1a1f36] hover:bg-black text-white border-none gap-2 text-sm font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-900/10" onClick={() => navigate('/admin/pigmy/maturity')}>
                  <ShieldAlert className="h-4 w-4" /> Approve Withdrawal
               </Button>
               <Button variant="outline" className="bg-[#c9a84c] hover:bg-[#b39543] text-[#1a1f36] border-none gap-2 text-sm font-bold h-11 px-6 rounded-xl shadow-lg shadow-yellow-900/10">
                  <Calculator className="h-4 w-4" /> Calculate Interest
               </Button>
               <Button variant="outline" className="bg-white hover:bg-gray-50 text-[#1a1f36] border-gray-200 gap-2 text-sm font-bold h-11 px-6 rounded-xl shadow-sm">
                  <Download className="h-4 w-4" /> Export
               </Button>
                <Button 
                  className="bg-[#1a1f36] hover:bg-black text-white gap-2 font-bold h-11 rounded-xl"
                  onClick={() => setAgentDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" /> Manage Agents
                </Button>
                <AgentManagementDialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen} />
               <AssignCustomerDialog />
               <NewEntryDialog />
            </div>

            <div className="flex items-center gap-2 ml-4">
               <button className="relative p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-[#1a1f36] transition-all shadow-sm">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
               <button className="p-1 bg-white border border-gray-200 rounded-full shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[#1a1f36] flex items-center justify-center text-xs font-black text-white">
                    AD
                  </div>
               </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by ID, Name or Phone..." 
                className="bg-gray-50 border-transparent pl-10 text-[#1a1f36] placeholder:text-gray-400 focus-visible:ring-[#1a1f36] h-10 rounded-xl"
              />
           </div>
           <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/admin/pigmy/add-customer')} className="bg-[#c9a84c] hover:bg-[#b0923f] text-white gap-2 text-xs font-bold rounded-xl h-10">
                <UserPlus className="h-4 w-4" /> Add Customer
              </Button>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-600 gap-2 text-xs font-bold rounded-xl h-10">
                <Landmark className="h-4 w-4" /> Manage Branch
              </Button>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-600 gap-2 text-xs font-bold rounded-xl h-10">
                <Database className="h-4 w-4" /> Backup Data
              </Button>
              <div className="h-8 w-px bg-gray-200 mx-2" />
              <Button variant="outline" className="bg-white border-gray-200 text-gray-600 gap-2 text-xs rounded-xl h-10">
                <Calendar className="h-4 w-4" /> {new Date().toDateString()}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200 text-gray-600 gap-2 text-xs rounded-xl h-10">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 space-y-4" align="end">
                  <h4 className="font-bold text-[#1a1f36]">Filter Collections</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Pigmy ID</label>
                    <Input 
                      placeholder="e.g. PIGMY001" 
                      value={filterPigmyId}
                      onChange={(e) => setFilterPigmyId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Timeframe</label>
                    <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Specific Date</label>
                    <Input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => {
                      setFilterPigmyId('');
                      setFilterTimeframe('all');
                      setFilterDate('');
                    }}
                  >
                    Reset Filters
                  </Button>
                </PopoverContent>
              </Popover>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-[#1a1f36] rounded-xl h-10 w-10">
                 <RefreshCw className="h-4 w-4" />
              </Button>
           </div>
        </div>

        {/* Stats Grid */}
        {!statsLoading && stats ? (
          <PigmyStats 
            totalDeposits={stats.totalDeposits || 0} 
            totalWithdrawals={stats.totalWithdrawals || 0}
            activeAccounts={stats.activeAccounts || 0} 
            todayCollections={stats.todayCollections || 0} 
            maturityAccounts={stats.maturityAccounts || 0}
            activeAgents={stats.activeAgents || 0}
            onActiveAgentsClick={() => setAgentDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
          </div>
        )}

        <PendingCollectionsPanel />

        {/* Charts Section */}
        <PigmyCharts />

        {/* Recent Transactions */}
        <Card className="bg-white border-gray-100 text-[#1a1f36] overflow-hidden shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white">
            <div>
               <CardTitle className="text-lg font-bold">Recent Collections</CardTitle>
               <p className="text-xs text-gray-500 mt-1 font-medium">Showing latest 10 transactions</p>
            </div>
            <Button variant="ghost" className="text-[#c9a84c] text-xs font-bold hover:bg-[#c9a84c]/10">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Customer</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Account ID</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Method</TableHead>
                  <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-gray-500 font-bold uppercase text-[10px] tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredCollections?.map((item: any) => (
                    <TableRow key={item.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="text-xs font-medium text-gray-600">
                         {new Date(item.date).toLocaleDateString()}
                         <div className="text-[9px] text-gray-400 font-mono mt-0.5">{item.transactionId.split('-').pop()}</div>
                      </TableCell>
                      <TableCell className="font-bold text-[#1a1f36]">
                         <div>{item.account?.member?.fullName || 'N/A'}</div>
                         {item.upiId && <div className="text-[10px] text-gray-400 font-medium">UPI: {item.upiId}</div>}
                      </TableCell>
                      <TableCell>
                         <code className="text-xs text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded-md font-bold">{item.account?.accountNumber}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[9px]">
                          {item.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full", 
                              item.status === 'COMPLETED' ? "bg-emerald-500" : 
                              item.status === 'REJECTED' ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                            )} />
                            <span className={cn(
                              "text-xs font-bold", 
                              item.status === 'COMPLETED' ? "text-emerald-600" : 
                              item.status === 'REJECTED' ? "text-rose-600" : "text-amber-600"
                            )}>
                              {item.status}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex flex-col items-end gap-1">
                            <span className="font-black text-[#1a1f36]">₹{item.amount.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">+ ₹{(item.amount * 0.015).toFixed(2)} (Interest)</span>
                            {item.status === 'PENDING' && (
                               <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold rounded-md"
                                    onClick={async () => {
                                       try {
                                          await api.patch(`/pigmy/collections/${item.id}/status`, { status: 'COMPLETED' });
                                          toast.success("Transaction Approved");
                                          queryClient.invalidateQueries({ queryKey: ['pigmy-collections-recent'] });
                                          queryClient.invalidateQueries({ queryKey: ['pigmy-stats'] });
                                       } catch (e) {
                                          toast.error("Approval failed");
                                       }
                                    }}
                                  >
                                     Approve
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold rounded-md"
                                    onClick={async () => {
                                       const reason = window.prompt("Reason for rejection:");
                                       if (reason === null) return;
                                       try {
                                          await api.patch(`/pigmy/collections/${item.id}/status`, { status: 'REJECTED', remarks: reason });
                                          toast.success("Transaction Rejected");
                                          queryClient.invalidateQueries({ queryKey: ['pigmy-collections-recent'] });
                                       } catch (e) {
                                          toast.error("Rejection failed");
                                       }
                                    }}
                                  >
                                     Reject
                                  </Button>
                               </div>
                            )}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {collectionsLoading && [1,2,3].map(i => (
                  <TableRow key={i} className="border-gray-50 animate-pulse">
                    <TableCell colSpan={6} className="h-12 bg-gray-50/50" />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PigmyDashboard;
