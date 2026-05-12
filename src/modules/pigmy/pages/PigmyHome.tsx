import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  PiggyBank, ArrowRight, ShieldCheck, TrendingUp, 
  Search, Smartphone, PhoneCall, HelpCircle, Info
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const PigmyHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <PiggyBank className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-blue-900 tracking-tighter">PigmyPro</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/about-pigmy" className="text-sm font-bold text-slate-600 hover:text-blue-600">View Schemes</Link>
            <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600">Contact Us</Link>
          </div>
          <div className="flex gap-3">
             <Button variant="ghost" className="font-bold" onClick={() => navigate('/login')}>Login</Button>
             <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => navigate('/signup')}>Register</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-1 rounded-full text-blue-700 text-xs font-black uppercase tracking-widest">
               <TrendingUp className="h-3 w-3" /> Growth Every Day
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
              Daily Savings for a <span className="text-blue-600">Brighter Future.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              Start your Pigmy deposit journey today. Save as little as ₹100 daily and earn up to 6% annual interest with our 3% semi-annual payouts.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
               <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl gap-2 shadow-xl shadow-blue-200">
                  Get Started Now <ArrowRight className="h-5 w-5" />
               </Button>
               <Button variant="outline" className="h-14 px-8 border-slate-200 text-lg font-bold rounded-2xl gap-2">
                  <Smartphone className="h-5 w-5" /> Download App
               </Button>
            </div>
          </div>
          <div className="relative">
             <img 
               src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=1770&auto=format&fit=crop" 
               alt="Financial Growth" 
               className="rounded-[40px] shadow-2xl border-8 border-white"
             />
             <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-blue-50 max-w-[200px]">
                <div className="text-3xl font-black text-blue-600">3%</div>
                <div className="text-sm font-bold text-slate-900">Interest Payout</div>
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Every 6 Months</div>
             </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">Quick Access Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Pay via QR", icon: Smartphone, color: "bg-blue-500", desc: "Scan and deposit instantly", path: "/dashboard/pigmy" },
            { title: "Search Customer", icon: Search, color: "bg-emerald-500", desc: "Find details using Unique ID", path: "/admin/pigmy" },
            { title: "View Schemes", icon: Info, color: "bg-orange-500", desc: "Explore daily deposit plans", path: "/about-pigmy" },
            { title: "Contact Support", icon: HelpCircle, color: "bg-purple-500", desc: "Need help? Reach us 24/7", path: "/contact" }
          ].map((service, i) => (
            <Card key={i} className="group cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all rounded-3xl overflow-hidden border-slate-100">
              <CardContent className="p-8">
                <div className={`${service.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                   <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-500 mb-6">{service.desc}</p>
                <Button variant="ghost" className="p-0 text-blue-600 font-bold hover:bg-transparent" onClick={() => navigate(service.path)}>
                   Access Now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 border-b border-slate-800 pb-12 mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <PiggyBank className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-black tracking-tighter text-white">PigmyPro</span>
             </div>
             <p className="text-slate-400 text-sm">Empowering micro-savings with cutting-edge digital solutions. Secure, scalable, and trusted.</p>
          </div>
          <div>
             <h4 className="font-bold mb-6">Quick Links</h4>
             <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/schemes" className="hover:text-blue-400">View All Schemes</Link></li>
                <li><Link to="/branches" className="hover:text-blue-400">Branch Locator</Link></li>
                <li><Link to="/faq" className="hover:text-blue-400">Interest Calculator</Link></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold mb-6">Contact Branch</h4>
             <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Licensed Cooperative Society</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-xs text-slate-500">
           © 2026 Sharanam Pigmy Deposit Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PigmyHome;
