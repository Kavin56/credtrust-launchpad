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
import { Plus } from 'lucide-react';
import { toast } from "sonner";

export const NewEntryDialog = () => {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("New entry recorded successfully");
    setOpen(false);
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
            <Label htmlFor="customer" className="text-zinc-400">Customer Name / ID</Label>
            <Select required>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="p1">PIGMY0001 - Priya Murugan</SelectItem>
                <SelectItem value="p2">PIGMY0002 - Ramesh R</SelectItem>
                <SelectItem value="p3">PIGMY0003 - Selvam K</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-400">Date</Label>
              <Input 
                id="date" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
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
                className="bg-zinc-900 border-zinc-800 text-white" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-zinc-400">Mode of Payment</Label>
            <Select defaultValue="CASH">
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="CASH">Cash on Hand</SelectItem>
                <SelectItem value="QR_CODE">QR Code (Direct)</SelectItem>
                <SelectItem value="UPI">UPI Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
