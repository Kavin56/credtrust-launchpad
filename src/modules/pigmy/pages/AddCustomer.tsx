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

const AddCustomer = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState({
    fullName: '',
    mobile: '',
    aadhaar: '',
    address: '',
    nominee: '',
    scheme: '',
    amount: ''
  });
  const [id, setId] = useState("PIGMYXXXX");
  const [loading, setLoading] = useState(false);

  const generateId = () => {
    const nextId = "PIGMY" + Math.floor(1000 + Math.random() * 9000);
    setId(nextId);
    toast.info("ID Generated: " + nextId);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === "PIGMYXXXX") {
      toast.error("Please generate a Unique ID first");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Customer Enrolled Successfully", {
        description: `${customerData.fullName} assigned to ${id}`
      });
      navigate('/admin/pigmy');
    }, 1500);
  };

  const handleReset = () => {
    setCustomerData({
      fullName: '',
      mobile: '',
      aadhaar: '',
      address: '',
      nominee: '',
      scheme: '',
      amount: ''
    });
    setId("PIGMYXXXX");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen">
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

           <Card className="bg-blue-900 text-white overflow-hidden shadow-xl shadow-blue-200">
              <CardContent className="p-6">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase opacity-60">System Generated ID</p>
                    <RefreshCw className="h-3 w-3 opacity-60 cursor-pointer hover:opacity-100" onClick={generateId} />
                 </div>
                 <div className="text-3xl font-black mb-1">{id}</div>
                 <Button type="button" variant="ghost" className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white text-xs border-none h-8" onClick={generateId}>
                    Generate New ID
                 </Button>
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
                             <SelectValue placeholder="Daily/Weekly/Monthly" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="daily">Daily Deposit (Gold)</SelectItem>
                             <SelectItem value="weekly">Weekly Savings (Micro)</SelectItem>
                             <SelectItem value="monthly">Monthly Growth (Fixed)</SelectItem>
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
  );
};

export default AddCustomer;
