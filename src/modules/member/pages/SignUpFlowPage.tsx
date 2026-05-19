import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/login/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Loader2, User, FileText, Sparkles } from 'lucide-react';

const SignUpFlowPage = () => {
  const { user, refreshProfileStatus } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(5);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    contact: '',
    address: '',
    state: '',
    district: '',
    country: 'India',
    pincode: '',
    aadhaarNumber: '',
    panNumber: '',
  });

  const [files, setFiles] = useState<{
    aadhaarDoc: File | null;
    panDoc: File | null;
  }>({
    aadhaarDoc: null,
    panDoc: null,
  });

  useEffect(() => {
    if (user?.hasMemberProfile && step < 3) {
      navigate('/dashboard');
    }
  }, [user, navigate, step]);

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: 'aadhaarDoc' | 'panDoc') => {
    if (e.target.files?.[0]) {
      setFiles({ ...files, [name]: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (files.aadhaarDoc) data.append('aadhaarDoc', files.aadhaarDoc);
      if (files.panDoc) data.append('panDoc', files.panDoc);

      await api.post('/members/complete-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refreshProfileStatus();
      setStep(3);
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const required = ['fullName', 'dob', 'gender', 'contact', 'address', 'state', 'district', 'pincode'];
      const missing = required.filter(f => !formData[f as keyof typeof formData]);
      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.join(', ')}`);
        return;
      }
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-white text-white flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-amber-50 border-amber-200 text-gray-900 shadow-2xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">Step 1 of 2</span>
                </div>
                <CardTitle className="text-3xl font-black italic">PROFILE DETAILS</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Tell us more about yourself to get started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-bold uppercase text-gray-500">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-xs font-bold uppercase text-gray-500">Date of Birth</Label>
                    <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs font-bold uppercase text-gray-500">Gender</Label>
                    <Select onValueChange={(v) => handleSelectChange('gender', v)}>
                      <SelectTrigger className="bg-amber-100 border-amber-200 font-medium">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-amber-200 text-gray-900">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-xs font-bold uppercase text-gray-500">Contact Number</Label>
                    <Input id="contact" placeholder="+91 98765 43210" value={formData.contact} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase text-gray-500">Full Address</Label>
                  <Input id="address" placeholder="123 Street, Area" value={formData.address} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-bold uppercase text-gray-500">State</Label>
                    <Input id="state" placeholder="Tamil Nadu" value={formData.state} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-xs font-bold uppercase text-gray-500">District</Label>
                    <Input id="district" placeholder="Chennai" value={formData.district} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs font-bold uppercase text-gray-500">Country</Label>
                    <Input id="country" value={formData.country} readOnly className="bg-amber-100/50 border-amber-200 text-gray-500 font-medium cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-xs font-bold uppercase text-gray-500">Pincode</Label>
                    <Input id="pincode" placeholder="600001" value={formData.pincode} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                  </div>
                </div>

                <Button onClick={nextStep} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black h-12 text-lg rounded-xl shadow-lg shadow-amber-500/20 group">
                  CONTINUE TO KYC
                  <Loader2 className={`ml-2 h-5 w-5 animate-spin ${loading ? 'block' : 'hidden'}`} />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl"
          >
            <Card className="bg-amber-50 border-amber-200 text-gray-900 shadow-2xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">Step 2 of 2</span>
                </div>
                <CardTitle className="text-3xl font-black italic uppercase">KYC DOCUMENTS</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Verify your identity by providing your card details and documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber" className="text-xs font-bold uppercase text-gray-500">Aadhar Card Number</Label>
                    <Input id="aadhaarNumber" placeholder="XXXX XXXX XXXX" value={formData.aadhaarNumber} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                    <div className="mt-2">
                      <label htmlFor="aadhaarDoc" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/50 hover:border-amber-500 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 text-gray-500 mb-2 group-hover:text-amber-500 transition-colors" />
                          <p className="text-sm text-gray-500 font-medium">
                            {files.aadhaarDoc ? files.aadhaarDoc.name : 'Upload Aadhar PDF/Image'}
                          </p>
                        </div>
                        <input id="aadhaarDoc" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'aadhaarDoc')} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber" className="text-xs font-bold uppercase text-gray-500">PAN Card Number</Label>
                    <Input id="panNumber" placeholder="ABCDE1234F" value={formData.panNumber} onChange={handleInputChange} className="bg-amber-100 border-amber-200 focus:border-amber-500 transition-all font-medium" />
                    <div className="mt-2">
                      <label htmlFor="panDoc" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/50 hover:border-amber-500 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 text-gray-500 mb-2 group-hover:text-amber-500 transition-colors" />
                          <p className="text-sm text-gray-500 font-medium">
                            {files.panDoc ? files.panDoc.name : 'Upload PAN PDF/Image'}
                          </p>
                        </div>
                        <input id="panDoc" type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'panDoc')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 border border-amber-200 hover:bg-amber-100 font-bold h-12 rounded-xl">BACK</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-black h-12 text-lg rounded-xl shadow-lg shadow-amber-500/20">
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'COMPLETE REGISTRATION'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
              <div className="bg-amber-50 border-4 border-amber-500/50 p-8 rounded-full relative">
                <Sparkles className="w-20 h-20 text-amber-500 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                Welcome to <span className="text-amber-500">Saranam</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium">
                We are setting up your personalized dashboard...
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-2 bg-amber-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Entering in {timer} seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUpFlowPage;
