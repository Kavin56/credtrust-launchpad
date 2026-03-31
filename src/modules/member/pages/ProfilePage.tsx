import { useAuth } from "@/modules/auth/AuthContext";
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  Shield, 
  CreditCard, 
  Gift, 
  Headphones, 
  MessageSquare, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Edit3, 
  ChevronDown, 
  Home 
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProfilePage = () => {
  const { user } = useAuth();
  
  const sidebarLinks = [
    { icon: User, label: "Manage My Profile", active: true },
    { icon: Shield, label: "Manage My Accounts" },
    { icon: ShieldCheck, label: "Access Services" },
    { icon: Edit3, label: "Settings" },
    { icon: Shield, label: "Update My Security" },
    { icon: Gift, label: "Refer & Earn Rewards" },
    { icon: Headphones, label: "Get Support" },
    { icon: MessageSquare, label: "Share Feedback" },
  ];

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
          <span className="text-[#1a1f36] font-bold">Profile</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[1fr,2.5fr] gap-8">
        {/* SIDEBAR (SBI Style) */}
        <aside className="space-y-6">
          {/* User Summary Widget */}
          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 flex flex-col items-center text-center relative">
             <div className="w-24 h-24 rounded-full bg-[#c9a84c]/10 border-4 border-white flex items-center justify-center text-3xl font-bold text-[#1a1f36] mb-6 relative">
                {user?.email?.substring(0, 2).toUpperCase() || "KS"}
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
                   <Edit3 className="w-3.5 h-3.5 text-[#1a1f36]" />
                </button>
             </div>
             <h2 className="text-[17px] font-bold text-[#1a1f36] mb-1">{user?.email?.split('@')[0].toUpperCase() || "KAVINKUMAR V S"}</h2>
             <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 tracking-wider">
                <span>CIF: xxxxxxx8967</span>
                <Search className="w-3.5 h-3.5 opacity-50" />
             </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
            {sidebarLinks.map((link, idx) => (
              <button 
                key={idx}
                className={`w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group ${link.active ? 'bg-purple-50/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${link.active ? 'bg-[#6b21a8] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-[#6b21a8]'} transition-colors`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[13px] font-bold ${link.active ? 'text-[#1a1f36]' : 'text-gray-500 group-hover:text-[#1a1f36]'}`}>
                    {link.label}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${link.active ? 'text-[#6b21a8]' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT (SBI Style) */}
        <main className="space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
             {/* Tabs Header */}
             <div className="flex border-b border-gray-100 px-10">
                <button className="px-6 py-6 text-[14px] font-bold text-[#6b21a8] border-b-2 border-[#6b21a8] flex items-center gap-2">
                   Personal Details
                   <AlertCircle className="w-4 h-4 text-orange-500" />
                </button>
                <button className="px-6 py-6 text-[14px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-2">
                   Professional Details
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </button>
                <div className="ml-auto self-center text-[12px] font-bold">
                   <span className="text-gray-400">Profile Completion: </span>
                   <span className="text-[#c9a84c]">91%</span>
                </div>
             </div>

             <div className="p-10 space-y-10">
                {/* KYC Banner */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 font-bold text-[13px]">
                   <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                   KYC Updated
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 bg-gray-50/50 p-10 rounded-[32px] border border-gray-50">
                   {[
                     { label: "Date of Birth", value: "XX/XX/2004", verified: true },
                     { label: "Mobile Number", value: "XXXXXX9624", verified: true },
                     { label: "CKYC Number", value: "XXXXXXXX0000", verified: true, info: true },
                     { label: "PAN", value: "XXXXXX362R", verified: true },
                     { label: "Father's Name", value: "SIVAKUMAR V G", verified: false }
                   ].map((item, idx) => (
                     <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                           {item.label}
                           {item.info && <AlertCircle className="w-3 h-3 opacity-50" />}
                        </div>
                        <div className="flex items-center justify-between text-[14px] font-bold text-[#1a1f36]">
                           <span>{item.value}</span>
                           <div className="flex items-center gap-2">
                              {item.verified && <CheckCircle2 className="w-4 h-4 text-[#6b21a8]" />}
                              <Search className="w-4 h-4 text-gray-300 cursor-pointer" />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Email ID</p>
                        <p className="text-[14px] font-bold text-[#1a1f36] underline decoration-[#6b21a8] underline-offset-4 decoration-2">{user?.email || "vskavinkumar2004@gmail.com"}</p>
                     </div>
                     <button className="text-[13px] font-bold text-[#6b21a8] border-b border-[#6b21a8] hover:text-[#c9a84c] transition-colors">Verify</button>
                   </div>

                   <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Communication Address</p>
                            <Edit3 className="w-4 h-4 text-[#6b21a8] cursor-pointer" />
                         </div>
                         <div className="h-24 w-full border-b border-gray-200" /> {/* Spacer for image parity */}
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Permanent Address</p>
                            <Edit3 className="w-4 h-4 text-[#6b21a8] cursor-pointer" />
                         </div>
                         <p className="text-[13px] text-gray-500 font-bold leading-relaxed pr-8 max-w-[280px]">
                            S/O: V S Siva Kumar, 137, 3 RD CROSS STR EET, MEMAMBEDU, SIVA VISHNU KOIL Ambattur Ambattur Thiruvallur TAMIL NADU 600053
                         </p>
                      </div>
                   </div>
                </div>

                {/* Additional Details */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                   {[
                     { label: "Marital Status", value: "Single" },
                     { label: "Religion", value: "Christian" },
                     { label: "Category", value: "General" }
                   ].map((item, idx) => (
                     <div key={idx} className="space-y-2 border-b-2 border-gray-100 pb-2 flex items-center justify-between group cursor-pointer hover:border-[#6b21a8] transition-all">
                        <div className="space-y-1">
                           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                           <p className="text-[14px] font-bold text-[#1a1f36]">{item.value}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#6b21a8]" />
                     </div>
                   ))}
                </div>
                
                {/* Save Footer */}
                <div className="flex justify-center pt-10">
                   <button className="rounded-full px-20 py-4 bg-gray-100 text-gray-400 font-bold text-[14px] cursor-not-allowed shadow-inner">
                      Save
                   </button>
                </div>
             </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
