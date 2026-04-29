import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "../AuthContext";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset link sent! Please check your inbox.");
      onBack(); // Go back to login after successful send
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-4">Reset Password</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="test@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 rounded-lg text-base shadow-sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
        </Button>

        <div className="flex justify-center text-sm">
          <button 
            type="button" 
            onClick={onBack}
            className="text-gray-500 hover:text-[#2563eb] transition-colors flex items-center gap-2"
          >
            ← Back to Log in
          </button>
        </div>
      </form>
    </div>
  );
};
