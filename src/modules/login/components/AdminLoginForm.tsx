import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface AdminLoginFormProps {
  onBack: () => void;
}

export const AdminLoginForm = ({ onBack }: AdminLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (secretKey !== "CREDTRUST_ADMIN_2026") {
      toast.error("Invalid Secret Key.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      const role = localStorage.getItem("role");
      if (role !== "ADMIN" && role !== "CEO") {
        toast.error("Insufficient privileges");
        setLoading(false);
        return;
      }
      toast.success("Admin access granted!");
      navigate("/admin");
    } catch (error: any) {
      console.error(error);
      toast.error("Auth failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-red-500" />
        <span className="text-sm font-bold text-red-500 uppercase tracking-widest">Admin Portal</span>
      </div>
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-8">System Access</h1>
      
      <form onSubmit={handleAdminLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">Admin Email</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@credtrust.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" title="Secret Key" className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="admin-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret-key" className="text-sm font-medium text-gray-700">Admin Secret Key</Label>
          <Input
            id="secret-key"
            type="password"
            placeholder="Enter Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
            className="h-12 bg-red-50 border-red-100 placeholder:text-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#1a1f36] hover:bg-black text-white font-bold h-12 rounded-lg text-base shadow-lg mt-4"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Access"}
        </Button>

        <button 
          type="button" 
          onClick={onBack}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 underline decoration-dotted underline-offset-4"
        >
          Return to Member Login
        </button>
      </form>
    </div>
  );
};
