import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onToggleForm: () => void;
  onAdminMode: () => void;
}

export const LoginForm = ({ onToggleForm, onAdminMode }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Log in successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in with Google!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed.");
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-8">Log in</h1>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="test@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" title="Click to login as Admin" onDoubleClick={onAdminMode} className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 rounded-lg text-base shadow-sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
        </Button>

        <div className="flex justify-between items-center text-sm">
          <button 
            type="button" 
            onClick={onToggleForm}
            className="text-gray-500 hover:text-[#2563eb] transition-colors"
          >
            Create an account
          </button>
          <button 
            type="button" 
            className="text-gray-500 hover:text-[#2563eb] transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Or sign in with google
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-lg border-gray-200 text-gray-700 font-semibold gap-3 hover:bg-gray-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          Sign in with Google
        </Button>
      </form>
    </div>
  );
};
