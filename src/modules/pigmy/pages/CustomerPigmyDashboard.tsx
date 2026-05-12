import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PigmyQRCode } from '../components/PigmyQRCode';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, Calendar, Info, Download, CreditCard, 
  UserCircle, BarChart3, Receipt, Timer, Star
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PayNowDialog } from '../components/PayNowDialog';

const CustomerPigmyDashboard = () => {
  const [history, setHistory] = React.useState([
    { name: 'Priya Murugan', date: '2026-05-12', amount: 100, method: 'CASH', status: 'PAID' },
    { name: 'Priya Murugan', date: '2026-05-11', amount: 100, method: 'QR_CODE', status: 'PAID' },
    { name: 'Priya Murugan', date: '2026-05-10', amount: 100, method: 'CASH', status: 'PAID' },
  ]);

  const accountData = {
    accountNumber: "PIGMY0001",
    customerName: "Priya Murugan",
    balance: 3200 + history.reduce((acc, curr) => acc + (curr.date === '2026-05-12' ? 0 : 0), 0), // Base balance simulation
    interestEarned: 96,
    paidDays: 32 + (history.length - 3),
    totalDays: 365,
    streak: 12 + (history.length - 3),
    maturityDate: "2026-12-15",
  };

  const handlePaymentSuccess = (newPayment: any) => {
    setHistory([newPayment, ...history]);
  };

  const progress = (accountData.paidDays / accountData.totalDays) * 100;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen selection:bg-blue-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight flex items-center gap-3">
             <Star className="h-8 w-8 text-blue-600 fill-blue-600" /> My Pigmy Savings
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Hello, {accountData.customerName}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button variant="outline" className="flex-1 md:flex-none gap-2 font-bold border-slate-200">
              <Download className="h-4 w-4" /> View Statement
           </Button>
           <PayNowDialog 
             customerName={accountData.customerName} 
             onSuccess={handlePaymentSuccess} 
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: QR & Status */}
        <div className="lg:col-span-1 space-y-6">
           <PigmyQRCode 
              accountNumber={accountData.accountNumber} 
              customerName={accountData.customerName} 
           />
           
           <Card className="bg-blue-900 text-white border-none shadow-2xl shadow-blue-200 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
             <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase opacity-60 tracking-widest">Savings Balance</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-4xl font-black">₹{accountData.balance.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-white/10 rounded-xl">
                   <TrendingUp className="h-4 w-4 text-emerald-400" />
                   <span className="text-xs font-bold">₹{accountData.interestEarned} earned so far</span>
                </div>
                <Button variant="ghost" className="w-full mt-4 text-[10px] font-black uppercase text-blue-200 hover:bg-white/5 hover:text-white" onClick={() => toast.info("Interest history feature coming soon!")}>
                   View Interest History
                </Button>
             </CardContent>
           </Card>

           <Button variant="outline" className="w-full h-12 border-slate-200 text-slate-600 font-bold gap-2" onClick={() => toast.info("Profile update is restricted by Admin.")}>
              <UserCircle className="h-5 w-5" /> Update Profile
           </Button>
        </div>

        {/* Center/Right Column: Analytics */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                 </div>
                 <CardTitle className="text-lg">Deposit Progress</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                 <div className="text-right mr-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</p>
                    <p className="text-lg font-black text-blue-600">{accountData.streak} Days 🔥</p>
                 </div>
                 <Badge className="bg-blue-600 text-white border-none font-black text-sm px-3 py-1">{Math.round(progress)}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                 <Progress value={progress} className="h-5 bg-blue-50" />
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Deposit Started</span>
                    <span>Target: 365 Days</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Paid Days</p>
                    <p className="text-2xl font-black text-blue-900">{accountData.paidDays}</p>
                 </div>
                 <div className="p-5 bg-rose-50 rounded-2xl text-center border border-rose-100">
                    <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest mb-1">Missed</p>
                    <p className="text-2xl font-black text-rose-600">3</p>
                 </div>
                 <div className="p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Remaining</p>
                    <p className="text-2xl font-black text-slate-700">{accountData.totalDays - accountData.paidDays}</p>
                 </div>
                 <div className="p-5 bg-blue-900 rounded-2xl text-center border border-blue-800 shadow-lg shadow-blue-100">
                    <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1">Maturity</p>
                    <p className="text-sm font-black text-white">Dec 15, 2026</p>
                 </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                 <div className="bg-amber-100 p-2 rounded-xl h-fit">
                    <Timer className="h-5 w-5 text-amber-600" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tight">Maturity Prediction Engine</h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">Your interest is calculated at 3% for every completed 6 months. Estimated maturity value: <span className="font-black text-slate-900">₹38,250.00</span></p>
                    <Button variant="link" className="p-0 h-auto text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">
                       Track Maturity Details
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-slate-100 p-2 rounded-xl">
                    <Receipt className="h-5 w-5 text-slate-600" />
                 </div>
                 <CardTitle className="text-lg">Payment History</CardTitle>
              </div>
              <Button variant="ghost" className="text-blue-600 text-xs font-bold" onClick={() => toast.success("History Exported to PDF")}>Export PDF</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payer Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item, i) => (
                    <TableRow key={i} className="group transition-colors">
                      <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                      <TableCell className="flex items-center gap-2 font-bold text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {item.date}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">
                           {item.method === 'CASH' ? 'Cash on Hand' : item.method.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.status}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900">₹{item.amount}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors">
                            <Download className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerPigmyDashboard;
