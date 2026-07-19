import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown, Landmark, PiggyBank, CircleDollarSign, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

import { useAuth } from '@/modules/login/AuthContext';

const AccountsPage = () => {
  const { user } = useAuth();
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
  const { data: loans, isLoading: loanLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data } = await api.get("/loans");
      return data;
    },
  });
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["member-profile"],
    queryFn: async () => {
      const { data } = await api.get("/members/me");
      return data;
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/members/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success("Profile picture updated successfully!");
      refetchProfile();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
    const domain = base.replace(/\/api\/v1\/?$/, '');
    const separator = url.startsWith('/') ? '' : '/';
    return `${domain}${separator}${url}`;
  };

  const getCardName = () => {
    if (profile?.fullName) return profile.fullName;
    if (user?.email) {
      const prefix = user.email.split('@')[0];
      return prefix
        .replace(/[\._-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }
    return "MEMBER CANDIDATE";
  };
  
  // Update tab if URL param changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'deposits') setActiveTabIndex(1);
    else if (tab === 'loans') setActiveTabIndex(2);
    else if (tab === 'accounts') setActiveTabIndex(0);
  }, [searchParams]);

  const accountTabs = ["Transaction Accounts", "Deposits", "Loans"];
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
                          className={`px-6 py-4 text-[13px] font-bold transition-all whitespace-nowrap ${
                            idx === 0 ? "text-[#6b21a8] border-b-2 border-[#6b21a8]" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                  </div>

                  {/* Summary Grid */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="space-y-1.5">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Description</p>
                          <p className="text-[13px] font-bold text-[#1a1f36]">LOTUS SAVINGS SOCIETY-ADHAAR- CHQ</p>
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

                    {/* Government ID Card */}
                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[14px] font-bold text-[#1a1f36]">Society ID card</h4>
                        <button 
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="px-4 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold text-xs rounded-xl hover:bg-[#1E3A8A] hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Show {isFlipped ? "Front" : "Back"} Side
                        </button>
                      </div>
                      
                      <div className="flex flex-col items-center sm:items-start gap-4">
                        {!isFlipped ? (
                          /* FRONT SIDE */
                          <div className="w-full max-w-[480px] h-[300px] bg-white border-2 border-[#1E3A8A] rounded-lg p-4 flex flex-col justify-between font-sans relative shadow-md select-none text-[#1E3A8A] shrink-0">
                            {/* Header */}
                            <div className="text-center border-b border-[#1E3A8A] pb-2 mb-2">
                              <h5 className="font-extrabold text-[9.5px] uppercase tracking-wide leading-tight text-[#1E3A8A]">
                                SRI ROJA SHABARISH GURUJI SOUHARADA SAHAKARA NIYAMITHA
                              </h5>
                            </div>
                            
                            {/* Content area */}
                            <div className="flex gap-4 flex-1 my-1">
                              {/* Photo & QR Code Placeholder */}
                              <div className="flex flex-col gap-2 shrink-0 items-center justify-between py-0.5">
                                <div 
                                  onClick={handlePhotoClick}
                                  className="w-[85px] h-[100px] border-2 border-[#1E3A8A] flex flex-col items-center justify-center bg-gray-50 rounded shrink-0 overflow-hidden cursor-pointer hover:bg-gray-100/80 transition-all relative group"
                                >
                                  <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                  />
                                  {uploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                      <div className="w-5 h-5 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  )}
                                  {getPhotoUrl(profile?.photoUrl) ? (
                                    <img src={getPhotoUrl(profile.photoUrl)!} alt="Photo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                  ) : (
                                    <div className="text-center p-0.5">
                                      <span className="text-[7px] font-bold text-gray-400 block mb-0.5 leading-none">PHOTO</span>
                                      <span className="text-[9px] font-bold text-[#1E3A8A] leading-none">UPLOAD</span>
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] font-bold py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    Upload Photo
                                  </div>
                                </div>
                                
                                {/* Verification QR Code */}
                                <div className="border border-[#1E3A8A] p-0.5 bg-white rounded flex items-center justify-center">
                                  <QRCodeSVG value={profile?.memberId || "UID-NOT-VERIFIED"} size={42} fgColor="#1E3A8A" />
                                </div>
                              </div>
                              
                              {/* Form fields */}
                              <div className="flex-1 flex flex-col justify-between text-[8.5px] space-y-0.5 py-0.5">
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Name:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {getCardName()}
                                  </span>
                                </div>
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Role/Designation:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.designation || "......................................................."}
                                  </span>
                                </div>
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Dept/Organization:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.department || "......................................................."}
                                  </span>
                                </div>
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Contact Number:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.contact || "......................................................."}
                                  </span>
                                </div>
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Other Details:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.course || "......................................................."}
                                  </span>
                                </div>
                                <div className="flex items-end">
                                  <span className="font-bold shrink-0">Unique ID:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.seatBookingNumber || "......................................."}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bottom Section */}
                            <div className="flex justify-between items-end text-[8.5px] pt-1.5 border-t border-[#1E3A8A]/50">
                              <div>
                                <span className="font-bold">Year: </span>
                                <span className="font-semibold text-black">{new Date().getFullYear()}</span>
                              </div>
                              <div className="text-center flex flex-col items-center">
                                <div className="w-24 border-b border-dotted border-[#1E3A8A] h-3 mb-0.5"></div>
                                <span className="text-[7.5px] font-bold">Authorized Officer's Signature</span>
                              </div>
                              <div className="text-center flex flex-col items-center">
                                <div className="w-24 border-b border-dotted border-[#1E3A8A] h-3 mb-0.5"></div>
                                <span className="text-[7.5px] font-bold">Candidate's Signature</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* BACK SIDE */
                          <div className="w-full max-w-[480px] h-[300px] bg-white border-2 border-[#1E3A8A] rounded-lg p-4 flex flex-col justify-between font-sans relative shadow-md select-none text-[#1E3A8A] shrink-0">
                            <div className="flex gap-4 flex-1">
                              {/* Left Section: Terms */}
                              <div className="w-[180px] border-r border-[#1E3A8A] pr-3 flex flex-col">
                                <div className="bg-[#1E3A8A] text-white text-[9px] font-bold py-1 px-2 rounded mb-2 text-center uppercase tracking-wide">
                                  Terms & Conditions
                                </div>
                                <ol className="list-decimal pl-4 text-[7.5px] leading-tight space-y-1.5 font-medium text-gray-700">
                                  <li>This card is the property of the Society and must be returned upon cessation of membership.</li>
                                  <li>Members must produce this card for all transactions, meetings, and availing of benefits.</li>
                                  <li>Loss of this card should be reported immediately to the society administration.</li>
                                  <li>This card is non-transferable and any unauthorized use is subject to disciplinary action.</li>
                                </ol>
                              </div>
                              
                              {/* Right Section: Details */}
                              <div className="flex-1 pl-1 flex flex-col justify-between">
                                {/* Ref & Handshake */}
                                <div className="flex justify-between items-start">
                                  <div className="text-[8px] font-medium">
                                    Reference No.: <span className="font-bold text-black">{profile?.memberId || "........................"}</span>
                                  </div>
                                  {/* Handshake Icon */}
                                  <div className="w-6 h-6 text-[#1E3A8A] flex items-center justify-center opacity-85">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                      <path d="M11 12H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h8" />
                                      <path d="M18 8H10a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h8" />
                                      <path d="m16 4 4 4-4 4" />
                                      <path d="m8 20-4-4 4-4" />
                                    </svg>
                                  </div>
                                </div>
                                
                                {/* Center Headers */}
                                <div className="text-center space-y-0.5 my-0.5">
                                  <h6 className="font-extrabold text-[8.5px] uppercase tracking-tight leading-tight text-[#1E3A8A]">
                                    SRI ROJA SHABARISH GURUJI SOUHARADA SAHAKARA NIYAMITHA
                                  </h6>
                                  <p className="font-semibold text-[8px] text-[#c9a84c] uppercase tracking-wide">
                                    Identity Card Details
                                  </p>
                                </div>
                                
                                {/* Two-Column Details Grid */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[7.5px] py-1 text-gray-700 font-medium">
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">DOB:</span>{" "}
                                    <span className="text-black">{profile?.dob ? new Date(profile.dob).toLocaleDateString("en-IN") : "—"}</span>
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">Gender:</span>{" "}
                                    <span className="text-black">{profile?.gender || "—"}</span>
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">Blood Group:</span>{" "}
                                    <span className="text-black">{profile?.bloodGroup || "—"}</span>
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">Emergency:</span>{" "}
                                    <span className="text-black">{profile?.emergencyContact || "—"}</span>
                                  </div>
                                  <div className="col-span-2 truncate">
                                    <span className="font-bold text-[#1E3A8A]">Email:</span>{" "}
                                    <span className="text-black">{profile?.user?.email || user?.email || "—"}</span>
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">Issue Date:</span>{" "}
                                    <span className="text-black">
                                      {profile?.issueDate ? new Date(profile.issueDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}
                                    </span>
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-[#1E3A8A]">Expiry Date:</span>{" "}
                                    <span className="text-black">
                                      {profile?.expiryDate ? new Date(profile.expiryDate).toLocaleDateString("en-IN") : "Permanent"}
                                    </span>
                                  </div>
                                </div>
                                
                                  {/* Bottom Section */}
                                  <div className="flex justify-end items-end mt-auto pt-1">
                                    {/* Society Logo Emblem */}
                                    <div className="flex flex-col items-center">
                                      <img 
                                        src="/logo.jpeg" 
                                        alt="Society Logo" 
                                        className="w-12 h-12 object-contain rounded-full border border-[#1E3A8A]/20 bg-white" 
                                      />
                                      <span className="text-[5.5px] uppercase font-bold tracking-tighter text-[#1E3A8A] mt-1">
                                        SHARANAM SOCIETY
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                           <div key={dep.id} className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm">
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
