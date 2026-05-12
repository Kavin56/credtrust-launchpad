import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, XCircle, DollarSign, Calculator, FileText, 
  ArrowRight, ShieldAlert, History
} from 'lucide-react';
import { toast } from "sonner";

const MaturityProcess = () => {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);

  // Mock data for a maturity request
  const request = {
    id: "REQ9921",
    customer: "Priya Murugan",
    accountId: "PIGMY0001",
    principal: 3200,
    interestRate: 6, // annual (3% every 6 months)
    daysPaid: 365,
    status: "PENDING_VERIFICATION"
  };

  const interestAmount = (request.principal * 0.06);
  const totalAmount = request.principal + interestAmount;

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Withdrawal Approved", {
        description: `Amount ₹${totalAmount} released to bank account.`
      });
      setProcessed(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl">
             <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Withdrawal / Maturity Portal</h1>
        </div>
        <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold uppercase py-1 px-4">
           Maturity Workflow
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {/* Request Details */}
           <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg">Processing Request #{request.id}</CardTitle>
                 <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase">
                    {request.status.replace('_', ' ')}
                 </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase mb-1">Customer</p>
                       <p className="text-lg font-bold text-slate-900">{request.customer}</p>
                       <p className="text-sm text-blue-600 font-bold">{request.accountId}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-400 uppercase mb-1">Tenure Completed</p>
                       <p className="text-lg font-bold text-slate-900">{request.daysPaid} Days</p>
                       <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> 100% Target Reached
                       </p>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                       <span className="text-slate-500 font-medium">Total Principal Amount</span>
                       <span className="text-xl font-bold text-slate-900">₹{request.principal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                       <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Interest (Rule: 3% / 6mo)</span>
                          <Badge variant="outline" className="text-[9px] font-black text-blue-600 border-blue-200">BONUS ACTIVE</Badge>
                       </div>
                       <span className="text-xl font-bold text-emerald-600">+ ₹{interestAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-slate-900 font-black text-lg uppercase tracking-tight">Total Maturity Amount</span>
                       <span className="text-3xl font-black text-blue-700">₹{totalAmount.toLocaleString()}</span>
                    </div>
                 </div>

                 {!processed ? (
                    <div className="flex gap-4 pt-6">
                       <Button variant="outline" className="flex-1 h-14 font-bold text-rose-600 border-rose-100 hover:bg-rose-50 gap-2">
                          <XCircle className="h-5 w-5" /> Reject Request
                       </Button>
                       <Button className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 font-bold text-lg gap-2" onClick={handleApprove} disabled={loading}>
                          {loading ? "Verifying Details..." : <><CheckCircle className="h-5 w-5" /> Approve & Release Payment</>}
                       </Button>
                    </div>
                 ) : (
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center space-y-3">
                       <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-10 w-10 text-emerald-600" />
                       </div>
                       <h3 className="text-xl font-black text-emerald-900">Maturity Successfully Released</h3>
                       <p className="text-sm text-emerald-700 max-w-xs">Transaction ID #TXN8827119 has been processed. SMS confirmation sent to the customer.</p>
                       <div className="flex gap-2 pt-4">
                          <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 bg-white">
                             <FileText className="h-4 w-4" /> Download Voucher
                          </Button>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-lg bg-slate-900 text-white">
              <CardHeader>
                 <CardTitle className="text-sm uppercase tracking-widest opacity-60">Interest Engine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-start gap-4">
                    <Calculator className="h-10 w-10 text-blue-400 shrink-0" />
                    <div>
                       <p className="text-lg font-bold">Auto-Prediction</p>
                       <p className="text-xs text-slate-400">Based on semi-annual rule system</p>
                    </div>
                 </div>
                 <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm">
                       <span className="opacity-60">Rule Consistency</span>
                       <span className="text-blue-400">Stable (3.0%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-full" />
                    </div>
                 </div>
                 <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold gap-2">
                    <History className="h-4 w-4" /> View Interest Logs
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-lg border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                 <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-sm uppercase font-black">Audit Warning</CardTitle>
                 </div>
              </CardHeader>
              <CardContent>
                 <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Ensure Aadhaar verification is complete before releasing the maturity amount. Penalty of 1.5% applies if withdrawn before 180 days.
                 </p>
                 <Button variant="link" className="p-0 h-auto text-blue-600 text-xs font-bold mt-2">
                    View Compliance Rules <ArrowRight className="h-3 w-3 ml-1" />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default MaturityProcess;
