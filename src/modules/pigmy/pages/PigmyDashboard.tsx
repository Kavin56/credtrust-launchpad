import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PigmyStats } from '../components/PigmyStats';
import { PigmyCharts } from '../components/PigmyCharts';
import { PigmySidebar } from '../components/PigmySidebar';
import { NewEntryDialog } from '../components/NewEntryDialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Download, Search, Bell, User, Calendar, Filter, ChevronDown, RefreshCw,
  UserPlus, ShieldCheck, Database, Landmark, ShieldAlert, Calculator
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const PigmyDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['pigmy-stats'],
    queryFn: async () => {
      const res = await api.get('/pigmy/stats');
      return res.data;
    }
  });

  const recentCollections = [
    { id: '1', accountNumber: 'PIGMY0001', customer: 'Priya Murugan', amount: 100, date: '2026-05-12', method: 'CASH', status: 'PAID' },
    { id: '2', accountNumber: 'PIGMY0002', customer: 'Ramesh R', amount: 500, date: '2026-05-12', method: 'QR_CODE', status: 'PAID' },
    { id: '3', accountNumber: 'PIGMY0003', customer: 'Selvam K', amount: 100, date: '2026-05-11', method: 'CASH', status: 'PENDING' },
    { id: '4', accountNumber: 'PIGMY0001', customer: 'Priya Murugan', amount: 100, date: '2026-05-11', method: 'CASH', status: 'PAID' },
  ];

  return (
    <div className="flex min-h-screen bg-black font-sans selection:bg-blue-500/30">
      <PigmySidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
              <span className="text-blue-500">—</span> Overview & Analytics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
               <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 text-xs font-bold" onClick={() => navigate('/admin/pigmy/maturity')}>
                  <ShieldAlert className="h-4 w-4" /> Approve Withdrawal
               </Button>
               <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 text-xs font-bold">
                  <Calculator className="h-4 w-4" /> Calculate Interest
               </Button>
               <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 text-xs font-bold">
                  <Download className="h-4 w-4" /> Export
               </Button>
               <NewEntryDialog />
            </div>

            <div className="flex items-center gap-2 ml-4">
               <button className="relative p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-zinc-900"></span>
               </button>
               <button className="p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black text-blue-900">
                    AD
                  </div>
               </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search by ID, Name or Phone..." 
                className="bg-zinc-950 border-zinc-800 pl-10 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-blue-500"
              />
           </div>
           <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/admin/pigmy/add-customer')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs font-bold">
                <UserPlus className="h-4 w-4" /> Add Customer
              </Button>
              <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 gap-2 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" /> Add Agent
              </Button>
              <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 gap-2 text-xs font-bold">
                <Landmark className="h-4 w-4" /> Manage Branch
              </Button>
              <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 gap-2 text-xs font-bold">
                <Database className="h-4 w-4" /> Backup Data
              </Button>
              <div className="h-8 w-px bg-zinc-800 mx-2" />
              <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 gap-2 text-xs">
                <Calendar className="h-4 w-4" /> May 12, 2026
              </Button>
              <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 gap-2 text-xs">
                <Filter className="h-4 w-4" /> Filters
              </Button>
              <Button size="icon" variant="ghost" className="text-zinc-500">
                 <RefreshCw className="h-4 w-4" />
              </Button>
           </div>
        </div>

        {/* Stats Grid */}
        {!statsLoading && stats ? (
          <PigmyStats 
            totalDeposits={stats.totalDeposits || 1480000} 
            totalWithdrawals={stats.totalWithdrawals || 0}
            activeAccounts={stats.activeAccounts || 248} 
            todayCollections={stats.todayCollections || 32500} 
            maturityAccounts={stats.maturityAccounts || 34}
            activeAgents={18}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {/* Charts Section */}
        <PigmyCharts />

        {/* Recent Transactions */}
        <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800">
            <div>
               <CardTitle className="text-lg">Recent Collections</CardTitle>
               <p className="text-xs text-zinc-500 mt-1">Showing latest 10 transactions</p>
            </div>
            <Button variant="ghost" className="text-blue-500 text-xs font-bold">View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-950/50">
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Customer</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Account ID</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Method</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                  <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCollections.map((item) => (
                  <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <TableCell className="text-xs font-medium text-zinc-400">{item.date}</TableCell>
                    <TableCell className="font-bold">{item.customer}</TableCell>
                    <TableCell>
                       <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{item.accountNumber}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-none font-bold text-[9px]">
                        {item.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full", 
                            item.status === 'PAID' ? "bg-emerald-500" : 
                            item.status === 'MISSED' ? "bg-rose-500" : 
                            "bg-amber-500"
                          )} />
                          <span className={cn(
                            "text-xs font-bold", 
                            item.status === 'PAID' ? "text-emerald-500" : 
                            item.status === 'MISSED' ? "text-rose-500" : 
                            "text-amber-500"
                          )}>
                            {item.status}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-white">
                      ₹{item.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Helper for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default PigmyDashboard;
