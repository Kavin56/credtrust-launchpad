import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown, Landmark, PiggyBank, CircleDollarSign, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AccountsPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'deposits' ? 1 : 0;
  const [activeTabIndex, setActiveTabIndex] = useState(initialTab);
  
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
                  <h4 className="text-[13px] font-bold text-[#6b21a8] px-2 mb-4">Savings Account</h4>
                  <div className="bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] rounded-[24px] p-6 text-white shadow-xl shadow-purple-900/10 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group">
                      <div className="relative z-10 space-y-3">
                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">A/C Number</p>
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold font-sans">XXXXXXX6966</span>
                            <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                              <Eye className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                  </div>
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
                            <span className="text-[14px] font-bold font-sans tracking-widest">XXXXXXX6966</span>
                            <Eye className="w-4 h-4 opacity-70 cursor-pointer" />
                        </div>
                      </div>
                  </div>

                  {/* Sub Tabs */}
                  <div className="flex items-center border-b border-gray-100 max-w-full overflow-x-auto no-scrollbar">
                      {subTabs.map((tab, idx) => (
                        <button 
                          key={idx}
                          className={`px-6 py-4 text-[13px] font-bold transition-all whitespace-nowrap ${
                            idx === 0 ? "text-[#6b21a8] border-b-2 border-[#6b21a8]" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>

                  {/* Summary Grid */}
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
                          <p className="text-[15px] font-black text-[#1a1f36]">₹38,034.36</p>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Hold Amount</p>
                          <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                        </div>
                    </div>
                  </div>
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
                            <p className="text-4xl font-black">₹4,50,000</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Maturity Value</p>
                                   <p className="font-bold text-[#c9a84c]">₹4,88,125</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Active Accounts</p>
                                   <p className="font-bold">2 Deposits</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

                      <div className="space-y-4">
                         {[
                           { name: "Saranam Fixed Deposit", id: "FD-XXXXX882", balance: "₹4,00,000", alert: "Renew in 14m", icon: Landmark, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
                           { name: "Irumudi Recurring Plan", id: "RD-XXXXX991", balance: "₹50,000", alert: "5 Installments Left", icon: PiggyBank, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" }
                         ].map((dep, i) => (
                           <div key={i} className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl ${dep.iconBg} flex items-center justify-center ${dep.iconColor}`}>
                                    <dep.icon className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-[14px] font-bold text-[#1a1f36]">{dep.name}</h4>
                                    <p className="text-[11px] text-gray-400">{dep.id} | 8.25%</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                <div>
                                   <p className="text-[15px] font-black text-[#1a1f36]">{dep.balance}</p>
                                   <p className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase">{dep.alert}</p>
                                </div>
                                <Link to="/payments" className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-[#6b21a8] hover:bg-gray-50 tracking-widest">
                                   Re-invest
                                </Link>
                             </div>
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
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Oustanding Balance</p>
                            <p className="text-4xl font-black">₹1,24,000</p>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Next EMI Due</p>
                                   <p className="font-bold text-[#c9a84c]">05 April 2026</p>
                                </div>
                                <div>
                                   <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Total EMI Amount</p>
                                   <p className="font-bold text-emerald-400">₹8,450.00</p>
                                </div>
                            </div>
                          </div>
                          <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                      </div>

                      <div className="space-y-4">
                         {[
                           { name: "Swamy Gold Loan", id: "LN-GL-8821", amount: "₹84,000", emi: "₹4,200", status: "Active", color: "text-[#c9a84c]", bg: "bg-amber-50" },
                           { name: "Udaya Emergency Credit", id: "LN-EL-9902", amount: "₹40,000", emi: "₹4,250", status: "In Arrears", color: "text-rose-600", bg: "bg-rose-50" }
                         ].map((loan, i) => (
                           <div key={i} className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl ${loan.bg} flex items-center justify-center ${loan.color}`}>
                                    <CircleDollarSign className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-[14px] font-bold text-[#1a1f36]">{loan.name}</h4>
                                    <p className="text-[11px] text-gray-400">{loan.id} | EMI: {loan.emi}</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                 <div>
                                    <p className="text-[15px] font-black text-[#1a1f36]">{loan.amount}</p>
                                    <p className={`text-[10px] font-bold tracking-tighter uppercase ${loan.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{loan.status}</p>
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
             ) : (
                <div className="h-60 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 rounded-[40px] border border-gray-100 border-dashed">
                   <Landmark className="w-12 h-12 text-gray-300" />
                   <div>
                      <p className="text-[14px] font-bold text-gray-500">Feature Pending</p>
                      <p className="text-[11px] text-gray-400">Application for {accountTabs[activeTabIndex]} will be available soon.</p>
                   </div>
                </div>
             )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountsPage;
