import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, User, Lock, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/modules/login/AuthContext";

const AgentLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAgent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAgent(username.trim(), password);
      toast.success("Welcome to the collection portal");
      navigate("/agent", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#1a1f36] p-8 text-center">
          <div className="mx-auto w-14 h-14 bg-[#c9a84c]/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="h-7 w-7 text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Agent Portal</h1>
          <p className="text-slate-300 text-sm mt-2">Cash collection & online payment approval</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                required
                className="pl-10 h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="agent01"
                autoComplete="username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                required
                type="password"
                className="pl-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1a1f36] hover:bg-black font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
          <p className="text-center text-xs text-slate-400">
            <Link to="/admin/login" className="text-[#1a1f36] font-bold hover:underline">
              Admin login
            </Link>
            {" · "}
            <Link to="/pigmy" className="hover:underline">
              Pigmy home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AgentLoginPage;
