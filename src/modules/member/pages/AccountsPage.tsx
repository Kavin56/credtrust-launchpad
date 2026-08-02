import { Search, ChevronRight, Eye, Home, Smartphone, Info, CreditCard, ChevronDown, Landmark, PiggyBank, CircleDollarSign, Calculator, User, Clock, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { getApiBaseUrl } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DownloadPaymentHistoryModal from '@/components/DownloadPaymentHistoryModal';

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
  const { data: rawLoans, isLoading: loanLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const { data } = await api.get("/loans/my");
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  });


  const [selectedLoanSummary, setSelectedLoanSummary] = useState<any>(null);
  const [selectedDepositSummary, setSelectedDepositSummary] = useState<any>(null);
  const [showDownloadHistoryModal, setShowDownloadHistoryModal] = useState(false);

  const getFormattedRegisteredId = (app: any) => {
    const regId = app?.registeredId || app?.member?.memberId || "";
    if (!regId) return "—";
    const trimmed = regId.trim();
    if (trimmed.toUpperCase().startsWith("ROJA")) {
      if (trimmed.toUpperCase().startsWith("ROJA-")) {
        return trimmed;
      }
      return `ROJA-${trimmed.slice(4)}`;
    }
    return `ROJA-${trimmed}`;
  };
  
  const loans = Array.isArray(rawLoans) ? rawLoans : [];
  const pendingLoans = loans.filter((l: any) => ['PENDING', 'UNDER_REVIEW', 'SUBMITTED'].includes(String(l.status).toUpperCase()));
  const activeLoans = loans.filter((l: any) => ['APPROVED', 'DISBURSED', 'ACTIVE'].includes(String(l.status).toUpperCase()));
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
    const baseUrl = getApiBaseUrl();
    if (url.startsWith('gs://') || url.startsWith('/uploads/')) {
      return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
    }
    const domain = baseUrl.replace(/\/api\/v1\/?$/, '');
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

                      <button
                        onClick={() => setShowDownloadHistoryModal(true)}
                        className="h-11 px-6 bg-white border-2 border-[#6b21a8]/20 hover:border-[#6b21a8] text-[#6b21a8] font-bold rounded-2xl flex items-center gap-2 text-xs shadow-sm hover:shadow-md transition-all ml-auto"
                      >
                        <Download className="w-4 h-4 text-[#6b21a8]" />
                        Download Payment History
                      </button>
                  </div>

                  {/* Government ID Card */}
                    <div className="pt-2">
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
                                <div className="w-[85px] h-[100px] border-2 border-[#1E3A8A] flex flex-col items-center justify-center bg-gray-50 rounded shrink-0 overflow-hidden relative">
                                  {getPhotoUrl(profile?.pendingPhotoUrl || profile?.photoUrl) ? (
                                    <img src={getPhotoUrl(profile?.pendingPhotoUrl || profile?.photoUrl)!} alt="Photo" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-center p-0.5">
                                      <User className="w-8 h-8 text-gray-400 mx-auto" />
                                      <span className="text-[7px] font-bold text-gray-400 block mt-1 leading-none">NO PHOTO</span>
                                    </div>
                                  )}
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
                                  <span className="font-bold shrink-0">Registered ID:&nbsp;</span>
                                  <span className="border-b border-dotted border-[#1E3A8A] flex-1 px-1 font-semibold text-black overflow-hidden truncate">
                                    {profile?.kycStatus === 'VERIFIED' ? profile?.memberId : "PENDING ALLOCATION"}
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
                            <p className="text-4xl font-black">₹{deposits?.reduce((s:number,d:any)=>s+Number(d.amount || d.principal || 0),0).toLocaleString()}</p>
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
                            <div 
                              key={dep.id} 
                              onClick={() => setSelectedDepositSummary(dep)}
                              className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl ${dep.kind === 'FD' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center`}>
                                     <Landmark className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <h4 className="text-[14px] font-bold text-[#1a1f36]">{dep.kind} Deposit</h4>
                                     <p className="text-[11px] text-gray-400">{dep.applicationNo || dep.id.slice(0,8)} | {Number(dep.interestRate)}%</p>
                                  </div>
                               </div>
                               <div className="text-right flex flex-col items-end gap-2">
                                 <div>
                                    <p className="text-[15px] font-black text-[#1a1f36]">₹{Number(dep.amount).toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase">{new Date(dep.maturityDate).toDateString()}</p>
                                 </div>
                                 <Link 
                                   to="/deposit-apply" 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                   }}
                                   className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-[#6b21a8] hover:bg-gray-50 tracking-widest"
                                 >
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
                       <h3 className="text-xl font-bold text-[#1a1f36]">My Loan Portfolio</h3>
                       <Link to="/loan-apply" className="px-6 py-2.5 bg-[#1a1f36] text-white rounded-full text-[13px] font-bold hover:bg-[#2d3356] transition-all shadow-sm">
                          + New Loan Application
                       </Link>
                    </div>

                    {/* Pending Applications Banner */}
                    {pendingLoans.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase text-amber-700 tracking-wider flex items-center gap-2">
                           <Clock className="w-4 h-4 text-amber-600" /> Pending Loan Applications ({pendingLoans.length})
                        </h4>
                        <div className="grid gap-4">
                          {pendingLoans.map((pLoan: any) => (
                            <div key={pLoan.id} className="bg-amber-50/70 border border-amber-200 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-[15px] font-bold text-[#1a1f36]">{pLoan.type || pLoan.product || "Loan Application"}</h4>
                                    <span className="px-3 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                                      Under Review
                                    </span>
                                  </div>
                                  <p className="text-xs text-amber-800/80 mt-0.5">
                                    App ID: <span className="font-mono font-bold">{pLoan.loanNumber || pLoan.id.slice(0, 8)}</span> · Submitted on {new Date(pLoan.createdAt || Date.now()).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Requested Principal</p>
                                <p className="text-xl font-black text-[#1a1f36]">₹{Number(pLoan.amount || pLoan.principal || 0).toLocaleString()}</p>
                                <p className="text-[11px] text-amber-800 italic mt-0.5">Application under admin review — no duplicate submit needed</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                       {/* Summary Card */}
                       <div className="bg-gradient-to-br from-[#1a1f36] to-[#2d3356] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl">
                           <div className="relative z-10 space-y-6">
                             <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none">Total Active Loan Balance</p>
                             <p className="text-4xl font-black">₹{activeLoans?.reduce((s:number,l:any)=>s+Number(l.amount || l.principal || 0),0).toLocaleString()}</p>
                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                 <div>
                                    <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Next EMI Due</p>
                                    <p className="font-bold text-[#c9a84c]">{activeLoans?.[0]?.nextDueDate ? new Date(activeLoans[0].nextDueDate).toDateString() : "—"}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Total EMI Amount</p>
                                    <p className="font-bold text-emerald-400">₹{activeLoans?.reduce((s:number,l:any)=>s+Number(l.emiAmount||0),0).toLocaleString()}</p>
                                 </div>
                             </div>
                           </div>
                           <Landmark className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 pointer-events-none" />
                       </div>

                        <div className="space-y-4">
                           {loanLoading && <Skeleton className="h-20 w-full" />}
                           {!loanLoading && loans?.length === 0 && (
                              <div className="p-8 bg-white rounded-[32px] border border-gray-100 text-center space-y-2">
                                <Landmark className="w-10 h-10 text-gray-300 mx-auto" />
                                <p className="text-gray-500 font-bold text-sm">No loans found</p>
                                <p className="text-xs text-gray-400">You haven't submitted any loan applications yet.</p>
                              </div>
                           )}
                           {!loanLoading && activeLoans?.map((loan:any) => {
                             const amount = Number(loan.amount || 0);
                             const netDisbursed = loan.netDisbursed ?? (amount - amount * 0.025);
                             const totalMonths = loan.termMonths || 12;
                             const paidMonths = loan.emiSchedule?.filter((s: any) => s.isPaid).length || 0;
                             const firstEmi = loan.emiSchedule?.[0];
                             const emiVal = firstEmi?.totalEmi || (amount * (loan.interestRate / 1200) * Math.pow(1 + loan.interestRate / 1200, totalMonths)) / (Math.pow(1 + loan.interestRate / 1200, totalMonths) - 1);
                             const emiAmount = Math.round(emiVal * 100) / 100;
                             const outstandingBalance = Math.round(emiAmount * (totalMonths - paidMonths) * 100) / 100;

                             const nextEmiItem = loan.emiSchedule?.find((s: any) => !s.isPaid);
                             const nextEmiDate = nextEmiItem ? new Date(nextEmiItem.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

                             // Timeline
                             const startDate = loan.disbursedAt ? new Date(loan.disbursedAt) : new Date(loan.createdAt);
                             const endDate = new Date(startDate);
                             endDate.setMonth(endDate.getMonth() + totalMonths);
                             const timelineStr = `${startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;

                             return (
                               <div 
                                 key={loan.id} 
                                 onClick={() => setSelectedLoanSummary(loan)}
                                 className="bg-white rounded-[32px] p-6 border border-gray-100 hover:border-[#6b21a8] transition-all cursor-pointer shadow-sm space-y-4 hover:shadow-md"
                               >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#c9a84c] shrink-0">
                                          <CircleDollarSign className="w-5 h-5" />
                                       </div>
                                       <div>
                                          <h4 className="text-sm font-bold text-[#1a1f36]">{loan.type}</h4>
                                          <p className="text-[10px] text-gray-400 font-mono">{loan.loanNumber || loan.id.slice(0,8)}</p>
                                       </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                      {loan.status}
                                    </span>
                                 </div>

                                 {/* Grid of details (Requirement 6) */}
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs border-t border-slate-50 pt-3">
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Amount Applied</span>
                                       <span className="font-extrabold text-[#1a1f36]">₹{amount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Net Disbursed</span>
                                       <span className="font-extrabold text-emerald-600">₹{netDisbursed.toLocaleString()}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Monthly EMI</span>
                                       <span className="font-extrabold text-[#1a1f36]">₹{emiAmount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Outstanding Balance</span>
                                       <span className="font-extrabold text-rose-600">₹{outstandingBalance.toLocaleString()}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Next EMI Date</span>
                                       <span className="font-extrabold text-[#1a1f36]">{nextEmiDate}</span>
                                    </div>
                                    <div>
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">EMI Progress</span>
                                       <span className="font-extrabold text-[#1a1f36]">{paidMonths} / {totalMonths} Months Paid</span>
                                    </div>
                                    <div className="col-span-2">
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Timeline</span>
                                       <span className="font-extrabold text-slate-600">{timelineStr} ({totalMonths} Months)</span>
                                    </div>
                                 </div>

                                 <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                   <span className="text-[9px] text-[#6b21a8] font-bold uppercase tracking-wider">Click to view full statement</span>
                                   <Link 
                                     to="/payments" 
                                     onClick={(e) => e.stopPropagation()} 
                                     className="px-3 py-1 bg-[#1a1f36] text-white rounded-lg text-[9px] font-black uppercase hover:bg-black tracking-widest shadow-sm"
                                   >
                                      Pay EMI
                                   </Link>
                                 </div>
                               </div>
                             );
                           })}
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

       <Dialog open={selectedLoanSummary !== null} onOpenChange={(open) => !open && setSelectedLoanSummary(null)}>
         <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 font-sans">
           <DialogHeader className="border-b border-gray-100 pb-4">
             <div className="flex items-center justify-between">
               <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
                 <FileText className="h-5 w-5 text-[#c9a84c]" />
                 Loan Application & Repayment Summary
               </DialogTitle>
               {selectedLoanSummary && (
                 <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                   selectedLoanSummary.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                   ['APPROVED', 'ACTIVE', 'DISBURSED'].includes(selectedLoanSummary.status) ? 'bg-emerald-100 text-emerald-800' :
                   'bg-rose-100 text-rose-800'
                 }`}>
                   {selectedLoanSummary.status}
                 </span>
               )}
             </div>
             <DialogDescription className="text-xs text-slate-500">
               Complete details and repayment history for Loan {selectedLoanSummary?.loanNumber || selectedLoanSummary?.id?.slice(0, 8)}
             </DialogDescription>
           </DialogHeader>

           {selectedLoanSummary && (() => {
             const amount = Number(selectedLoanSummary.amount || 0);
             const docCharges = selectedLoanSummary.documentationCharges || (amount * 0.025);
             const netDisbursed = selectedLoanSummary.netDisbursed || (amount - docCharges);

             const totalMonths = selectedLoanSummary.termMonths || 12;
             const paidMonths = selectedLoanSummary.emiSchedule?.filter((s: any) => s.isPaid).length || 0;
             const progressPercent = Math.min(Math.round((paidMonths / totalMonths) * 100), 100);

             const firstEmi = selectedLoanSummary.emiSchedule?.[0];
             const emiVal = firstEmi?.totalEmi || (amount * (selectedLoanSummary.interestRate / 1200) * Math.pow(1 + selectedLoanSummary.interestRate / 1200, totalMonths)) / (Math.pow(1 + selectedLoanSummary.interestRate / 1200, totalMonths) - 1);
             const emiAmount = Math.round(emiVal * 100) / 100;
             const outstandingBalance = Math.round(emiAmount * (totalMonths - paidMonths) * 100) / 100;

             const nextEmiItem = selectedLoanSummary.emiSchedule?.find((s: any) => !s.isPaid);
             const nextEmiDate = nextEmiItem ? new Date(nextEmiItem.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
             
             // Format dates
             const startDate = selectedLoanSummary.disbursedAt ? new Date(selectedLoanSummary.disbursedAt) : new Date(selectedLoanSummary.createdAt);
             const startStr = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
             
             // End date: Start Date + termMonths
             const endDate = new Date(startDate);
             endDate.setMonth(endDate.getMonth() + totalMonths);
             const endStr = endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
             
             const formattedStartDate = selectedLoanSummary.startDate ? new Date(selectedLoanSummary.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : startStr;
             const formattedEndDate = selectedLoanSummary.endDate ? new Date(selectedLoanSummary.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : endStr;
             const approvedDateVal = selectedLoanSummary.disbursedAt ? new Date(selectedLoanSummary.disbursedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
             const approvedByVal = ['APPROVED', 'ACTIVE', 'DISBURSED'].includes(selectedLoanSummary.status) ? (selectedLoanSummary.approvedBy || "Admin") : "—";

             return (
               <div className="space-y-6 py-4">
                 {/* 1. Common Information */}
                 <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                   <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Common Information</h4>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Registered ID</p>
                       <p className="font-bold text-slate-900">{getFormattedRegisteredId(selectedLoanSummary)}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Name</p>
                       <p className="font-bold text-slate-900">{selectedLoanSummary.member?.fullName || "—"}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application ID</p>
                       <p className="font-bold text-slate-900">{selectedLoanSummary.loanNumber || selectedLoanSummary.id.slice(0, 8)}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Type</p>
                       <p className="font-bold text-slate-900">Loan</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Status</p>
                       <p className="font-bold text-slate-900">{selectedLoanSummary.status}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Start Date</p>
                       <p className="font-bold text-slate-900">{formattedStartDate}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">End Date</p>
                       <p className="font-bold text-slate-900">{formattedEndDate}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Payment Date</p>
                       <p className="font-bold text-slate-900">{selectedLoanSummary.monthlyPaymentDate || "—"}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approval Date</p>
                       <p className="font-bold text-slate-900">{approvedDateVal}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approved By</p>
                       <p className="font-bold text-slate-900">{approvedByVal}</p>
                     </div>
                   </div>
                 </div>

                 {/* 2. Loan Summary */}
                 <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                   <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Loan Summary</h4>
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Loan Amount Applied</p>
                       <p className="font-bold text-slate-950">₹{amount.toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Loan Amount Approved</p>
                       <p className="font-bold text-slate-950">₹{amount.toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Interest Rate</p>
                       <p className="font-bold text-slate-950">{selectedLoanSummary.interestRate}% p.a.</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Loan Tenure</p>
                       <p className="font-bold text-slate-950">{totalMonths} Months</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">EMI Amount</p>
                       <p className="font-bold text-slate-950">₹{emiAmount.toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Interest</p>
                       <p className="font-bold text-slate-950">₹{Math.round(emiAmount * totalMonths - amount).toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Payable Amount</p>
                       <p className="font-bold text-slate-950">₹{Math.round(emiAmount * totalMonths).toLocaleString()}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Number of EMIs</p>
                       <p className="font-bold text-slate-950">{totalMonths}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Remaining EMIs</p>
                       <p className="font-bold text-slate-950">{totalMonths - paidMonths}</p>
                     </div>
                     <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Next EMI Date</p>
                       <p className="font-bold text-slate-950">{nextEmiDate}</p>
                     </div>
                   </div>
                 </div>

                 {/* 3. Proportional Charges & Disbursement Calculation */}
                 <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                   <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Loan Disbursement & Charges Summary</h4>
                   <div className="text-xs space-y-2 text-[#1a1f36]">
                     <div className="flex justify-between font-bold">
                       <span>Loan Amount Applied</span>
                       <span>₹{amount.toLocaleString()}</span>
                     </div>
                     <div className="border-t border-slate-200/50 my-2" />
                     <div className="space-y-1.5 pl-2 text-slate-500 font-medium">
                       <div className="flex justify-between">
                         <span>Less: Documentation Charges (2.5%)</span>
                         <span>- ₹{docCharges.toLocaleString()}</span>
                       </div>
                     </div>
                     <div className="border-t border-slate-200/50 my-2" />
                     <div className="flex justify-between font-black text-[#1a1f36] text-sm bg-slate-100/50 p-2.5 rounded-xl">
                       <span>Net Disbursed Amount</span>
                       <span className="text-emerald-600">₹{netDisbursed.toLocaleString()}</span>
                     </div>
                   </div>
                 </div>

                 {/* 4. EMI Progress Tracker */}
                 {selectedLoanSummary.status !== 'PENDING' && (
                   <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-bold uppercase text-slate-500">EMI Progress</span>
                       <span className="font-black text-[#1a1f36]">Pending EMIs: {(totalMonths - paidMonths)} / {totalMonths}</span>
                     </div>
                     
                     {/* Sleek progress bar */}
                     <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden flex">
                       <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                     </div>

                     <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                       <span>Paid: {paidMonths}/{totalMonths}</span>
                       <span>Pending: {(totalMonths - paidMonths)}/{totalMonths}</span>
                     </div>
                   </div>
                 )}

                 {/* 5. EMI Payment History Table */}
                 {selectedLoanSummary.status !== 'PENDING' && (
                   <div className="space-y-3">
                     <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">EMI Payment Status</h4>
                     <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                       <table className="w-full text-left border-collapse text-xs">
                         <thead>
                           <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="p-3 font-bold text-slate-400">S.No</th>
                             <th className="p-3 font-bold text-slate-400">EMI Due Date</th>
                             <th className="p-3 font-bold text-slate-400">EMI Month</th>
                             <th className="p-3 font-bold text-slate-400">Amount Paid</th>
                             <th className="p-3 font-bold text-slate-400">Payment Date</th>
                             <th className="p-3 font-bold text-slate-400">Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-medium text-[#1a1f36]">
                           {selectedLoanSummary.emiSchedule?.map((s: any, idx: number) => {
                             const dueDate = new Date(s.dueDate);
                             const dueMonthName = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                             const dueStr = dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                             
                             let status = "Pending";
                             if (s.isPaid) status = "Paid";
                             else if (dueDate < new Date()) status = "Overdue";

                             return (
                               <tr key={s.id} className="hover:bg-slate-50/50">
                                 <td className="p-3 font-mono">{idx + 1}</td>
                                 <td className="p-3">{dueStr}</td>
                                 <td className="p-3">{dueMonthName}</td>
                                 <td className="p-3 font-bold">{s.isPaid ? `₹${s.totalEmi.toLocaleString()}` : "—"}</td>
                                 <td className="p-3">{s.paidAt ? new Date(s.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</td>
                                 <td className="p-3">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                     status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                                     status === 'Overdue' ? 'bg-rose-50 text-rose-700' :
                                     'bg-amber-50 text-amber-700'
                                   }`}>
                                     {status}
                                   </span>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 )}
               </div>
             );
           })()}
         </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositSummary !== null} onOpenChange={(open) => !open && setSelectedDepositSummary(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 font-sans">
            <DialogHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-[#1a1f36] flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-[#c9a84c]" />
                  Deposit Account & Investment Summary
                </DialogTitle>
                {selectedDepositSummary && (
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800`}>
                    {selectedDepositSummary.status || 'ACTIVE'}
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Complete details and maturity projection for Deposit {selectedDepositSummary?.applicationNo || selectedDepositSummary?.id?.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            {selectedDepositSummary && (() => {
              const amount = Number(selectedDepositSummary.amount || 0);
              const rate = Number(selectedDepositSummary.interestRate || 0);
              const termMonths = selectedDepositSummary.termMonths || 12;
              const maturityAmount = selectedDepositSummary.maturityAmount || 0;
              const startDate = selectedDepositSummary.startDate ? new Date(selectedDepositSummary.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
              const endDate = selectedDepositSummary.endDate ? new Date(selectedDepositSummary.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
              const approvedDate = selectedDepositSummary.approvedDate ? new Date(selectedDepositSummary.approvedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

              return (
                <div className="space-y-6 py-4">
                  {/* 1. Common Information */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Common Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Registered ID</p>
                        <p className="font-bold text-slate-900">{getFormattedRegisteredId(selectedDepositSummary)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Name</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.member?.fullName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application ID</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.applicationNo || selectedDepositSummary.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Type</p>
                        <p className="font-bold text-slate-900">Deposit ({selectedDepositSummary.type})</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Application Status</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.status || 'ACTIVE'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Start Date</p>
                        <p className="font-bold text-slate-900">{startDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">End Date</p>
                        <p className="font-bold text-slate-900">{endDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Payment Date</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.monthlyPaymentDate || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approval Date</p>
                        <p className="font-bold text-slate-900">{approvedDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Approved By</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.approvedBy || "Admin"}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Deposit Summary */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Deposit Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Deposit Amount</p>
                        <p className="font-black text-slate-900 text-sm">₹{amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Interest Rate</p>
                        <p className="font-black text-slate-900 text-sm">{rate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Deposit Period</p>
                        <p className="font-bold text-slate-900">{termMonths} Months</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Maturity Date</p>
                        <p className="font-bold text-emerald-600">{selectedDepositSummary.maturityDate ? new Date(selectedDepositSummary.maturityDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Maturity Amount</p>
                        <p className="font-black text-emerald-600 text-sm">₹{maturityAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Payment Frequency</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.type === 'RD' ? 'Monthly' : 'One-time'}</p>
                      </div>
                      <div>
                        {(() => {
                          const isFD = selectedDepositSummary.type !== 'RD';
                          const paidInst = isFD ? (selectedDepositSummary.status === 'APPROVED' ? 1 : 0) : (selectedDepositSummary.transactions?.filter((t: any) => t.type === 'DEPOSIT').length || 0);
                          const totalInst = isFD ? 1 : termMonths;
                          const pendingInst = Math.max(0, totalInst - paidInst);
                          return (
                            <>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pending Instalments</p>
                              <p className="font-bold text-slate-900">{pendingInst} / {totalInst}</p>
                            </>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Status</p>
                        <p className="font-bold text-slate-900">{selectedDepositSummary.status || 'ACTIVE'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        <DownloadPaymentHistoryModal
          isOpen={showDownloadHistoryModal}
          onClose={() => setShowDownloadHistoryModal(false)}
        />

      <Footer />
    </div>
  );
};

export default AccountsPage;
