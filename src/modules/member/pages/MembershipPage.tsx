import React, { useState } from 'react';
import { 
  Award, 
  ChevronRight, 
  Home, 
  TrendingUp, 
  Download, 
  History, 
  Plus, 
  Gem, 
  BadgeCheck, 
  Landmark,
  PiggyBank,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const MembershipPage = () => {
  const queryClient = useQueryClient();
  const [unitsToBuy, setUnitsToBuy] = useState(10);
  const [selectedAccount, setSelectedAccount] = useState("");
  const sharePrice = 100;

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["member-overview"],
    queryFn: async () => {
      const { data } = await api.get("/members/me/overview");
      return data;
    },
  });

  const { data: shares, isLoading: isSharesLoading } = useQuery({
    queryKey: ["member-shares"],
    queryFn: async () => {
      const { data } = await api.get("/shares/me");
      return data;
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount) throw new Error("Please select an account to pay from");
      const { data } = await api.post("/shares/purchase", {
        units: unitsToBuy,
        accountId: selectedAccount,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Shares purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["member-shares"] });
      queryClient.invalidateQueries({ queryKey: ["member-overview"] });
      setUnitsToBuy(10);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to purchase shares");
    },
  });

  if (isOverviewLoading || isSharesLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header />
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const totalShares = shares?.reduce((sum: number, s: any) => sum + s.units, 0) || 0;
  const membershipId = overview?.member?.id || "Pending";
  const memberName = overview?.member?.name || "Member";
  const accounts = overview?.accounts || [];

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
          <span className="text-[#1a1f36] font-bold">Membership & Share Capital</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr,1.5fr] gap-10">
          
          {/* LEFT: Valuation & Purchase */}
          <div className="space-y-8">
            
            {/* Share Valuation Card */}
            <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-900/10">
               {/* Pattern overlay */}
               <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#c9a84c]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
               
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Shareholding Overview</span>
                     <Gem className="w-6 h-6 text-[#c9a84c]" />
                  </div>
                  
                  <div className="space-y-1">
                     <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">Total Share Capital</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-[42px] font-black tracking-tight">₹{(totalShares * sharePrice).toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                     <div className="space-y-1">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Total Shares</p>
                        <p className="text-[18px] font-bold">{totalShares} Units</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Member ID</p>
                        <p className="text-[18px] font-bold text-[#c9a84c]">{membershipId.split('-')[0]}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Purchase Shares Form */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                     <Plus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                     <h3 className="text-[17px] font-bold text-[#1a1f36]">Purchase Shares</h3>
                     <p className="text-[12px] text-gray-500">Increase your stake in the society</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Share Units</span>
                        <span className="text-[12px] font-bold text-[#6b21a8]">₹100 / Share</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setUnitsToBuy(Math.max(1, unitsToBuy - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl font-bold shadow-sm hover:bg-gray-50"
                        >-</button>
                        <div className="flex-grow text-center text-3xl font-black text-[#1a1f36]">
                           {unitsToBuy}
                        </div>
                        <button 
                          onClick={() => setUnitsToBuy(unitsToBuy + 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl font-bold shadow-sm hover:bg-gray-50"
                        >+</button>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Pay From Account</label>
                    <select 
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#6b21a8]"
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                      <option value="">Select an account</option>
                      {accounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.type} - {acc.number} (Bal: ₹{Number(acc.balance).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-2xl border border-purple-100/30">
                     <span className="text-[13px] font-bold text-[#1a1f36]">Estimated Value</span>
                     <span className="text-[18px] font-black text-[#6b21a8]">₹{(unitsToBuy * sharePrice).toLocaleString()}</span>
                  </div>

                  <Button 
                    onClick={() => purchaseMutation.mutate()}
                    disabled={purchaseMutation.isPending || !selectedAccount}
                    className="w-full bg-[#1a1f36] text-white rounded-2xl h-14 font-bold text-[15px] hover:bg-[#2d3356] transition-all disabled:opacity-50"
                  >
                     {purchaseMutation.isPending ? "Processing..." : "Confirm Purchase"}
                  </Button>
               </div>
            </div>
          </div>

          {/* RIGHT: Certificate & Ledger */}
          <div className="space-y-8">
            
            {/* Visual Share Certificate */}
            <div className="bg-white rounded-[40px] border-[12px] border-gray-50 p-1 lg:p-4 shadow-xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[#c9a84c]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               
               <div className="border border-[#c9a84c]/20 rounded-[28px] p-8 lg:p-12 relative overflow-hidden bg-white">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 p-8">
                     <Landmark className="w-12 h-12 text-[#c9a84c]/20" />
                  </div>

                  <div className="text-center space-y-8 relative z-10">
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#1a1f36] flex items-center justify-center shadow-lg">
                           <Award className="w-10 h-10 text-[#c9a84c]" />
                        </div>
                        <div className="space-y-1">
                           <h2 className="text-[12px] font-black text-[#1a1f36] uppercase tracking-[0.4em] leading-none">CredTrust</h2>
                           <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Cooperative Credit Society Ltd.</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <h3 className="text-[32px] font-serif font-black text-[#1a1f36] tracking-tight">CERTIFICATE OF MEMBERSHIPS</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-none">This is to certify that</p>
                     </div>

                     <div className="py-4 border-y border-[#c9a84c]/10">
                        <h4 className="text-[22px] font-bold text-[#1a1f36] tracking-wide uppercase">{memberName}</h4>
                     </div>

                     <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left max-w-md mx-auto">
                        <div className="space-y-0.5">
                           <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Member ID</p>
                           <p className="text-[13px] font-bold text-[#1a1f36] tracking-wider">{membershipId.split('-')[0]}</p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Date of Issue</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Shares Owned</p>
                           <p className="text-[13px] font-bold text-[#1a1f36]">{totalShares} units</p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[8px] text-gray-400 font-bold uppercase leading-none">Status</p>
                           <p className="text-[13px] font-bold text-emerald-600 flex items-center gap-1 inline-flex">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Active Member
                           </p>
                        </div>
                     </div>

                     <div className="flex justify-between items-center pt-8 max-w-md mx-auto">
                        <div className="text-center">
                           <div className="h-0.5 w-16 bg-[#1a1f36]/20 mx-auto mb-1" />
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Registrar</p>
                        </div>
                        <div className="text-center">
                           <div className="h-0.5 w-16 bg-[#1a1f36]/20 mx-auto mb-1" />
                           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Secretary</p>
                        </div>
                     </div>

                     <button className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 flex items-center gap-2 text-[11px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors p-2 bg-gray-50/50 rounded-xl">
                        <Download className="w-4 h-4" />
                        Download PDF
                     </button>
                  </div>
               </div>
            </div>

            {/* Share Ledger Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <History className="w-5 h-5 text-[#6b21a8]" />
                     </div>
                     <h3 className="text-[17px] font-bold text-[#1a1f36]">Share Ledger</h3>
                  </div>
                  <button className="text-[13px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">Export CSV</button>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest uppercase">
                           <th className="px-8 py-4 text-left">Date</th>
                           <th className="px-8 py-4 text-left">Certificate</th>
                           <th className="px-8 py-4 text-center">Shares</th>
                           <th className="px-8 py-4 text-right">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {shares?.map((share: any, idx: number) => (
                           <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-8 py-5 text-[13px] font-bold text-gray-500">{new Date(share.issuedAt).toLocaleDateString()}</td>
                              <td className="px-8 py-5 text-[13px] font-bold text-[#1a1f36]">{share.certificateNo}</td>
                              <td className="px-8 py-5 text-[13px] font-black text-center text-[#1a1f36]">{share.units}</td>
                              <td className="px-8 py-5 text-[13px] font-black text-right text-emerald-600">₹{(share.units * sharePrice).toLocaleString()}</td>
                           </tr>
                        ))}
                        {(!shares || shares.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-8 py-8 text-center text-gray-400 text-sm">No share purchases yet.</td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MembershipPage;
