import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface SignupFormProps {
  onToggleForm: () => void;
}

export const SignupForm = ({ onToggleForm }: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        email,
        password,
      });
      toast.success("Account created successfully. Please complete your profile.");
      navigate("/signup-flow");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-2">Create Account</h1>
      <p className="text-gray-500 mb-8 font-medium">Join us to start managing your society membership.</p>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700 uppercase tracking-wider text-[10px] font-bold">Email Address</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-xl font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" title="Signup" className="text-sm font-medium text-gray-700 uppercase tracking-wider text-[10px] font-bold">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-xl font-medium"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black h-12 rounded-xl text-base shadow-lg shadow-blue-500/20 mt-4 transition-all"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN UP"}
        </Button>

        <div className="flex flex-col gap-4 text-sm mt-6">
          <div className="flex justify-center items-center gap-2">
            <span className="text-gray-400 font-medium">Already have an account?</span>
            <button 
              type="button" 
              onClick={onToggleForm}
              className="text-[#2563eb] font-bold hover:underline transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
