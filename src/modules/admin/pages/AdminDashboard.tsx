import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3, 
  Wallet, 
  ShieldCheck, 
  FileCheck, 
  TrendingUp, 
  AlertCircle,
  Building2,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const adminStats = [
    { title: "Total Members", value: "1,254", icon: Users, color: "text-blue-600", trend: "+12 this week" },
    { title: "Total Deposits", value: "₹45,85,000", icon: Wallet, color: "text-emerald-600", trend: "+ ₹2.4L growth" },
    { title: "Outstanding Loans", value: "₹28,40,000", icon: BarChart3, color: "text-amber-600", trend: "0.2% NPA rate" },
    { title: "Society Capital", value: "₹75,00,000", icon: Building2, color: "text-purple-600", trend: "Stable" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900">
              Management Overview
            </h1>
          </motion.div>

          <div className="flex gap-3">
            <Button className="bg-[#1a1f36] hover:bg-black text-white">
               Generate Reports
            </Button>
            <Button variant="outline" className="border-slate-200">
              Settings
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {adminStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Approvals */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pending Approvals</CardTitle>
                  <CardDescription>KYC and Loan requests awaiting verification</CardDescription>
                </div>
                <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  12 Pending
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Suresh Kumar", type: "KYC Verification", date: "2 hours ago", priority: "High" },
                    { name: "Priya Murugan", type: "Gold Loan", date: "5 hours ago", priority: "Medium" },
                    { name: "Velu Pillai", type: "KYC Verification", date: "1 day ago", priority: "Low" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                           {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.type} • {item.date}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-slate-400 text-xs hover:bg-transparent hover:text-slate-900">
                  Manage all applications
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Ledger Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <div className="flex flex-col items-center text-slate-400">
                    <TrendingUp className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Activity graph placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-[#1a1f36] text-white">
              <CardHeader>
                <CardTitle className="text-base">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Backup Status</span>
                    <span className="text-emerald-400">Optimal</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Security Patches</span>
                    <span className="text-blue-400">Up to date</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 w-[95%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-base">NPA Warnings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-4">
                   3 members have skipped EMIs for over 60 days. Recovery actions needed.
                </p>
                <Button variant="outline" className="w-full text-xs font-bold text-amber-600 border-amber-100 hover:bg-amber-50">
                   View Recovery List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
