import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AccountsPage = () => {
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
          <span className="text-[#1a1f36] font-bold">Relationship Overview</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-2 overflow-x-auto no-scrollbar">
           {accountTabs.map((tab, idx) => (
             <button 
               key={idx}
               className={`px-8 py-3.5 rounded-t-[20px] text-[14px] font-bold transition-all whitespace-nowrap min-w-[180px] ${
                 idx === 0 ? "bg-white text-[#6b21a8] border-t border-x border-gray-100 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.02)]" : "text-gray-400 hover:text-gray-600"
               }`}
             >
               {tab}
               {idx === 0 && <div className="h-0.5 w-[60px] bg-[#6b21a8] mx-auto mt-1" />}
             </button>
           ))}
        </div>

        <div className="bg-white rounded-b-[40px] rounded-tr-[40px] border border-gray-100 shadow-sm p-4 lg:p-8 flex flex-col lg:flex-row gap-10">
          {/* LEFT SIDEBAR (Compact Accounts List) */}
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

             {/* Savings Section */}
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
                
                <button className="w-full flex items-center justify-between p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 group hover:border-[#6b21a8] transition-all">
                   <span className="text-[13px] font-bold text-[#6b21a8]">Apply for a new Savings Account</span>
                   <ChevronRight className="w-4 h-4 text-[#6b21a8] group-hover:translate-x-1 transition-transform" />
                </button>
             </div>

             {/* Current Section */}
             <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-gray-500 px-2 mb-4">Current Account</h4>
                <button className="w-full flex items-center justify-between p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50 group hover:border-[#6b21a8] transition-all">
                   <span className="text-[13px] font-bold text-[#6b21a8]">Apply for a new Current Account</span>
                   <ChevronRight className="w-4 h-4 text-[#6b21a8] group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </aside>

          {/* MAIN ACCOUNT DETAIL (High Fidelity Summary) */}
          <main className="flex-grow space-y-8">
             {/* Account Details Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="bg-[#6b21a8] py-2.5 px-6 rounded-full inline-flex items-center gap-4 text-white shadow-lg shadow-purple-900/10">
                   <span className="text-[13px] font-bold uppercase tracking-widest whitespace-nowrap">SAVINGS A/C</span>
                   <div className="w-px h-3 bg-white/20" />
                   <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold font-sans tracking-widest">XXXXXXX6966</span>
                      <Eye className="w-4 h-4 opacity-70 cursor-pointer" />
                   </div>
                </div>
                <button className="flex items-center gap-2 text-[14px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors pr-4 group">
                   <Smartphone className="w-4 h-4" />
                   Manage Account
                   <ChevronRight className="w-4 h-4 text-[#6b21a8] group-hover:translate-x-1 transition-transform" />
                </button>
             </div>

             {/* Inner Tabs */}
             <div className="flex items-center border-b border-gray-100 mb-8 max-w-full overflow-x-auto no-scrollbar">
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

             {/* Summary Grid with Balance Breakdown */}
             <div className="grid md:grid-cols-[1fr,320px] gap-10">
                {/* Info List */}
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Description</p>
                         <p className="text-[13px] font-bold text-[#1a1f36] leading-tight pr-4">LOTUS SAVING BANK-ADHAR- CHQ</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Currency</p>
                         <p className="text-[13px] font-bold text-[#1a1f36]">Rupees</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Mode of Operation</p>
                         <p className="text-[13px] font-bold text-[#1a1f36]">Single</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Rate of Interest</p>
                         <p className="text-[13px] font-bold text-[#1a1f36]">2.50%</p>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Nominee(s)</p>
                         <button className="text-[13px] font-bold text-[#6b21a8] border-b border-dashed border-[#6b21a8]">View Details</button>
                      </div>
                   </div>

                   {/* Associated Debit Card (Visual Parity) */}
                   <div className="pt-8 border-t border-gray-100">
                      <h4 className="text-[13px] font-bold text-[#1a1f36] mb-6">Associated Debit Card</h4>
                      <div className="w-[340px] h-[210px] bg-gradient-to-br from-[#4c1d95] via-[#2d0a4e] to-[#4c1d95] rounded-3xl p-6 text-white relative overflow-hidden group shadow-2xl shadow-purple-950/20">
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                               <div className="flex flex-col gap-0.5 leading-none">
                                  <span className="text-[10px] uppercase font-bold tracking-tighter opacity-50">CREDTRUST</span>
                                  <span className="text-[18px] font-black tracking-tight italic">Net Banking</span>
                               </div>
                               <span className="text-[14px] font-bold text-white/90">VISA</span>
                            </div>
                            <div className="flex items-center gap-4 mb-auto">
                               <p className="text-[18px] font-bold tracking-[0.2em] font-mono">XXXX XXXX XXXX 7615</p>
                               <Eye className="w-5 h-5 opacity-40" />
                               <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center p-1 border border-white/5 cursor-pointer">
                                  <Smartphone className="w-full h-full" />
                               </div>
                            </div>
                            <div className="flex justify-between items-end">
                               <div className="space-y-0.5">
                                  <p className="text-[14px] font-bold uppercase tracking-wide">KAVINKUMAR V S</p>
                               </div>
                               <div className="flex gap-4">
                                  <div className="text-[8px] space-y-0.5">
                                     <p className="opacity-40 uppercase">Valid From</p>
                                     <p className="font-bold">02/24</p>
                                  </div>
                                  <div className="text-[8px] space-y-0.5">
                                     <p className="opacity-40 uppercase">Valid Thru</p>
                                     <p className="font-bold">01/31</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                         {/* Circle glassmorphism patterns */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                         <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                      </div>
                      <button className="mt-4 text-[13px] font-bold text-[#6b21a8] border-b border-[#6b21a8] hover:text-[#c9a84c] transition-all">Manage Debit Card</button>
                   </div>
                </div>

                {/* Right Balance Box (SBI Style) */}
                <div className="bg-[#f1f5f9] rounded-[32px] p-8 space-y-6 self-start border border-gray-100 h-fit">
                   <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Available Balance</p>
                      <p className="text-[15px] font-black text-[#1a1f36]">₹38,034.36</p>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Hold/Lien Amount</p>
                      <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Uncleared Balance</p>
                      <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                   </div>
                   <div className="flex justify-between items-center py-2">
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">MOD Balance</p>
                      <p className="text-[15px] font-black text-[#1a1f36]">₹0.00</p>
                   </div>
                </div>
             </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountsPage;
