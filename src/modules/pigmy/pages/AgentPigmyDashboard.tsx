import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  HandCoins, Users, TrendingUp, Download, Play, 
  CheckCircle2, XCircle, Search, Printer, History, RefreshCw, MapPin, Loader2,
  Bell, Calendar, Clock, Phone, ArrowUpDown, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { PigmyStats } from '../components/PigmyStats';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/modules/login/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const AgentPigmyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  // Table Filter, Search, Sorting, Pagination States
  const [customerSearch, setCustomerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const queryClient = useQueryClient();

  React.useEffect(() => {
    console.log("AgentPigmyDashboard with Agent Notifications & My Pigmy Users loaded");
  }, []);

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

  const { data: pendingCollections, isLoading: pendingLoading } = useQuery({
    queryKey: ['pigmy-pending-collections'],
    queryFn: async () => {
      const res = await api.get('/pigmy/collections/pending');
      return res.data;
    },
    refetchInterval: 30000,
  });

  // Agent Notifications Query
  const { data: agentNotifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['agent-notifications'],
    queryFn: async () => {
      const res = await api.get('/admin/agents/agent-notifications');
      return res.data;
    },
    refetchInterval: 15000,
  });

  const notifications = agentNotifData?.notifications || [];
  const unreadCount = agentNotifData?.unreadCount || 0;

  const markNotificationRead = async (id: string) => {
    try {
      await api.patch(`/admin/agents/agent-notifications/${id}/read`);
      refetchNotifs();
    } catch (e) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/admin/agents/agent-notifications/read-all');
      toast.success("All notifications marked as read");
      refetchNotifs();
    } catch (e) {
      toast.error("Failed to mark all as read");
    }
  };

  const updateStatus = async (collectionId: string, status: "COMPLETED" | "REJECTED") => {
    setActingId(collectionId);
    try {
      await api.patch(`/pigmy/collections/${collectionId}/status`, { status });
      toast.success(status === "COMPLETED" ? "Payment approved" : "Payment rejected");
      queryClient.invalidateQueries({ queryKey: ["pigmy-pending-collections"] });
      queryClient.invalidateQueries({ queryKey: ["agent-pigmy-stats"] });
      queryClient.invalidateQueries({ queryKey: ["agent-customers"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

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

  // Filtered & Sorted Pigmy Users for "My Pigmy Users" Section
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    let list = [...customers];

    if (customerSearch.trim()) {
      const q = customerSearch.trim().toLowerCase();
      list = list.filter((c: any) => 
        c.member?.fullName?.toLowerCase().includes(q) ||
        c.accountNumber?.toLowerCase().includes(q) ||
        c.member?.contact?.includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((c: any) => c.status === statusFilter);
    }

    list.sort((a: any, b: any) => {
      const dateA = new Date(a.allocationDate || a.createdAt).getTime();
      const dateB = new Date(b.allocationDate || b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [customers, customerSearch, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 bg-[#1a1f36] text-white border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#c9a84c] uppercase tracking-widest">Agent Portal</p>
            <p className="text-sm font-bold">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Agent Notification Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-[#1a1f36]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4 space-y-3" align="end">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-[#1a1f36] text-sm flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" /> Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 h-6">
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                  ) : (
                    notifications.map((notif: any) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                        className={`py-2.5 space-y-1 cursor-pointer transition-colors ${!notif.isRead ? "bg-amber-50/50 p-2 rounded-lg" : ""}`}
                      >
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{notif.message}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>{notif.day || ''} {notif.time || ''}</span>
                          <span className="text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

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

      {!statsLoading && stats ? (
        <PigmyStats 
          totalDeposits={stats.totalDeposits} 
          totalWithdrawals={stats.totalWithdrawals}
          activeAccounts={stats.activeAccounts} 
          todayCollections={stats.todayCollections} 
          maturityAccounts={stats.maturityAccounts}
          activeAgents={stats.activeAgents || 0}
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

        {/* Customer List & My Pigmy Users Section */}
        <div className="lg:col-span-2">
            <Card className="border-none shadow-xl overflow-hidden h-full">
               <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-white p-6">
                  <div>
                     <CardTitle className="text-lg font-bold text-[#1a1f36] flex items-center gap-2">
                       <Users className="h-5 w-5 text-[#c9a84c]" /> My Pigmy Users
                     </CardTitle>
                     <p className="text-xs text-slate-500 font-medium mt-1">
                       Showing {filteredCustomers.length} allocated Pigmy accounts
                     </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                     <div className="relative">
                       <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                       <Input
                         placeholder="Search User or Acc..."
                         className="pl-8 h-9 text-xs w-44 bg-slate-50"
                         value={customerSearch}
                         onChange={(e) => { setCustomerSearch(e.target.value); setCurrentPage(1); }}
                       />
                     </div>

                     <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                       <SelectTrigger className="h-9 text-xs w-28 bg-slate-50">
                         <SelectValue placeholder="Status" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">All Status</SelectItem>
                         <SelectItem value="ACTIVE">Active</SelectItem>
                         <SelectItem value="CLOSED">Closed</SelectItem>
                       </SelectContent>
                     </Select>

                     <Button
                       size="sm"
                       variant="outline"
                       className="h-9 px-2 text-xs font-bold bg-slate-50"
                       onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                     >
                       <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                     <TableHeader className="bg-slate-50/50">
                        <TableRow>
                           <TableHead className="text-[10px] font-black uppercase text-slate-400">User Name</TableHead>
                           <TableHead className="text-[10px] font-black uppercase text-slate-400">Pigmy Acc No</TableHead>
                           <TableHead className="text-[10px] font-black uppercase text-slate-400">Mobile No</TableHead>
                           <TableHead className="text-[10px] font-black uppercase text-slate-400">Assigned Date</TableHead>
                           <TableHead className="text-[10px] font-black uppercase text-slate-400">Status</TableHead>
                           <TableHead className="text-right text-[10px] font-black uppercase text-slate-400">Action</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {/* Pending Collections Banner Rows */}
                        {!pendingLoading && pendingCollections && pendingCollections.map((p: any) => (
                           <TableRow key={`pending-${p.id}`} className="bg-amber-50/50">
                              <TableCell className="font-bold text-xs">
                                 <div>{p.account?.member?.fullName}</div>
                                 <div className="text-[10px] text-amber-700 font-bold">Pending Online Approval</div>
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold">{p.account?.accountNumber}</TableCell>
                              <TableCell className="text-xs font-medium">{p.account?.member?.contact || 'N/A'}</TableCell>
                              <TableCell className="text-xs text-slate-500 font-medium">Pending</TableCell>
                              <TableCell>
                                 <Badge className="bg-amber-100 text-amber-700 font-bold text-[10px]">
                                    ₹{p.amount?.toLocaleString()} PENDING
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 h-7 text-[10px] font-bold px-2"
                                      disabled={actingId === p.id}
                                      onClick={() => updateStatus(p.id, "COMPLETED")}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-red-600 border-red-200 text-[10px] font-bold px-2 bg-white"
                                      disabled={actingId === p.id}
                                      onClick={() => updateStatus(p.id, "REJECTED")}
                                    >
                                      Reject
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))}

                        {/* Active Pigmy Users */}
                        {!customersLoading && paginatedCustomers.map((c: any) => (
                           <TableRow key={c.id}>
                              <TableCell className="font-bold text-sm text-[#1a1f36]">
                                {c.member?.fullName}
                              </TableCell>
                              <TableCell className="font-bold text-xs font-mono text-amber-700">
                                {c.accountNumber}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 font-medium">
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400 inline" /> {c.member?.contact || 'N/A'}</span>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500 font-medium">
                                {c.allocationDate ? new Date(c.allocationDate).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                 <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                                    {c.status || "ACTIVE"}
                                 </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button 
                                   size="sm" 
                                   variant="default" 
                                   className="bg-blue-600 hover:bg-blue-700 text-xs font-bold h-8 px-3"
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

                        {customersLoading && [1,2,3,4].map(i => (
                          <TableRow key={i} className="animate-pulse">
                             <TableCell colSpan={6} className="h-12 bg-slate-100" />
                          </TableRow>
                        ))}

                        {!customersLoading && paginatedCustomers.length === 0 && (
                           <TableRow>
                             <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium text-xs">
                               No Pigmy users assigned to you matching filters.
                             </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 text-xs">
                      <span className="text-slate-500 font-medium">
                        Page {currentPage} of {totalPages} ({filteredCustomers.length} total users)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AgentPigmyDashboard;
