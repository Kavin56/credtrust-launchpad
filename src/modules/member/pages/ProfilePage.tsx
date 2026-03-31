import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  ChevronRight, 
  Home, 
  Settings, 
  Eye, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users, 
  Globe2, 
  Lock,
  Download,
  Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = () => {
  const [activeView, setActiveView] = useState('personal'); // personal, kyc, nominee, security
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

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
          <span className="text-[#1a1f36] font-bold">Profile & Identity</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="lg:w-[320px] space-y-6 shrink-0">
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 text-center space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-br from-[#1a1f36] to-[#6b21a8] rounded-t-[40px]" />
                <div className="relative pt-6">
                   <div className="w-28 h-28 rounded-[32px] border-4 border-white shadow-xl bg-[#c9a84c] mx-auto flex items-center justify-center text-white text-[40px] font-black group-hover:rotate-6 transition-transform duration-500">
                      KV
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#1a1f36] shadow-lg cursor-pointer">
                         <Camera className="w-5 h-5" />
                      </div>
                   </div>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-[#1a1f36]">Kavinkumar V S</h2>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">MEMBER ID: CT88219</p>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-center gap-6">
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold border border-emerald-100">VERIFIED</span>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined</p>
                      <p className="text-[12px] font-bold text-[#1a1f36]">Feb 2024</p>
                   </div>
                </div>
             </div>

             <nav className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden py-4">
                {[
                  { id: 'personal', label: 'Personal Information', icon: User },
                  { id: 'kyc', label: 'KYC Documents', icon: ShieldCheck },
                  { id: 'nominee', label: 'Nominee Management', icon: Users },
                  { id: 'security', label: 'Security & Password', icon: Lock }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-4 px-8 py-5 transition-all relative border-l-4 ${
                      activeView === item.id ? "bg-[#1a1f36]/[0.02] text-[#6b21a8] border-[#6b21a8] font-bold" : "text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[13px]">{item.label}</span>
                    {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
             </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-grow space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             {/* Personal Information View */}
             <AnimatePresence mode="wait">
                {activeView === 'personal' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-bold text-[#1a1f36]">Manage Personal Identity</h3>
                           <p className="text-sm text-gray-400 font-medium">Keep your contact details updated for banking alerts</p>
                        </div>
                        <Button 
                           onClick={() => setIsEditing(!isEditing)} 
                           className={`rounded-2xl px-8 h-12 font-bold transition-all ${
                              isEditing ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-[#1a1f36] text-white hover:bg-black"
                           }`}
                        >
                           {isEditing ? "Cancel Edit" : "Update Profile"}
                        </Button>
                     </div>

                     <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Full Legal Name</Label>
                           <Input defaultValue="Kavinkumar V S" disabled className="h-14 rounded-2xl border-gray-100 bg-gray-50/50" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Date of Birth</Label>
                           <Input value="14/08/1992" disabled className="h-14 rounded-2xl border-gray-100 bg-gray-50/50" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Email Address</Label>
                           <Input defaultValue="kavin@credtrust.co" disabled={!isEditing} className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`} />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Mobile Number</Label>
                           <Input defaultValue="+91 91234 56789" disabled={!isEditing} className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`} />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Residential Address</Label>
                           <Input defaultValue="42, Elite Residency, West Mambalam, Chennai - 600033" disabled={!isEditing} className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`} />
                        </div>

                        {isEditing && (
                           <div className="md:col-span-2 pt-6">
                              <Button type="submit" className="h-14 w-full bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] font-black shadow-xl shadow-amber-900/10">
                                 Save Profile Changes
                              </Button>
                           </div>
                        )}
                     </form>
                  </motion.div>
                )}

                {activeView === 'kyc' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-bold text-[#1a1f36]">KYC Vault</h3>
                              <p className="text-sm text-gray-400 font-medium">Your verified identity documents and portal access cards</p>
                           </div>
                           <Button className="h-12 px-8 bg-[#1a1f36] text-white rounded-2xl font-bold">Upload New Document</Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           {[
                             { name: "Aadhar Card", id: "XXXX XXXX 7615", status: "Verified", date: "Feb 2024", color: "bg-emerald-50 text-emerald-600" },
                             { name: "PAN Card", id: "BRJPXXXX2F", status: "Verified", date: "Feb 2024", color: "bg-emerald-50 text-emerald-600" },
                             { name: "Voter ID", id: "TNUXXXX882", status: "Pending", date: "Under Review", color: "bg-amber-50 text-amber-600" },
                             { name: "Member Certificate", id: "CT-C-88219", status: "Digitally Signed", date: "Feb 2024", color: "bg-purple-50 text-purple-600" }
                           ].map((doc, i) => (
                             <div key={i} className="p-8 bg-gray-50 rounded-[40px] border border-gray-200/50 flex flex-col justify-between group hover:border-[#6b21a8] transition-all cursor-pointer h-60 relative overflow-hidden">
                                <FileText className="absolute -right-4 -bottom-4 w-32 h-32 text-[#1a1f36]/[0.03] group-hover:rotate-12 transition-transform duration-500" />
                                <div className="space-y-4 relative z-10">
                                   <div className={`px-4 py-1.5 rounded-full inline-block text-[10px] font-bold uppercase tracking-widest border border-current ${doc.color}`}>
                                      {doc.status}
                                   </div>
                                   <div>
                                      <h4 className="text-[18px] font-black text-[#1a1f36] leading-tight">{doc.name}</h4>
                                      <p className="text-[12px] font-bold text-gray-400 mt-1">{doc.id}</p>
                                   </div>
                                </div>
                                <div className="flex justify-between items-center relative z-10 pt-4 border-t border-gray-200/50">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{doc.date}</p>
                                   <button className="p-3 bg-white rounded-2xl shadow-sm text-[#1a1f36] hover:bg-[#1a1f36] hover:text-white transition-all">
                                      <Eye className="w-5 h-5" />
                                   </button>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeView === 'nominee' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-[#1a1f36]">Nominee Management</h3>
                        <p className="text-sm text-gray-400 font-medium">Assign beneficiaries for your share capital and deposits</p>
                     </div>

                     <div className="grid md:grid-cols-[400px,1fr] gap-12">
                        {/* Interactive Nominee Card */}
                        <div className="bg-gradient-to-br from-[#1a1f36] via-[#2d3356] to-[#1a1f36] p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                           <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                              <div className="flex items-center gap-4">
                                 <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
                                    <Users className="w-8 h-8 text-[#c9a84c]" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Secondary Beneficiary</p>
                                    <h4 className="text-xl font-black text-white">Ananthi K</h4>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-8 py-8 border-t border-white/10 border-dashed">
                                 <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Relationship</p>
                                    <p className="text-[15px] font-bold">Spouse</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Allocation</p>
                                    <p className="text-[15px] font-bold text-[#c9a84c]">100.00%</p>
                                 </div>
                              </div>

                              <button className="w-full h-14 rounded-2xl bg-white text-[#1a1f36] font-black text-[13px] hover:bg-[#c9a84c] transition-all shadow-xl shadow-black/20">
                                 Edit Nominee Roles
                              </button>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex items-start gap-6">
                              <AlertCircle className="w-10 h-10 text-amber-600 mt-1" />
                              <div className="space-y-2">
                                 <h5 className="text-[15px] font-bold text-amber-900">Legal Compliance Note</h5>
                                 <p className="text-[12px] text-amber-800 leading-relaxed font-bold opacity-80 uppercase tracking-tight">
                                    Nominations are made in accordance with the Cooperative Societies Act. Changes made here will apply to all your active accounts across CredTrust.
                                 </p>
                              </div>
                           </div>
                           
                           <div className="space-y-6">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8">Quick Settings</p>
                              <div className="grid gap-4">
                                 <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#6b21a8] transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <Globe2 className="w-5 h-5 text-[#6b21a8]" />
                                       <span className="text-[13px] font-bold">Update Social Security Link</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all" />
                                 </div>
                                 <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#6b21a8] transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <Download className="w-5 h-5 text-[#6b21a8]" />
                                       <span className="text-[13px] font-bold">Download Nomination Form (PDF)</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeView === 'security' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-[#1a1f36]">Security Preferences</h3>
                        <p className="text-sm text-gray-400 font-medium">Protect your vault with bio-metric and advanced security layers</p>
                     </div>

                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="p-8 border-2 border-[#1a1f36]/5 bg-[#f8fafc] rounded-[40px] space-y-6 flex flex-col justify-between h-72 group hover:border-[#6b21a8] transition-all">
                           <div className="space-y-4">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#6b21a8] shadow-sm">
                                 <Fingerprint className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-[#1a1f36]">Biometric Authentication</h4>
                                 <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Sign transactions using your device's touch or face identity.</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                              <span className="text-[11px] font-bold uppercase text-emerald-600 tracking-widest">Active</span>
                              <div className="w-12 h-6 bg-[#1a1f36] rounded-full relative cursor-pointer">
                                 <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                           </div>
                        </div>

                        <div className="p-8 border-2 border-[#1a1f36]/5 bg-[#f8fafc] rounded-[40px] space-y-6 flex flex-col justify-between h-72 group hover:border-[#6b21a8] transition-all">
                           <div className="space-y-4">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm">
                                 <ShieldCheck className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-[#1a1f36]">Two-Factor (2FA)</h4>
                                 <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Adds an extra layer of security via SMS or Authenticator App.</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Recommendation: Medium</span>
                              <Link to="#" className="text-[11px] font-bold text-[#6b21a8] border-b border-[#6b21a8]">Enable Now</Link>
                           </div>
                        </div>
                     </div>

                     <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8 py-2">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                              <Lock className="w-6 h-6" />
                           </div>
                           <div>
                              <h5 className="text-[15px] font-bold text-[#1a1f36]">Last Password Change</h5>
                              <p className="text-[12px] text-gray-400">12 Feb 2024 (45 days ago)</p>
                           </div>
                        </div>
                        <Button variant="ghost" className="h-14 px-10 border-2 border-gray-100 rounded-2xl font-bold text-[#1a1f36] hover:bg-gray-50">
                           Change Password
                        </Button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Support Help */}
             <div className="mt-8 flex items-center justify-between p-8 bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-[40px] border border-emerald-100">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-[28px] bg-white flex items-center justify-center shadow-sm text-emerald-600">
                      <Globe2 className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[16px] font-bold text-emerald-900 leading-none">Need assistance with your KYC?</h4>
                      <p className="text-[12px] text-emerald-700 font-medium max-w-sm">Contact our nodal officer or visit the nearest CredTrust branch portal.</p>
                   </div>
                </div>
                <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[12px] shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                   CONTACT SUPPORT
                </button>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
