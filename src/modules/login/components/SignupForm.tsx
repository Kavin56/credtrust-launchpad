import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
const provider = import.meta.env.VITE_AUTH_PROVIDER || "api";

interface SignupFormProps {
  onToggleForm: () => void;
}

export const SignupForm = ({ onToggleForm }: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (provider === "firebase") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await api.post("/auth/register", {
          email,
          password,
          fullName,
          contact,
          address,
          dob,
          role: "MEMBER",
        });
      }
      toast.success("Account created. Please log in.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <h1 className="text-3xl font-bold text-[#1a1f36] mb-8">Sign up</h1>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">Full Name</Label>
          <Input
            id="signup-name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-contact" className="text-sm font-medium text-gray-700">Contact</Label>
          <Input
            id="signup-contact"
            placeholder="+91-99999-99999"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-dob" className="text-sm font-medium text-gray-700">Date of Birth</Label>
          <Input
            id="signup-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-address" className="text-sm font-medium text-gray-700">Address</Label>
          <Input
            id="signup-address"
            placeholder="Street, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="h-12 bg-[#edf2ff] border-transparent focus:bg-white focus:border-[#2563eb] transition-all rounded-lg"
          />
        </div>

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
      </form>
    </div>
  );
};
