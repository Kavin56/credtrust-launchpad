import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown, Landmark, PiggyBank, CircleDollarSign, Calculator, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AccountsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deposits' ? 1 : 0;
  const [activeTabIndex, setActiveTabIndex] = useState(initialTab);
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await api.get("/accounts/me");
      return data;
    },
  });
  const { data: deposits, isLoading: depLoading } = useQuery({
    queryKey: ["deposits"],
    queryFn: async () => {
      const { data } = await api.get("/deposits");
      return data;
    },
  });

  const { data: rdSchedules, isLoading: rdSchedulesLoading } = useQuery({
    queryKey: ["rd-schedules"],
    queryFn: async () => {
      const { data } = await api.get("/reports/rd-due"); // Assuming a new endpoint for RD dues
      return data;
    },
  });

  const { data: loans, isLoading: loanLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data } = await api.get("/loans");
      return data;
    },
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await api.get("/ledger/transactions/me");
      return data;
    },
  });

  const [activeSubTab, setActiveSubTab] = useState(0);

  // Update tab if URL param changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'deposits') setActiveTabIndex(1);
    else if (tab === 'loans') setActiveTabIndex(2);
    else if (tab === 'accounts') setActiveTabIndex(0);
  }, [searchParams]);

  const accountTabs = ["Transaction Accounts", "Deposits", "Loans", "Investments", "Insurance"];
  const subTabs = ["Account Summary", "Transactions", "Statements", "Spend Analysis"];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold text-[13px]">Relationship Overview</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-2 overflow-x-auto no-scrollbar">
           {accountTabs.map((tab, idx) => (
             <button 
               key={idx}
               onClick={() => setActiveTabIndex(idx)}
               className={`px-8 py-3.5 rounded-t-[20px] text-[14px] font-bold transition-all whitespace-nowrap min-w-[180px] ${
                 activeTabIndex === idx ? "bg-white text-[#6b21a8] border-t border-x border-gray-100 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.02)]" : "text-gray-400 hover:text-gray-600"
               }`}
             >
               {tab}
               {activeTabIndex === idx && <div className="h-0.5 w-[60px] bg-[#6b21a8] mx-auto mt-1" />}
             </button>
           ))}
        </div>

        <div className="bg-white rounded-b-[40px] rounded-tr-[40px] border border-gray-100 shadow-sm p-4 lg:p-8 flex flex-col lg:flex-row gap-10">
          {/* LEFT SIDEBAR */}
          <aside className="lg:w-[320px] space-y-8 flex-shrink-0">
             {/* Search Container */}
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#6b21a8] transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search here..." 
                   className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 pl-12 pr-6 text-[13px] font-medium outline-none focus:border-[#6b21a8] focus:bg-white transition-all shadow-inner"
                />
             </div>

             {activeTabIndex === 0 ? (
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-[#6b21a8] px-2 mb-4">Transaction Accounts</h4>
                  {accountsLoading && <Skeleton className="h-24 w-full" />}
                  {!accountsLoading && accounts?.map((acc: any) => (
                    <div key={acc.id} className="bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] rounded-[24px] p-6 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden group">
                        <div className="relative z-10 space-y-3">
                          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">A/C Number</p>
                          <div className="flex items-center gap-3">
                              <span className="text-[15px] font-bold font-sans">{acc.number}</span>
                              <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                                <Eye className="w-4 h-4" />
                              </button>
                          </div>
                          <p className="text-sm font-bold">Balance: ₹{Number(acc.balance).toLocaleString()}</p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                    </div>
                  ))}
                </div>
             ) : (
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-gray-500 px-2 mb-4">Quick Actions</h4>
                  <Link to="/deposit-apply" className="w-full flex items-center justify-between p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group hover:border-emerald-600 transition-all">
                      <span className="text-[13px] font-bold text-emerald-700">Open New Fixed Deposit</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/deposit-apply" className="w-full flex items-center justify-between p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 group hover:border-[#6b21a8] transition-all">
                      <span className="text-[13px] font-bold text-[#6b21a8]">Apply for Recurring Deposit</span>
                      <ChevronRight className="w-4 h-4 text-[#6b21a8] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             )}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-grow space-y-8">
             {activeTabIndex === 0 ? (
                <>
                  {/* Account Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                      <div className="bg-[#6b21a8] py-2.5 px-6 rounded-full inline-flex items-center gap-4 text-white shadow-lg shadow-purple-900/10">
                        <span className="text-[13px] font-bold uppercase tracking-widest whitespace-nowrap">SAVINGS A/C</span>
                        <div className="w-px h-3 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold font-sans tracking-widest">
                              {accounts?.[0]?.number || "—"}
                            </span>
                            <Eye className="w-4 h-4 opacity-70 cursor-pointer" />
                        </div>
                      </div>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex items-center border-b border-gray-100 max-w-full overflow-x-auto no-scrollbar">
                      {subTabs.map((tab, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSubTab(idx)}
                          className={`px-6 py-4 text-[13px] font-bold transition-all whitespace-nowrap ${
                            activeSubTab === idx ? "text-[#6b21a8] border-b-2 border-[#6b21a8]" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>

                  {activeSubTab === 0 && (
                    <div className="grid md:grid-cols-[1fr,320px] gap-10">
                      <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Description</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">LOTUS SAVING BANK-ADHAR- CHQ</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Currency</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">Rupees</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Rate of Interest</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">2.50%</p>
                            </div>
                          </div>

                          {/* Debit Card */}
                          <div className="pt-8 border-t border-gray-100">
                            <h4 className="text-[13px] font-bold text-[#1a1f36] mb-6">Associated Debit Card</h4>
                            <div className="w-[340px] h-[210px] bg-gradient-to-br from-[#4c1d95] via-[#2d0a4e] to-[#4c1d95] rounded-3xl p-6 text-white relative overflow-hidden group shadow-2xl shadow-purple-950/20">
                                <div className="relative z-10 flex flex-col h-full">
                                  <div className="flex justify-between items-start mb-10">
                                      <span className="text-[10px] uppercase font-bold tracking-tighter opacity-50">CREDTRUST</span>
                                      <span className="text-[14px] font-bold text-white/90">VISA</span>
                                  </div>
                                  <p className="text-[18px] font-bold tracking-[0.2em] font-mono mb-auto">XXXX XXXX XXXX 7615</p>
                                  <p className="text-[14px] font-bold uppercase tracking-wide">KAVINKUMAR V S</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            </div>
                          </div>
                      </div>

                      <div className="bg-[#f1f5f9] rounded-[32px] p-8 space-y-6 self-start border border-gray-100 h-fit">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Available Balance</p>
                            <p className="text-[15px] font-black text-[#1a1f36]">₹{accounts?.[0]?.balance ? Number(accounts[0].balance).toLocaleString() : "0.00"}</p>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Hold Amount</p>
                            <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                          </div>
                      </div>
                    </div>
                  )}
                  
                  {activeSubTab === 1 && (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                          <h3 className="text-[15px] font-bold text-[#1a1f36]">Recent Transactions</h3>
                          <button className="text-[12px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">Download Statement</button>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full">
                             <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                   <th className="px-6 py-3 text-left">Date</th>
                                   <th className="px-6 py-3 text-left">Description</th>
                                   <th className="px-6 py-3 text-left">Ref Type</th>
                                   <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {txLoading && <tr><td colSpan={4} className="p-6 text-center"><Skeleton className="h-10 w-full" /></td></tr>}
                                {!txLoading && transactions?.length === 0 && (
                                  <tr><td colSpan={4} className="p-6 text-center text-sm text-gray-400">No transactions found.</td></tr>
                                )}
                                {!txLoading && transactions?.map((tx: any) => {
                                  const isCredit = accounts?.some((a:any) => a.id === tx.crAccountId);
                                  return (
                                   <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-6 py-4 text-[12px] font-bold text-gray-500">{new Date(tx.txnDate).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 text-[12px] font-bold text-[#1a1f36]">{tx.narration}</td>
                                      <td className="px-6 py-4 text-[11px] font-bold text-gray-400">{tx.refType}</td>
                                      <td className={`px-6 py-4 text-[13px] font-black text-right ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                         {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                                      </td>
                                   </tr>
                                  );
                                })}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  )}
                  
                  {activeSubTab > 1 && (
                    <div className="p-8 text-center text-gray-400 text-sm">Select a different tab.</div>
                  )}
                </>
             ) : activeTabIndex === 1 ? (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1a1f36]">Active Deposits</h3>
                      <Link to="/deposit-apply" className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-[13px] font-bold hover:bg-[#2d3356] transition-all">
                         + Open New Deposit
                      </Link>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                          <div className="relative z-10 space-y-6">
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Invested (FD/RD)</p>
                            <p className="text-4xl font-black">₹{deposits?.reduce((s:number,d:any)=>s+Number(d.principal),0).toLocaleString()}</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Maturity Value</p>
                                   <p className="font-bold text-[#c9a84c]">₹—</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Active Accounts</p>
                                   <p className="font-bold">{deposits?.length || 0} Deposits</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown, Landmark, PiggyBank, CircleDollarSign, Calculator, PieChart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AccountsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deposits' ? 1 : 0;
  const [activeTabIndex, setActiveTabIndex] = useState(initialTab);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRdSchedule, setSelectedRdSchedule] = useState<any>(null);
  const [paymentAccountId, setPaymentAccountId] = useState<string>("");

  const queryClient = useQueryClient();

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await api.get("/accounts/me");
      return data;
    },
  });
  const { data: deposits, isLoading: depLoading } = useQuery({
    queryKey: ["deposits"],
    queryFn: async () => {
      const { data } = await api.get("/deposits");
      return data;
    },
  });

  const { data: rdSchedules, isLoading: rdSchedulesLoading } = useQuery({
    queryKey: ["rd-schedules"],
    queryFn: async () => {
      const { data } = await api.get("/reports/rd-due"); // Assuming a new endpoint for RD dues
      return data;
    },
  });

  const { data: loans, isLoading: loanLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data } = await api.get("/loans");
      return data;
    },
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await api.get("/ledger/transactions/me");
      return data;
    },
  });

  const payRdInstallmentMutation = useMutation({
    mutationFn: async (dto: { scheduleId: string; amount: number; paidOn: string; accountId: string }) => {
      const { data } = await api.post("/deposits/pay-installment", dto);
      return data;
    },
    onSuccess: () => {
      toast.success("RD Installment paid successfully!");
      queryClient.invalidateQueries({ queryKey: ["rd-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setShowPaymentModal(false);
      setSelectedRdSchedule(null);
      setPaymentAccountId("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to pay RD installment");
    },
  });

  const handlePayRdClick = (schedule: any) => {
    setSelectedRdSchedule(schedule);
    setShowPaymentModal(true);
  };

  const handleConfirmRdPayment = () => {
    if (!selectedRdSchedule || !paymentAccountId) {
      toast.error("Please select an account for payment.");
      return;
    }
    payRdInstallmentMutation.mutate({
      scheduleId: selectedRdSchedule.id,
      amount: Number(selectedRdSchedule.amount),
      paidOn: new Date().toISOString(),
      accountId: paymentAccountId,
    });
  };

  const [activeSubTab, setActiveSubTab] = useState(0);

  // Update tab if URL param changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'deposits') setActiveTabIndex(1);
    else if (tab === 'loans') setActiveTabIndex(2);
    else if (tab === 'accounts') setActiveTabIndex(0);
  }, [searchParams]);

  const accountTabs = ["Transaction Accounts", "Deposits", "Loans", "Investments", "Insurance"];
  const subTabs = ["Account Summary", "Transactions", "Statements", "Spend Analysis"];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold text-[13px]">Relationship Overview</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-2 overflow-x-auto no-scrollbar">
           {accountTabs.map((tab, idx) => (
             <button 
               key={idx}
               onClick={() => setActiveTabIndex(idx)}
               className={`px-8 py-3.5 rounded-t-[20px] text-[14px] font-bold transition-all whitespace-nowrap min-w-[180px] ${
                 activeTabIndex === idx ? "bg-white text-[#6b21a8] border-t border-x border-gray-100 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.02)]" : "text-gray-400 hover:text-gray-600"
               }`}
             >
               {tab}
               {activeTabIndex === idx && <div className="h-0.5 w-[60px] bg-[#6b21a8] mx-auto mt-1" />}
             </button>
           ))}
        </div>

        <div className="bg-white rounded-b-[40px] rounded-tr-[40px] border border-gray-100 shadow-sm p-4 lg:p-8 flex flex-col lg:flex-row gap-10">
          {/* LEFT SIDEBAR */}
          <aside className="lg:w-[320px] space-y-8 flex-shrink-0">
             {/* Search Container */}
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#6b21a8] transition-colors" />
                <input 
                   type="text" 
                   placeholder="Search here..." 
                   className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 pl-12 pr-6 text-[13px] font-medium outline-none focus:border-[#6b21a8] focus:bg-white transition-all shadow-inner"
                />
             </div>

             {activeTabIndex === 0 ? (
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-[#6b21a8] px-2 mb-4">Transaction Accounts</h4>
                  {accountsLoading && <Skeleton className="h-24 w-full" />}
                  {!accountsLoading && accounts?.map((acc: any) => (
                    <div key={acc.id} className="bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] rounded-[24px] p-6 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden group">
                        <div className="relative z-10 space-y-3">
                          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">A/C Number</p>
                          <div className="flex items-center gap-3">
                              <span className="text-[15px] font-bold font-sans">{acc.number}</span>
                              <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                                <Eye className="w-4 h-4" />
                              </button>
                          </div>
                          <p className="text-sm font-bold">Balance: ₹{Number(acc.balance).toLocaleString()}</p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                    </div>
                  ))}
                </div>
             ) : (
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-gray-500 px-2 mb-4">Quick Actions</h4>
                  <Link to="/deposit-apply" className="w-full flex items-center justify-between p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group hover:border-emerald-600 transition-all">
                      <span className="text-[13px] font-bold text-emerald-700">Open New Fixed Deposit</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/deposit-apply" className="w-full flex items-center justify-between p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 group hover:border-[#6b21a8] transition-all">
                      <span className="text-[13px] font-bold text-[#6b21a8]">Apply for Recurring Deposit</span>
                      <ChevronRight className="w-4 h-4 text-[#6b21a8] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
             )}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-grow space-y-8">
             {activeTabIndex === 0 ? (
                <>
                  {/* Account Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                      <div className="bg-[#6b21a8] py-2.5 px-6 rounded-full inline-flex items-center gap-4 text-white shadow-lg shadow-purple-900/10">
                        <span className="text-[13px] font-bold uppercase tracking-widest whitespace-nowrap">SAVINGS A/C</span>
                        <div className="w-px h-3 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold font-sans tracking-widest">
                              {accounts?.[0]?.number || "—"}
                            </span>
                            <Eye className="w-4 h-4 opacity-70 cursor-pointer" />
                        </div>
                      </div>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex items-center border-b border-gray-100 max-w-full overflow-x-auto no-scrollbar">
                      {subTabs.map((tab, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveSubTab(idx)}
                          className={`px-6 py-4 text-[13px] font-bold transition-all whitespace-nowrap ${
                            activeSubTab === idx ? "text-[#6b21a8] border-b-2 border-[#6b21a8]" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>

                  {activeSubTab === 0 && (
                    <div className="grid md:grid-cols-[1fr,320px] gap-10">
                      <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Description</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">LOTUS SAVING BANK-ADHAR- CHQ</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Currency</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">Rupees</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Rate of Interest</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">2.50%</p>
                            </div>
                          </div>

                          {/* Debit Card */}
                          <div className="pt-8 border-t border-gray-100">
                            <h4 className="text-[13px] font-bold text-[#1a1f36] mb-6">Associated Debit Card</h4>
                            <div className="w-[340px] h-[210px] bg-gradient-to-br from-[#4c1d95] via-[#2d0a4e] to-[#4c1d95] rounded-3xl p-6 text-white relative overflow-hidden group shadow-2xl shadow-purple-950/20">
                                <div className="relative z-10 flex flex-col h-full">
                                  <div className="flex justify-between items-start mb-10">
                                      <span className="text-[10px] uppercase font-bold tracking-tighter opacity-50">CREDTRUST</span>
                                      <span className="text-[14px] font-bold text-white/90">VISA</span>
                                  </div>
                                  <p className="text-[18px] font-bold tracking-[0.2em] font-mono mb-auto">XXXX XXXX XXXX 7615</p>
                                  <p className="text-[14px] font-bold uppercase tracking-wide">KAVINKUMAR V S</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            </div>
                          </div>
                      </div>

                      <div className="bg-[#f1f5f9] rounded-[32px] p-8 space-y-6 self-start border border-gray-100 h-fit">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Available Balance</p>
                            <p className="text-[15px] font-black text-[#1a1f36]">₹{accounts?.[0]?.balance ? Number(accounts[0].balance).toLocaleString() : "0.00"}</p>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Hold Amount</p>
                            <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                          </div>
                      </div>
                    </div>
                  )}
                  
                  {activeSubTab === 1 && (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                           <h3 className="text-[15px] font-bold text-[#1a1f36]">Recent Transactions</h3>
                           <button className="text-[12px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">Download Statement</button>
                       </div>
                       <div className="overflow-x-auto">
                           <table className="w-full">
                              <thead>
                                 <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Description</th>
                                    <th className="px-6 py-3 text-left">Ref Type</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                 {txLoading && <tr><td colSpan={4} className="p-6 text-center"><Skeleton className="h-10 w-full" /></td></tr>}
                                 {!txLoading && transactions?.length === 0 && (
                                   <tr><td colSpan={4} className="p-6 text-center text-sm text-gray-400">No transactions found.</td></tr>
                                 )}
                                 {!txLoading && transactions?.map((tx: any) => {
                                   const isCredit = accounts?.some((a:any) => a.id === tx.crAccountId);
                                   return (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                       <td className="px-6 py-4 text-[12px] font-bold text-gray-500">{new Date(tx.txnDate).toLocaleDateString()}</td>
                                       <td className="px-6 py-4 text-[12px] font-bold text-[#1a1f36]">{tx.narration}</td>
                                       <td className="px-6 py-4 text-[11px] font-bold text-gray-400">{tx.refType}</td>
                                       <td className={`px-6 py-4 text-[13px] font-black text-right ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {isCredit ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                                       </td>
                                    </tr>
                                   );
                                 })}
                              </tbody>
                           </table>
                       </div>
                    </div>
                  )}
                  
                  {activeSubTab > 1 && (
                    <div className="p-8 text-center text-gray-400 text-sm">Select a different tab.</div>
                  )}
                </>
             ) : activeTabIndex === 1 ? (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1a1f36]">Active Deposits</h3>
                      <Link to="/deposit-apply" className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-[13px] font-bold hover:bg-[#2d3356] transition-all">
                         + Open New Deposit
                      </Link>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                          <div className="relative z-10 space-y-6">
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Invested (FD/RD)</p>
                            <p className="text-4xl font-black">₹{deposits?.reduce((s:number,d:any)=>s+Number(d.principal),0).toLocaleString()}</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Maturity Value</p>
                                   <p className="font-bold text-[#c9a84c]">₹—</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Active Accounts</p>
                                   <p className="font-bold">{deposits?.length || 0} Deposits</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

                       <div className="space-y-4">
                          {depLoading && <Skeleton className="h-20 w-full" />}
                          {!depLoading && deposits?.length === 0 && <div className="text-gray-400 text-sm">No deposits yet.</div>}
                          {!depLoading && deposits?.map((dep:any) => (
                            <div key={dep.id} className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col gap-4 hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl ${dep.kind === 'FD' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center`}>
                                        <Landmark className="w-6 h-6" />
                                     </div>
                                     <div>
                                        <h4 className="text-[14px] font-bold text-[#1a1f36]">{dep.kind} Deposit</h4>
                                        <p className="text-[11px] text-gray-400">{dep.id.slice(0,8)} | {Number(dep.rate)}%</p>
                                     </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    <div>
                                       <p className="text-[15px] font-black text-[#1a1f36]">₹{Number(dep.principal).toLocaleString()}</p>
                                       <p className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase">{new Date(dep.maturityDate).toDateString()}</p>
                                    </div>
                                    {dep.kind === 'FD' && (
                                      <Link to="/payments" className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-[#6b21a8] hover:bg-gray-50 tracking-widest">
                                         Re-invest
                                      </Link>
                                    )}
                                 </div>
                               </div>
                               {dep.kind === 'RD' && (
                                 <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <h5 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Upcoming Installments</h5>
                                    {rdSchedulesLoading && <Skeleton className="h-16 w-full" />}
                                    {!rdSchedulesLoading && rdSchedules?.filter((s:any) => s.depositId === dep.id && !s.paid).length === 0 && (
                                      <p className="text-xs text-gray-400">No pending installments.</p>
                                    )}
                                    {!rdSchedulesLoading && rdSchedules?.filter((s:any) => s.depositId === dep.id && !s.paid).map((schedule:any) => (
                                      <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                         <div>
                                            <p className="text-[13px] font-bold text-[#1a1f36]">Installment Due</p>
                                            <p className="text-[11px] text-gray-400">{new Date(schedule.dueDate).toLocaleDateString()}</p>
                                         </div>
                                         <div className="flex items-center gap-3">
                                            <p className="text-[14px] font-black text-[#1a1f36]">₹{Number(schedule.amount).toLocaleString()}</p>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handlePayRdClick(schedule); }}
                                              className="px-4 py-2 bg-[#1a1f36] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors"
                                            >
                                               Pay Now
                                            </button>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              ) : activeTabIndex === 2 ? (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1a1f36]">Active Loans</h3>
                      <Link to="/loan-apply" className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-[13px] font-bold hover:bg-[#2d3356] transition-all">
                         + New Loan Application
                      </Link>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      {/* Summary Card */}
                      <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                          <div className="relative z-10 space-y-6">
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Outstanding Balance</p>
                            <p className="text-4xl font-black">₹{loans?.reduce((s:number,l:any)=>s+Number(l.principal),0).toLocaleString()}</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Next EMI Due</p>
                                   <p className="font-bold text-[#c9a84c]">{loans?.[0]?.nextDueDate ? new Date(loans[0].nextDueDate).toDateString() : "—"}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Total EMI Amount</p>
                                   <p className="font-bold text-emerald-400">₹{loans?.reduce((s:number,l:any)=>s+Number(l.emiAmount||0),0).toLocaleString()}</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

                      <div className="space-y-4">
                         {loanLoading && <Skeleton className="h-20 w-full" />}
                         {!loanLoading && loans?.length === 0 && <div className="text-gray-400 text-sm">No loans yet.</div>}
                         {!loanLoading && loans?.map((loan:any) => (
                           <div key={loan.id} className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-[#c9a84c]`}>
                                    <CircleDollarSign className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-[14px] font-bold text-[#1a1f36]">{loan.product}</h4>
                                    <p className="text-[11px] text-gray-400">{loan.id.slice(0,8)} | EMI: ₹{Number(loan.emiAmount||0).toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                 <div>
                                    <p className="text-[15px] font-black text-[#1a1f36]">₹{Number(loan.principal).toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold tracking-tighter uppercase ${loan.status === 'DISBURSED' ? 'text-emerald-600' : 'text-rose-600'}`}>{loan.status}</p>
                                 </div>
                                 <Link to="/payments" className="px-3 py-1 bg-[#1a1f36] text-white rounded-lg text-[9px] font-black uppercase hover:bg-black tracking-widest shadow-sm">
                                    Pay EMI
                                 </Link>
                              </div>
                           </div>
                         ))}
                       </div>
                   </div>

                   {/* Repayment Schedule Link */}
                   <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6b21a8]">
                            <Calculator className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[16px] font-bold text-[#1a1f36]">Interactive EMI Calculator</h4>
                            <p className="text-[12px] text-gray-400 max-w-xs">Plan your next borrowing with our real-time interest estimator.</p>
                         </div>
                      </div>
                      <Link to="/loan-apply" className="px-10 py-4 bg-white border-2 border-indigo-100 text-[#6b21a8] font-bold rounded-2xl hover:bg-indigo-50 transition-all text-[13px] shadow-sm">
                         Calculate Repayment
                      </Link>
                   </div>
                 </div>
                   ) : activeSubTab === 3 ? (
                     <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6b21a8]">
                                 <PieChart className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-[17px] font-bold text-[#1a1f36]">Spend Analysis</h3>
                                 <p className="text-[12px] text-gray-400">Categorized view of your recent expenditures</p>
                              </div>
                           </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                           <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                 <RechartsPieChart>
                                    <Pie
                                       data={[
                                         { name: 'Loan EMIs', value: 15000, color: '#6b21a8' },
                                         { name: 'Investments', value: 10000, color: '#10b981' },
                                         { name: 'Share Purchases', value: 5000, color: '#f59e0b' },
                                         { name: 'Transfers', value: 8000, color: '#3b82f6' },
                                       ]}
                                       cx="50%"
                                       cy="50%"
                                       innerRadius={80}
                                       outerRadius={110}
                                       paddingAngle={5}
                                       dataKey="value"
                                    >
                                       {[
                                         { name: 'Loan EMIs', value: 15000, color: '#6b21a8' },
                                         { name: 'Investments', value: 10000, color: '#10b981' },
                                         { name: 'Share Purchases', value: 5000, color: '#f59e0b' },
                                         { name: 'Transfers', value: 8000, color: '#3b82f6' },
                                       ].map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                       ))}
                                    </Pie>
                                    <Tooltip 
                                       formatter={(value: number) => `₹${value.toLocaleString()}`}
                                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                 </RechartsPieChart>
                              </ResponsiveContainer>
                           </div>
                           
                           <div className="space-y-4">
                              {[
                                 { name: 'Loan EMIs', value: 15000, color: 'bg-[#6b21a8]', percent: '39%' },
                                 { name: 'Investments', value: 10000, color: 'bg-emerald-500', percent: '26%' },
                                 { name: 'Transfers', value: 8000, color: 'bg-blue-500', percent: '21%' },
                                 { name: 'Share Purchases', value: 5000, color: 'bg-amber-500', percent: '14%' },
                              ].map((cat, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                                       <span className="text-[13px] font-bold text-[#1a1f36]">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[14px] font-black text-[#1a1f36]">₹{cat.value.toLocaleString()}</p>
                                       <p className="text-[10px] font-bold text-gray-400">{cat.percent}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="p-8 text-center text-gray-400 text-sm">Select a different tab.</div>
                   )}
           </main>
         </div>
       </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px] p-0 rounded-[40px] overflow-hidden">
          <DialogHeader className="bg-[#1a1f36] text-white p-8 rounded-t-[30px]">
            <DialogTitle className="text-2xl font-bold">Confirm RD Payment</DialogTitle>
            <DialogDescription className="text-white/70 text-sm">
              You are about to pay ₹{Number(selectedRdSchedule?.amount).toLocaleString()} for your RD installment.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paymentAccount" className="text-[12px] font-bold uppercase tracking-widest text-gray-500">Pay From Account</Label>
              <select
                id="paymentAccount"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6b21a8]"
                value={paymentAccountId}
                onChange={(e) => setPaymentAccountId(e.target.value)}
              >
                <option value="">Select an account</option>
                {accounts?.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type} - {acc.number} (Bal: ₹{Number(acc.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[13px] font-bold text-[#1a1f36]">Amount Due</span>
              <span className="text-[18px] font-black text-[#6b21a8]">₹{Number(selectedRdSchedule?.amount).toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter className="bg-gray-50/50 p-8 flex justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setShowPaymentModal(false)}
              className="h-12 px-6 font-bold text-gray-500 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRdPayment}
              disabled={payRdInstallmentMutation.isPending || !paymentAccountId}
              className="h-12 px-8 font-bold bg-[#1a1f36] text-white rounded-xl hover:bg-black shadow-lg shadow-black/10"
            >
              {payRdInstallmentMutation.isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Footer />
     </div>
   );
 };
 
 export default AccountsPage;
                   </div>
                </div>
             ) : activeTabIndex === 2 ? (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#1a1f36]">Active Loans</h3>
                      <Link to="/loan-apply" className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-[13px] font-bold hover:bg-[#2d3356] transition-all">
                         + New Loan Application
                      </Link>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      {/* Summary Card */}
                      <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                          <div className="relative z-10 space-y-6">
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Outstanding Balance</p>
                            <p className="text-4xl font-black">₹{loans?.reduce((s:number,l:any)=>s+Number(l.principal),0).toLocaleString()}</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Next EMI Due</p>
                                   <p className="font-bold text-[#c9a84c]">{loans?.[0]?.nextDueDate ? new Date(loans[0].nextDueDate).toDateString() : "—"}</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Total EMI Amount</p>
                                   <p className="font-bold text-emerald-400">₹{loans?.reduce((s:number,l:any)=>s+Number(l.emiAmount||0),0).toLocaleString()}</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

                      <div className="space-y-4">
                         {loanLoading && <Skeleton className="h-20 w-full" />}
                         {!loanLoading && loans?.length === 0 && <div className="text-gray-400 text-sm">No loans yet.</div>}
                         {!loanLoading && loans?.map((loan:any) => (
                           <div key={loan.id} className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-[#c9a84c]`}>
                                    <CircleDollarSign className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-[14px] font-bold text-[#1a1f36]">{loan.product}</h4>
                                    <p className="text-[11px] text-gray-400">{loan.id.slice(0,8)} | EMI: ₹{Number(loan.emiAmount||0).toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                 <div>
                                    <p className="text-[15px] font-black text-[#1a1f36]">₹{Number(loan.principal).toLocaleString()}</p>
                                    <p className={`text-[10px] font-bold tracking-tighter uppercase ${loan.status === 'DISBURSED' ? 'text-emerald-600' : 'text-rose-600'}`}>{loan.status}</p>
                                 </div>
                                 <Link to="/payments" className="px-3 py-1 bg-[#1a1f36] text-white rounded-lg text-[9px] font-black uppercase hover:bg-black tracking-widest shadow-sm">
                                    Pay EMI
                                 </Link>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Repayment Schedule Link */}
                   <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-[#6b21a8]">
                            <Calculator className="w-8 h-8" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[16px] font-bold text-[#1a1f36]">Interactive EMI Calculator</h4>
                            <p className="text-[12px] text-gray-400 max-w-xs">Plan your next borrowing with our real-time interest estimator.</p>
                         </div>
                      </div>
                      <Link to="/loan-apply" className="px-10 py-4 bg-white border-2 border-indigo-100 text-[#6b21a8] font-bold rounded-2xl hover:bg-indigo-50 transition-all text-[13px] shadow-sm">
                         Calculate Repayment
                      </Link>
                   </div>
                </div>
                  ) : activeSubTab === 3 ? (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-8">
                       <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#6b21a8]">
                                <PieChart className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-[17px] font-bold text-[#1a1f36]">Spend Analysis</h3>
                                <p className="text-[12px] text-gray-400">Categorized view of your recent expenditures</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-10 items-center">
                          <div className="h-[300px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                   <Pie
                                      data={[
                                        { name: 'Loan EMIs', value: 15000, color: '#6b21a8' },
                                        { name: 'Investments', value: 10000, color: '#10b981' },
                                        { name: 'Share Purchases', value: 5000, color: '#f59e0b' },
                                        { name: 'Transfers', value: 8000, color: '#3b82f6' },
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={80}
                                      outerRadius={110}
                                      paddingAngle={5}
                                      dataKey="value"
                                   >
                                      {[
                                        { name: 'Loan EMIs', value: 15000, color: '#6b21a8' },
                                        { name: 'Investments', value: 10000, color: '#10b981' },
                                        { name: 'Share Purchases', value: 5000, color: '#f59e0b' },
                                        { name: 'Transfers', value: 8000, color: '#3b82f6' },
                                      ].map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                   </Pie>
                                   <Tooltip 
                                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                   />
                                </RechartsPieChart>
                             </ResponsiveContainer>
                          </div>
                          
                          <div className="space-y-4">
                             {[
                                { name: 'Loan EMIs', value: 15000, color: 'bg-[#6b21a8]', percent: '39%' },
                                { name: 'Investments', value: 10000, color: 'bg-emerald-500', percent: '26%' },
                                { name: 'Transfers', value: 8000, color: 'bg-blue-500', percent: '21%' },
                                { name: 'Share Purchases', value: 5000, color: 'bg-amber-500', percent: '14%' },
                             ].map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                                      <span className="text-[13px] font-bold text-[#1a1f36]">{cat.name}</span>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[14px] font-black text-[#1a1f36]">₹{cat.value.toLocaleString()}</p>
                                      <p className="text-[10px] font-bold text-gray-400">{cat.percent}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">Select a different tab.</div>
                  )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountsPage;
