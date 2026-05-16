import React from 'react';
import { 
  Dialog, DialogContent, DialogTrigger, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, AlertCircle, User, ShieldCheck, Smartphone, Building2, Wallet, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

interface PayNowDialogProps {
  accountId: string;
  customerName: string;
  onSuccess: () => void;
}

export const PayNowDialog: React.FC<PayNowDialogProps> = ({ accountId, customerName, onSuccess }) => {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  
  // Step 1 Form Data
  const [formData, setFormData] = React.useState({
    name: customerName,
    email: '',
    phone: '',
    amount: '500',
    description: 'Pigmy Deposit'
  });

  // Step 2 Data
  const [collectionId, setCollectionId] = React.useState('');
  const [referenceId, setReferenceId] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('UPI');

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setFormData(prev => ({ ...prev, name: customerName, amount: '500', description: 'Pigmy Deposit' }));
      setCollectionId('');
      setReferenceId('');
    }
  }, [open, customerName]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum < 100 || amountNum > 10000) {
      toast.error("Amount must be between ₹100 and ₹10,000");
      return;
    }

    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/pigmy/pay/initiate', {
        accountId,
        amount: amountNum,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        description: formData.description
      });
      
      setCollectionId(res.data.id);
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/pigmy/pay/confirm', {
        collectionId,
        referenceId: referenceId || undefined
      });
      
      toast.success("Payment Request Submitted!", {
        description: `₹${formData.amount} is now PENDING for admin approval.`
      });
      
      onSuccess();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setLoading(false);
    }
  };

  // Generate UPI URL
  const upiUrl = `upi://pay?pa=srirojashabarishgurujigmail.com@kbl&pn=CredTrust&am=${formData.amount}&cu=INR`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 md:flex-none bg-[#fcd34d] hover:bg-[#fbbf24] text-[#1a1f36] font-black gap-2 shadow-xl shadow-[#fcd34d]/20 h-11 rounded-2xl px-8 transition-all">
          <CreditCard className="h-4 w-4" /> Pay Now
        </Button>
      </DialogTrigger>
      
      <DialogContent className={step === 1 
        ? "sm:max-w-[425px] p-6 rounded-2xl bg-white border-slate-200" 
        : "max-w-[850px] p-0 overflow-hidden bg-white border-none rounded-xl flex h-[550px] shadow-2xl [&>button]:text-slate-400 [&>button]:right-4 [&>button]:top-4"
      }>
        <DialogTitle className="sr-only">Payment Options</DialogTitle>
        
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">Payment Details</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Please confirm your details to proceed.</p>
            </div>
            
            <form onSubmit={handleInitiate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Optional)</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</Label>
                <Input 
                  type="number"
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-lg text-blue-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                <Input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl mt-4 transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed to Pay"}
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <>
            {/* Left Pane - Blue */}
            <div className="w-[35%] bg-[#1a56db] text-white p-6 flex flex-col relative overflow-hidden">
              {/* Background Illustration Elements */}
              <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="50" y="100" width="40" height="100" fill="white"/>
                  <rect x="110" y="60" width="40" height="140" fill="white"/>
                  <circle cx="70" cy="80" r="20" fill="white"/>
                  <rect x="10" y="140" width="180" height="60" fill="white"/>
                </svg>
              </div>

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                    C
                  </div>
                  <span className="font-bold text-lg tracking-wide">CredTrust</span>
                </div>

                <div className="bg-white text-slate-900 rounded-xl p-5 mb-4 shadow-lg">
                  <p className="text-sm text-slate-500 font-medium mb-2">Price Summary</p>
                  <div className="flex items-center text-3xl font-black text-slate-800">
                    <span>₹</span>
                    <span className="ml-1">{formData.amount}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between text-sm border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 opacity-70" />
                    <span className="font-medium truncate max-w-[150px]">Using as {formData.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
              </div>

              <div className="relative z-10 text-xs text-white/70 flex items-center gap-1.5 mt-auto pt-4">
                Secured by <ShieldCheck className="w-4 h-4 text-white" /> <span className="font-bold text-white text-sm tracking-wide">CredTrust</span>
              </div>
            </div>
            
            {/* Right Pane */}
            <div className="w-[65%] flex flex-col bg-white">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">Payment Options</h2>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Payment Methods Sidebar */}
                <div className="w-[40%] bg-[#f8fafc] border-r border-slate-100 overflow-y-auto py-2">
                  <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended</div>
                  
                  <button 
                    onClick={() => setSelectedMethod('UPI')}
                    className={`w-full flex items-center justify-between px-4 py-4 transition-colors relative ${selectedMethod === 'UPI' ? 'bg-white shadow-sm' : 'hover:bg-slate-100'}`}
                  >
                    {selectedMethod === 'UPI' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a56db]"></div>}
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-5 h-5 ${selectedMethod === 'UPI' ? 'text-[#1a56db]' : 'text-slate-400'}`} />
                      <span className={`font-bold text-sm ${selectedMethod === 'UPI' ? 'text-[#1a56db]' : 'text-slate-600'}`}>UPI QR</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedMethod('Cards')}
                    className={`w-full flex items-center justify-between px-4 py-4 transition-colors relative ${selectedMethod === 'Cards' ? 'bg-white shadow-sm' : 'hover:bg-slate-100'}`}
                  >
                    {selectedMethod === 'Cards' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a56db]"></div>}
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${selectedMethod === 'Cards' ? 'text-[#1a56db]' : 'text-slate-400'}`} />
                      <span className={`font-bold text-sm ${selectedMethod === 'Cards' ? 'text-[#1a56db]' : 'text-slate-600'}`}>Cards</span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-100 transition-colors opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-sm text-slate-600">Netbanking</span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-100 transition-colors opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-sm text-slate-600">Wallet</span>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-100 transition-colors opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-sm text-slate-600">Pay Later</span>
                    </div>
                  </button>
                </div>
                
                {/* Payment Details */}
                <div className="w-[60%] p-6 flex flex-col bg-white overflow-y-auto">
                  {selectedMethod === 'UPI' ? (
                    <div className="flex flex-col h-full">
                      <h3 className="font-bold text-slate-800 mb-4">Scan to Pay via UPI</h3>
                      
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                          <QRCodeSVG 
                            value={upiUrl} 
                            size={180} 
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-sm text-slate-500 font-medium text-center">
                          Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to pay <span className="font-bold text-slate-800">₹{formData.amount}</span>
                        </p>
                        
                        <div className="w-full space-y-2">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">UTR / Reference ID (Optional)</Label>
                          <Input 
                            placeholder="e.g. 312345678901" 
                            value={referenceId}
                            onChange={e => setReferenceId(e.target.value)}
                            className="h-10 rounded-lg border-slate-200 focus:border-[#1a56db] focus:ring-[#1a56db]"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleConfirm} 
                        disabled={loading}
                        className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-base rounded-lg mt-6 transition-all gap-2"
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                          <>
                            <CheckCircle2 className="w-5 h-5" /> I have completed the payment
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                      <CreditCard className="w-12 h-12 text-slate-300" />
                      <div>
                        <h3 className="font-bold text-slate-600">Card Payments</h3>
                        <p className="text-sm text-slate-400 mt-1">Coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
