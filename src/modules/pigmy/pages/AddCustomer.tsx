import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  UserPlus, Upload, RefreshCw, Save, XCircle, Camera, Fingerprint 
} from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar';
import api from '@/lib/api';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    aadhaar: '',
    address: '',
    nominee: '',
    scheme: '',
    amount: '',
    registeredId: '',
    startDate: '',
    endDate: '',
    monthlyPaymentDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await api.get('/pigmy/schemes');
        setSchemes(res.data);
      } catch (err) {
        console.error("Failed to fetch schemes", err);
      }
    };
    fetchSchemes();
  }, []);

  const generateId = () => {
    const nextId = "PIGMY" + Math.floor(1000 + Math.random() * 9000);
    setId(nextId);
    toast.info("ID Generated: " + nextId);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.registeredId.trim()) {
      toast.error("Registered ID is required");
      return;
    }
    const start = new Date(customerData.startDate);
    const end = new Date(customerData.endDate);
    if (end < start) {
      toast.error("End Date cannot be earlier than Start Date");
      return;
    }
    setLoading(true);
    try {
      // 1. Register the member first (local Prisma record)
      const regRes = await api.post('/auth/register', {
        email: customerData.email,
        password: `Pigmy@${customerData.mobile.slice(-4)}`, // Default password
        fullName: customerData.fullName,
        contact: customerData.mobile,
        address: customerData.address,
        dob: customerData.dob,
        aadhaarNumber: customerData.aadhaar,
        panNumber: `PAN${customerData.mobile.slice(-6)}`, // Placeholder
        role: 'MEMBER'
      });

      const memberId = regRes.data.userId || regRes.data.sub; // Adjust based on API response

      // 2. Enroll in Pigmy scheme
      await api.post('/pigmy/enroll', {
        memberId: regRes.data.userId || regRes.data.sub,
        schemeId: customerData.scheme,
        startDate: customerData.startDate,
        endDate: customerData.endDate,
        monthlyPaymentDate: customerData.monthlyPaymentDate,
        registeredId: customerData.registeredId,
        status: 'ACTIVE'
      });

      toast.success("Customer Enrolled Successfully", {
        description: `${customerData.fullName} assigned to ${customerData.registeredId}`
      });
      navigate('/admin/pigmy/requests');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to enroll customer");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomerData({
      fullName: '',
      mobile: '',
      email: '',
      dob: '',
      aadhaar: '',
      address: '',
      nominee: '',
      scheme: '',
      amount: ''
    });
    setId("PIGMYXXXX");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <AdminNavbar />
      
      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
             <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Enrollment</h1>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Photos & ID */}
        <div className="space-y-6">
           <Card className="border-2 border-dashed border-slate-200 shadow-none hover:border-blue-300 transition-colors">
              <CardContent className="p-10 flex flex-col items-center text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative group cursor-pointer">
                    <Camera className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black text-white uppercase transition-opacity">
                       Upload
                    </div>
                 </div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Photo</p>
                 <Button type="button" variant="ghost" size="sm" className="mt-2 text-blue-600 text-xs">Capture from Webcam</Button>
              </CardContent>
           </Card>

            <Card className="border border-slate-100 bg-white shadow-sm rounded-3xl">
               <CardContent className="p-6 space-y-4 text-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Scheduling</h3>
                  
                  <div className="space-y-2">
                     <Label className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-500">
                        Registered ID <span className="text-red-500 font-black">*</span>
                     </Label>
                     <Input 
                        required 
                        placeholder="Enter Registered ID (e.g. 001)" 
                        value={customerData.registeredId} 
                        onChange={e => setCustomerData({...customerData, registeredId: e.target.value})} 
                        className="h-12 rounded-xl"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-500">
                        Start Date <span className="text-red-500 font-black">*</span>
                     </Label>
                     <Input 
                        required 
                        type="date"
                        value={customerData.startDate} 
                        onChange={e => setCustomerData({...customerData, startDate: e.target.value})} 
                        className="h-12 rounded-xl"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-500">
                        End Date <span className="text-red-500 font-black">*</span>
                     </Label>
                     <Input 
                        required 
                        type="date"
                        value={customerData.endDate} 
                        onChange={e => setCustomerData({...customerData, endDate: e.target.value})} 
                        className="h-12 rounded-xl"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-slate-500">
                        Monthly Payment Date <span className="text-red-500 font-black">*</span>
                     </Label>
                     <select
                       value={customerData.monthlyPaymentDate}
                       onChange={e => setCustomerData({...customerData, monthlyPaymentDate: e.target.value})}
                       className="w-full border border-slate-200 rounded-xl h-12 px-3 text-sm bg-white"
                       required
                     >
                       <option value="">Select Monthly Date</option>
                       {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(day => (
                         <option key={day} value={day}>{day}</option>
                       ))}
                     </select>
                  </div>
               </CardContent>
            </Card>

           <div className="grid grid-cols-1 gap-2">
              <Button type="button" variant="outline" className="w-full gap-2 border-slate-200 h-12 text-sm font-bold">
                 <Upload className="h-4 w-4" /> Upload Aadhaar
              </Button>
              <Button type="button" variant="outline" className="w-full gap-2 border-slate-200 h-12 text-sm font-bold">
                 <Fingerprint className="h-4 w-4" /> Generate QR Code
              </Button>
           </div>
        </div>

        {/* Right: Personal Details */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-lg">
              <CardHeader>
                 <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Full Name</Label>
                       <Input required placeholder="e.g. Priya Murugan" value={customerData.fullName} onChange={e => setCustomerData({...customerData, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label>Mobile Number</Label>
                       <Input required placeholder="+91 XXXXX XXXXX" value={customerData.mobile} onChange={e => setCustomerData({...customerData, mobile: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Email Address</Label>
                       <Input required type="email" placeholder="priya@example.com" value={customerData.email} onChange={e => setCustomerData({...customerData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label>Date of Birth</Label>
                       <Input required type="date" value={customerData.dob} onChange={e => setCustomerData({...customerData, dob: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label>Aadhaar Number</Label>
                       <Input required placeholder="XXXX XXXX XXXX" value={customerData.aadhaar} onChange={e => setCustomerData({...customerData, aadhaar: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <Label>Nominee Details</Label>
                       <Input required placeholder="Name & Relation" value={customerData.nominee} onChange={e => setCustomerData({...customerData, nominee: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>Communication Address</Label>
                    <Textarea required placeholder="Full residential address" value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} />
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                       <Label>Select Scheme</Label>
                       <Select required onValueChange={v => setCustomerData({...customerData, scheme: v})}>
                          <SelectTrigger>
                             <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                          <SelectContent>
                             {schemes.map(s => (
                               <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>
                             ))}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label>Daily Deposit Amount (₹)</Label>
                       <Input required type="number" placeholder="Min ₹100" value={customerData.amount} onChange={e => setCustomerData({...customerData, amount: e.target.value})} />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex-1 h-14 font-bold text-slate-500 gap-2" onClick={handleReset}>
                 <XCircle className="h-5 w-5" /> Reset
              </Button>
              <Button type="submit" className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 font-bold text-lg gap-2 shadow-xl shadow-blue-100" disabled={loading}>
                 {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                 Save Customer Profile
              </Button>
           </div>
        </div>
      </form>
    </div>
  </div>
  );
};

export default AddCustomer;
