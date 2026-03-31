import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SignupFormProps {
  onToggleForm: () => void;
}

export const SignupForm = ({ onToggleForm }: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await supabase.from('members').insert([
        { id: user.uid, email: email, status: 'pending_verification' }
      ]);

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Attempt to create member record if it doesn't exist
      await supabase.from('members').upsert([
        { id: user.uid, email: user.email, status: 'pending_verification' }
      ], { onConflict: 'id' });

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
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-8">Sign up</h1>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" title="Signup" className="text-sm font-medium text-gray-700">Password</Label>
          <Input
            id="signup-password"
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
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 rounded-lg text-base shadow-sm mt-4"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
        </Button>

        <div className="flex flex-col gap-4 text-sm mt-6">
          <div className="flex justify-center items-center gap-2">
            <span className="text-gray-400">Already have an account?</span>
            <button 
              type="button" 
              onClick={onToggleForm}
              className="text-[#2563eb] font-bold hover:underline transition-colors"
            >
              Log in
            </button>
          </div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Or sign up with google
          </span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <Button 
          type="button" 
          variant="ghost" 
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-lg text-gray-500 font-semibold gap-3 hover:bg-gray-50 border border-gray-100"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          Sign up with Google
        </Button>
      </form>
    </div>
  );
};
