import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, User, Mail, Hash, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/modules/login/AuthContext';

const PublicPigmyLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginPublicPigmy } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pigmyId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginPublicPigmy({
        email: formData.email,
        pigmyAccountNumber: formData.pigmyId,
        fullName: formData.name,
      });
      toast.success("Welcome back", {
        description: "Opening your Pigmy savings dashboard...",
      });
      navigate('/dashboard/pigmy', { replace: true });
    } catch (err: any) {
      toast.error("Login failed", {
        description: err.response?.data?.message || "Invalid email or Pigmy Account ID",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a148c]/10 via-white to-[#a21caf]/5 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#4a148c]/10"
      >
        <div className="bg-[#4a148c] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
            <PiggyBank className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Public Login</h2>
          <p className="text-purple-200 text-sm mt-2">Access your Pigmy account with registered email & ID</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                required
                placeholder="Ravi Kumar" 
                className="pl-10 h-11 bg-gray-50 border-gray-200"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                required
                type="email"
                placeholder="ravi@example.com" 
                className="pl-10 h-11 bg-gray-50 border-gray-200"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pigmy Account Number</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                required
                placeholder="e.g. PIGMY0001" 
                className="pl-10 h-11 bg-gray-50 border-gray-200 font-mono"
                value={formData.pigmyId}
                onChange={e => setFormData({...formData, pigmyId: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#4a148c] hover:bg-[#311b92] text-white font-bold rounded-xl text-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Access Dashboard"}
            </Button>
            <p className="text-center text-xs text-gray-500">
              New member?{' '}
              <Link to="/signup" className="font-bold text-[#4a148c] hover:underline">Create an account</Link>
            </p>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full text-sm font-bold text-gray-500"
              onClick={() => navigate('/pigmy')}
            >
              Back to Pigmy Portal
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PublicPigmyLogin;
