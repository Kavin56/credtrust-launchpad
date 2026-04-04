import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, ShieldCheck, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/modules/login/AuthContext";
import { toast } from "sonner";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, "ADMIN");
      toast.success("Welcome back, Administrator.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid administrative credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 selection:bg-[#c9a84c]/30 font-sans">
      <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT PANEL: Branding & Message */}
        <div className="w-full md:w-[450px] bg-[#1a1f36] p-12 text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 cursor-pointer mb-16" onClick={() => navigate('/admin')}>
                 <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                    <Landmark className="w-6 h-6 text-[#c9a84c]" />
                 </div>
                 <h1 className="text-xl font-bold tracking-tighter">CredTrust Admin</h1>
              </div>
              
              <h2 className="text-4xl font-bold tracking-tighter leading-tight mb-8">
                Institutional <br /> <span className="text-[#c9a84c]">Access.</span>
              </h2>
              <p className="text-white/40 font-medium leading-relaxed italic mb-12">
                Log in to access the CredTrust Cooperative Management System. Authorized personnel only. All access is logged and audited.
              </p>
           </div>

           <div className="relative z-10 flex items-center gap-3 text-white/40 text-[11px] font-bold uppercase tracking-widest group cursor-pointer" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Public Site
           </div>
        </div>

        {/* RIGHT PANEL: Login Form */}
        <div className="flex-grow p-12 lg:p-20 flex flex-col justify-center">
           <div className="max-w-[400px] mx-auto w-full">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase mb-6">
                Staff Authentication
              </span>
              <h3 className="text-3xl font-bold text-[#1a1f36] mb-2 tracking-tight">Admin Portal</h3>
              <p className="text-gray-400 font-medium mb-12 italic">Enter your administrative credentials to continue.</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Authorized Email</label>
                   <Input 
                      type="email" 
                      placeholder="admin@credtrust.local" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#c9a84c] transition-all font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                   />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Master Password</label>
                      <button type="button" className="text-[11px] font-bold text-[#6b21a8] hover:text-[#c9a84c] transition-colors">Emergency Reset</button>
                   </div>
                   <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#c9a84c] transition-all font-bold tracking-widest"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                   />
                </div>

                <div className="pt-4">
                   <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-16 rounded-[24px] bg-[#1a1f36] hover:bg-black text-[#c9a84c] font-black text-lg shadow-2xl shadow-indigo-900/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                   >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          Log In to Portal
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                   </Button>
                </div>
              </form>

              <div className="mt-12 pt-12 border-t border-gray-50 flex flex-col gap-6">
                 <div className="flex items-center gap-3 text-gray-300">
                    <ShieldCheck className="w-5 h-5" />
                    <p className="text-[11px] font-medium leading-normal italic">
                      Multi-factor authentication may be required for your role. Please check your assigned 2FA device if prompted.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
