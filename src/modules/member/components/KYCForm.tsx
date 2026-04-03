import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Upload, 
  CreditCard, 
  User,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const KYCForm = () => {
  const [step, setStep] = useState(1);
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRel, setNomineeRel] = useState("");
  const [nomineePhone, setNomineePhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const uploadIfPresent = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await api.post("/members/me/kyc/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.patch("/members/me/kyc", { status: "UNDER_REVIEW" }).catch(() => {});
      await uploadIfPresent(frontFile);
      await uploadIfPresent(backFile);
      await uploadIfPresent(addressFile);
      toast.success("KYC submitted for verification");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      <main className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-[#1a1f36] mb-2">Member KYC Verification</h1>
            <p className="text-gray-500">Step {step} of 3: {
              step === 1 ? "Personal Identity" : step === 2 ? "Address Proof" : "Nominee Details"
            }</p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-[#c9a84c]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                      <CreditCard className="text-blue-600 w-6 h-6" />
                      <p className="text-sm text-blue-800">Please provide your Aadhaar or PAN details.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>ID Type</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                           <option>Aadhaar Card</option>
                           <option>PAN Card</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>ID Number</Label>
                        <Input placeholder="Enter Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Upload Front</Label>
                          <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer block">
                            <Upload className="w-4 h-4 mx-auto mb-2 text-gray-400" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">Choose File</span>
                            <input type="file" className="hidden" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                        <div className="space-y-2">
                          <Label>Upload Back</Label>
                          <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer block">
                            <Upload className="w-4 h-4 mx-auto mb-2 text-gray-400" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">Choose File</span>
                            <input type="file" className="hidden" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Current Residential Address</Label>
                        <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Street, City, State, Pincode" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Address Proof Document</Label>
                        <label className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer block">
                          <ImageIcon className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium text-gray-600">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-400 mt-1">Utility Bill, Rental Agreement, or Voter ID</p>
                          <input type="file" className="hidden" onChange={(e) => setAddressFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-6 flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                      <p className="text-sm text-emerald-800">Final step: Nominee information for the account.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nominee Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <Input className="pl-10" placeholder="Relative's Name" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Relationship</Label>
                          <Input placeholder="e.g. Spouse" value={nomineeRel} onChange={(e) => setNomineeRel(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Nominee Phone</Label>
                          <Input placeholder="+91" value={nomineePhone} onChange={(e) => setNomineePhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <Button variant="ghost" onClick={handleBack} className="text-gray-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : <div />}
                
                {step < 3 ? (
                  <Button onClick={handleNext} className="bg-[#1a1f36] text-white px-8">
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading} className="bg-[#c9a84c] hover:bg-[#d4b65c] text-white px-10 font-bold">
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default KYCForm;
