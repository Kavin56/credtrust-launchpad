import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Plus, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export const NewEntryDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    method: 'CASH',
    date: new Date().toISOString().split('T')[0]
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      const fetchAccounts = async () => {
        try {
          const res = await api.get('/pigmy/search?q='); // Get all/recent accounts
          setAccounts(res.data);
        } catch (err) {
          console.error("Failed to fetch accounts", err);
        }
      };
      fetchAccounts();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/pigmy/collection', {
        accountId: formData.accountId,
        amount: Number(formData.amount),
        method: formData.method,
        remarks: 'Direct Entry'
      });
      toast.success("New entry recorded successfully");
      queryClient.invalidateQueries(['pigmy-stats']);
      queryClient.invalidateQueries(['pigmy-collections-recent']);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-zinc-200 gap-2 font-bold">
          <Plus className="h-4 w-4" /> New Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Deposit Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-zinc-400">Select Customer / Account</Label>
            <Select required onValueChange={(val) => setFormData({ ...formData, accountId: val })}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.accountNumber} - {acc.member?.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-400">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-zinc-400">Amount Paid (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100" 
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-zinc-400">Mode of Payment</Label>
            <Select defaultValue="CASH" onValueChange={(val) => setFormData({ ...formData, method: val })}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="CASH">Cash on Hand</SelectItem>
                <SelectItem value="QR_CODE">QR Code (Direct)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
