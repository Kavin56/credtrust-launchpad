import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  TrendingUp,
  Landmark,
  BadgePercent
} from 'lucide-react';
import { products } from '../data/products';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ProductDetailPage = () => {
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const product = products[slug as string];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6">
           <h1 className="text-4xl font-black text-[#1a1f36]">Product Not Found</h1>
           <p className="text-gray-500">The product you are looking for does not exist or has been moved.</p>
           <Button onClick={() => navigate('/dashboard')} className="h-14 px-10 bg-[#1a1f36] rounded-2xl">
              Back to Dashboard
           </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = product.icon;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      {/* BREADCRUMB */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[12px] text-gray-400 font-bold uppercase tracking-wider">
          <Link to="/dashboard" className="hover:text-[#6b21a8] transition-colors"><Home className="w-3.5 h-3.5" /></Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/${product.category.toLowerCase()}`} className="hover:text-[#6b21a8] transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-black">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* LEFT CONTENT */}
           <div className="flex-grow space-y-12">
              
              {/* HERO SECTION */}
              <section className={`rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl ${product.theme}`}>
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                 <div className="relative z-10 space-y-8 max-w-2xl">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
                       <ArrowLeft className="w-4 h-4" />
                       Go Back
                    </button>
                    <div className="space-y-4">
                       <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center border border-white/10 shadow-inner">
                          <Icon className="w-10 h-10 text-[#c9a84c]" />
                       </div>
                       <h1 className="text-5xl font-black leading-tight tracking-tighter">{product.title}</h1>
                       <p className="text-xl text-white/60 font-medium leading-relaxed">{product.desc}</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                       <Button className="h-14 px-10 bg-[#c9a84c] text-[#1a1f36] rounded-2xl font-black hover:bg-white hover:shadow-2xl transition-all">
                          {product.cta}
                       </Button>
                       <Button variant="outline" className="h-14 px-10 border-white/20 text-white rounded-2xl font-bold bg-white/5 backdrop-blur-sm">
                          Talk to Representative
                       </Button>
                    </div>
                 </div>
              </section>

              {/* BENEFITS GRID */}
              <section className="space-y-8">
                 <h2 className="text-2xl font-black text-[#1a1f36] px-2 uppercase tracking-tighter">Key Benefits & Features</h2>
                 <div className="grid md:grid-cols-2 gap-6">
                    {product.benefits.map((benefit, i) => (
                       <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 flex items-start gap-6 group hover:border-[#6b21a8] transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${product.theme.replace('bg-', 'bg-opacity-10 text-')} text-current`}>
                             <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <p className="text-[15px] font-bold text-[#1a1f36] leading-relaxed pt-2">{benefit}</p>
                       </div>
                    ))}
                 </div>
              </section>

              {/* ELIGIBILITY & DOCS */}
              <section className="bg-white rounded-[48px] border border-gray-100 overflow-hidden shadow-sm">
                 <div className="grid md:grid-cols-2">
                    <div className="p-12 space-y-8 border-r border-gray-50">
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-[#1a1f36]">Who Can Apply?</h3>
                          <p className="text-sm text-gray-400 font-medium">Standard eligibility criteria for {product.title}</p>
                       </div>
                       <ul className="space-y-4">
                          {product.eligibility.map((item, i) => (
                             <li key={i} className="flex items-center gap-4 text-[14px] font-bold text-gray-700">
                                <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                    <div className="p-12 bg-gray-50/50 space-y-8">
                       <div className="space-y-2">
                          <h3 className="text-xl font-black text-[#1a1f36]">Documents Required</h3>
                          <p className="text-sm text-gray-400 font-medium">Keep these ready for instant processing</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          {['ID Proof', 'Address Proof', 'Last 3m Income', 'Photograph'].map((doc, i) => (
                             <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col items-center gap-3 text-center">
                                <HelpCircle className="w-5 h-5 text-gray-300" />
                                <span className="text-[11px] font-black uppercase text-[#1a1f36]">{doc}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </section>
           </div>

           {/* SIDEBAR */}
           <aside className="lg:w-[320px] shrink-0 space-y-8">
              <div className="bg-[#1a1f36] rounded-[48px] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
                 <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#c9a84c] shadow-inner">
                       <BadgePercent className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-xl font-bold">Limited Offer</h4>
                       <p className="text-[11px] text-white/40 uppercase tracking-widest font-black">Ends in 24 Hours</p>
                    </div>
                    <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                       Apply for {product.title} today and get **Zero Processing Fees** and an additional cashback of ₹500 on your first use.
                    </p>
                    <Button className="w-full h-12 bg-[#c9a84c] text-[#1a1f36] rounded-xl font-black hover:bg-white transition-all shadow-xl shadow-black/20">
                       Claim Offer Now
                    </Button>
                 </div>
              </div>

              <div className="bg-white rounded-[48px] border border-gray-100 p-8 space-y-8 shadow-sm">
                 <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest px-2">Related Support</h4>
                 <div className="space-y-4">
                    {[
                      { name: "How it works?", icon: Zap },
                      { name: "Terms & Conditions", icon: ShieldCheck },
                      { name: "Global Presence", icon: Landmark }
                    ].map((s, i) => (
                       <button key={i} className="w-full p-4 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-indigo-100 border border-transparent transition-all">
                          <div className="flex items-center gap-3">
                             <s.icon className="w-5 h-5 text-gray-300 group-hover:text-[#6b21a8]" />
                             <span className="text-[13px] font-bold text-[#1a1f36]">{s.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#6b21a8]" />
                       </button>
                    ))}
                 </div>
              </div>
           </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
