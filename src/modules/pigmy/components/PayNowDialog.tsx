import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface PayNowDialogProps {
  customerName: string;
  onSuccess: (newPayment: any) => void;
}

export const PayNowDialog: React.FC<PayNowDialogProps> = ({ customerName, onSuccess }) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: customerName,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    mode: 'UPI'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const newPayment = {
        name: formData.name,
        date: formData.date,
        amount: parseFloat(formData.amount),
        method: formData.mode,
        status: 'PAID'
      };
      
      onSuccess(newPayment);
      toast.success("Payment Successful!", {
        description: `₹${formData.amount} deposited via ${formData.mode}`
      });
      
      setLoading(false);
      setOpen(false);
      setFormData({ ...formData, amount: '' });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-xl shadow-blue-100">
          <CreditCard className="h-4 w-4" /> Pay Now
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-blue-900">Make Pigmy Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-black uppercase text-slate-400">Payer Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-slate-50 border-slate-200 font-bold" 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-black uppercase text-slate-400">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-slate-50 border-slate-200 font-bold" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-black uppercase text-slate-400">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="bg-slate-50 border-slate-200 font-black text-blue-600" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400">Mode of Payment</Label>
            <Select 
              value={formData.mode} 
              onValueChange={(v) => setFormData({...formData, mode: v})}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200 font-bold">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash on Hand</SelectItem>
                <SelectItem value="UPI">UPI (GPay/PhonePe)</SelectItem>
                <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="QR_CODE">QR Code Scan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-bold text-slate-400">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-black text-lg h-12" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
