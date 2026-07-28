import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PigmyQRCode } from '../components/PigmyQRCode';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, Calendar, Info, Download, CreditCard, 
  UserCircle, BarChart3, Receipt, Timer, Star, AlertCircle, RefreshCw, Sparkles
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PayNowDialog } from '../components/PayNowDialog';
import { EnrollPigmyModal } from '../components/EnrollPigmyModal';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CustomerPigmyDashboard = () => {
  const queryClient = useQueryClient();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>("");

  // 1. Fetch Profile to get Member ID & pigmy accounts
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['member-profile'],
    queryFn: async () => {
      const { data } = await api.get('/members/me');
      return data;
    }
  });

  // Automatically select the first account once profile is loaded
  React.useEffect(() => {
    if (profile?.pigmyAccounts?.length > 0 && !selectedAccountNumber) {
      setSelectedAccountNumber(profile.pigmyAccounts[0].accountNumber);
    }
  }, [profile, selectedAccountNumber]);

  // 2. Fetch Selected Pigmy Account details
  const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useQuery({
    queryKey: ['my-pigmy-account', selectedAccountNumber],
    queryFn: async () => {
      if (!selectedAccountNumber) return null;
      const { data } = await api.get(`/pigmy/account/${selectedAccountNumber}`);
      return data;
    },
    enabled: !!selectedAccountNumber
  });

  // 3. Fetch History (all collections)
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['my-pigmy-history'],
    queryFn: async () => {
      const { data } = await api.get('/pigmy/my-collections');
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    }
  });

  const handleRefresh = () => {
    refetchAccount();
    refetchHistory();
    queryClient.invalidateQueries({ queryKey: ['member-profile'] });
    toast.success("Dashboard data refreshed");
  };

  // Filter collections specifically for the selected account
  const accountCollections = useMemo(() => {
    const targetAccNum = selectedAccountNumber || profile?.pigmyAccounts?.[0]?.accountNumber;
    if (!targetAccNum || !Array.isArray(history)) return [];
    return history.filter((h: any) => h.account?.accountNumber === targetAccNum);
  }, [history, selectedAccountNumber, profile]);

  const completedTxns = useMemo(() => {
    return accountCollections.filter((h: any) => h.status === 'COMPLETED');
  }, [accountCollections]);

  const totalPaidAmount = useMemo(() => {
    const fromHistory = completedTxns.reduce((sum: number, h: any) => sum + (Number(h.amount) || 0), 0);
    return Math.max(fromHistory, Number(account?.balance || 0));
  }, [completedTxns, account]);

  const totalPaidCount = useMemo(() => {
    return Math.max(completedTxns.length, Number(account?.totalPaidDays || 0));
  }, [completedTxns, account]);

  const activeStreakDays = useMemo(() => {
    if (completedTxns.length === 0) return 0;
    const uniqueDates = new Set(
      completedTxns.map((h: any) => new Date(h.date).toISOString().split('T')[0])
    );
    return uniqueDates.size;
  }, [completedTxns]);

  const totalMonths = account?.scheme?.maturityPeriod || 12;
  const targetDays = totalMonths * 30;

  const progressPercent = useMemo(() => {
    if (targetDays === 0) return 0;
    return Math.min(Math.round((totalPaidCount / targetDays) * 100), 100);
  }, [totalPaidCount, targetDays]);

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">Loading your vault...</p>
      </div>
    );
  }

  const welcomeName = profile?.fullName || "User";
  const displayBalance = totalPaidAmount;
  const displayInterest = account?.interestEarned || 0;
  const displayAccountNumber = selectedAccountNumber || profile?.pigmyAccounts?.[0]?.accountNumber || "NOT_ASSIGNED";
  const schemeName = account?.scheme?.name || "Pigmy Savings Scheme";
  const schemeType = account?.scheme?.type || "DAILY";
  const interestRate = account?.scheme?.interestRate || 6.5;
  const interestPeriod = account?.scheme?.interestPeriod || 6;
  const maturityDateStr = account?.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "Jul 2027";
  const startDateStr = account?.startDate ? new Date(account.startDate).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full selection:bg-blue-200">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-3">
              <Star className="h-8 w-8 text-blue-600 fill-blue-600" /> My Pigmy Savings
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Hello, {welcomeName}</p>
            {profile?.pigmyAccounts?.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Account:</span>
                <select
                  value={selectedAccountNumber}
                  onChange={(e) => setSelectedAccountNumber(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1a1f36] shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {profile.pigmyAccounts.map((acc: any) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={handleRefresh} className="rounded-xl border-slate-200">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none gap-2 font-bold border-slate-200" onClick={() => toast.success("Statement requested. Check your email.")}>
              <Download className="h-4 w-4" /> View Statement
            </Button>
            {account || profile?.pigmyAccounts?.length ? (
              <PayNowDialog 
                accountId={account?.id || profile?.pigmyAccounts?.[0]?.id}
                customerName={welcomeName} 
                onSuccess={() => {
                  refetchHistory();
                  refetchAccount();
                  queryClient.invalidateQueries({ queryKey: ['member-profile'] });
                }} 
              />
            ) : (
              <Button 
                onClick={() => setIsEnrollModalOpen(true)}
                className="bg-[#fcd34d] hover:bg-[#fbbf24] text-[#1a1f36] font-black gap-2 rounded-2xl h-11 px-8 shadow-lg shadow-[#fcd34d]/20 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Start Saving Now
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <PigmyQRCode 
              accountNumber={displayAccountNumber} 
              customerName={welcomeName} 
            />
            
            <Card className="bg-blue-900 text-white border-none shadow-2xl shadow-blue-200 overflow-hidden relative rounded-[32px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase opacity-60 tracking-widest">Savings Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">₹{displayBalance.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-white/10 rounded-xl">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold">₹{displayInterest.toFixed(2)} earned so far</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Info className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheme Details</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-blue-900">{schemeName}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase">{schemeType} Collection</p>
              </div>
            </div>
          </div>

          {/* Right Main Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Deposit Progress Card */}
            <Card className="border-none shadow-xl rounded-[40px] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Deposit Progress</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</p>
                    <p className="text-lg font-black text-blue-600">{activeStreakDays} {activeStreakDays === 1 ? 'Day' : 'Days'} 🔥</p>
                  </div>
                  <Badge className="bg-blue-600 text-white border-none font-black text-sm px-3 py-1">{progressPercent}%</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="space-y-2 px-1">
                  <Progress value={progressPercent} className="h-4 bg-blue-50" />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Deposit Started: {startDateStr}</span>
                    <span>Target: {totalMonths} Months</span>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Total Paid Card */}
                  <div className="p-5 bg-slate-50 rounded-[32px] text-center border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-blue-900">₹{totalPaidAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{totalPaidCount} deposit(s)</p>
                  </div>

                  {/* Pending Card */}
                  <div className="p-5 bg-rose-50 rounded-[32px] text-center border border-rose-100">
                    <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest mb-1">Pending</p>
                    <p className="text-2xl font-black text-rose-600">
                      {history?.filter((h: any) => h.status === 'PENDING').length || 0}
                    </p>
                  </div>

                  {/* Method Card */}
                  <div className="p-5 bg-slate-50 rounded-[32px] text-center border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Method</p>
                    <p className="text-sm font-black text-slate-700 uppercase">{schemeType}</p>
                  </div>

                  {/* Maturity Card */}
                  <div className="p-5 bg-blue-900 rounded-[32px] text-center border border-blue-800 shadow-lg shadow-blue-100">
                    <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1">Maturity</p>
                    <p className="text-sm font-black text-white">{maturityDateStr}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-[32px] border border-amber-100 text-amber-800">
                  <div className="bg-amber-100 p-2 rounded-xl h-fit">
                    <Timer className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tight">Maturity Prediction Engine</h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                      Your interest is calculated at {interestRate}% every {interestPeriod} months.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Information & Pigmy Summary */}
            {account && (
              <Card className="border-none shadow-xl rounded-[40px] overflow-hidden p-6 space-y-6 bg-white">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Common Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Registered ID</p>
                      <p className="font-bold text-slate-900">{account.registeredId || "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Name</p>
                      <p className="font-bold text-slate-900">{welcomeName}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application ID</p>
                      <p className="font-bold text-slate-900">{account.accountNumber || "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Type</p>
                      <p className="font-bold text-slate-900">Pigmy Savings</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Status</p>
                      <p className="font-bold text-slate-900">{account.status || "PENDING"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Start Date</p>
                      <p className="font-bold text-slate-900">{account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">End Date</p>
                      <p className="font-bold text-slate-900">{account.endDate ? new Date(account.endDate).toLocaleDateString('en-IN') : "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Payment Date</p>
                      <p className="font-bold text-slate-900">{account.monthlyPaymentDate || "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approval Date</p>
                      <p className="font-bold text-slate-900">{account.allocationDate ? new Date(account.allocationDate).toLocaleDateString('en-IN') : "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approved By</p>
                      <p className="font-bold text-slate-900">{account.status === 'ACTIVE' ? "Admin" : "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Pigmy Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Collection Type</p>
                      <p className="font-bold text-slate-900">{account.scheme?.type || "DAILY"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Collection Amount</p>
                      <p className="font-bold text-slate-900">₹{account.scheme?.minAmount || "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Documentation Charge (2.5%)</p>
                      <p className="font-bold text-red-600">₹{((account.scheme?.minAmount || 0) * 0.025).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Amount Collected</p>
                      <p className="font-bold text-slate-900">₹{totalPaidAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Remaining Balance</p>
                      <p className="font-bold text-slate-950">₹{Math.max(0, (account.scheme?.maxAmount || 0) - totalPaidAmount).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Collection Start Date</p>
                      <p className="font-bold text-slate-900">{account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Collection End Date</p>
                      <p className="font-bold text-slate-900">{account.endDate ? new Date(account.endDate).toLocaleDateString('en-IN') : "—"}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pending Instalments</p>
                      <p className="font-bold text-slate-900">{Math.max(0, (totalMonths || 12) - (totalPaidCount || 0))} / {totalMonths || 12}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Next Collection Date</p>
                      <p className="font-bold text-slate-900">
                        {account.monthlyPaymentDate 
                          ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, account.monthlyPaymentDate).toLocaleDateString('en-IN') 
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment History Card */}
            <Card className="border-none shadow-xl rounded-[40px] overflow-hidden">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-xl">
                    <Receipt className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-lg">Payment History</CardTitle>
                </div>
                <Button variant="ghost" className="text-blue-600 text-xs font-bold" onClick={() => toast.success("Export started")}>Export All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-8">Txn ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-8">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10">Loading history...</TableCell></TableRow>
                    ) : history?.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 font-bold text-slate-400">No transactions found</TableCell></TableRow>
                    ) : (
                      history?.map((item: any) => (
                        <TableRow key={item.id} className="group transition-colors">
                          <TableCell className="font-bold text-slate-400 pl-8">
                            <span className="text-[11px] font-black tracking-tighter text-blue-900/40">#</span>{item.transactionId ? item.transactionId.split('-').pop() : item.id.slice(-4)}
                          </TableCell>
                          <TableCell className="flex items-center gap-2 font-bold text-slate-600 pt-5 pb-5">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {new Date(item.date || item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-60">
                              {item.method === 'CASH' ? 'Cash Handover' : `UPI: ${item.upiId || 'Direct'}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                item.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                              }`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                item.status === 'COMPLETED' ? 'text-emerald-600' : 
                                item.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                              }`}>{item.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-black text-slate-900 pr-8">₹{item.amount}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      <Footer />
      
      <EnrollPigmyModal 
        open={isEnrollModalOpen}
        onOpenChange={setIsEnrollModalOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['member-profile'] });
          refetchAccount();
          refetchHistory();
        }}
        profile={profile}
      />
    </div>
  );
};

export default CustomerPigmyDashboard;
