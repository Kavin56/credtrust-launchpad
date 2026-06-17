import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LandingHeader from "@/components/LandingHeader";
import GoogleTranslate from "@/components/GoogleTranslate";
import Ticker from "@/components/Ticker";
import HeroSection from "@/components/HeroSection";
import GoalsSection from "@/components/GoalsSection";
import CalculatorSection from "@/components/CalculatorSection";
import CTABanner from "@/components/CTABanner";
import TeamSection from "@/components/TeamSection";
import HighlightsSection from "@/components/HighlightsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useAuth } from "@/modules/login/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-[400px] w-full text-center space-y-6"
        >
          <img 
            src="/logo.jpeg" 
            alt="Sri Roja Shabarish Guruji Logo" 
            className="w-72 h-72 object-contain mx-auto rounded-3xl shadow-2xl border-4 border-slate-50"
          />
          <div className="space-y-2">
            <h1 className="text-lg font-black text-[#1a1f36] uppercase tracking-tight leading-tight">
              Sri Roja Shabarish Guruji Souharada Sahakara Niyamitha
            </h1>
            <p className="text-[#6b21a8] text-xs font-black uppercase tracking-widest">
              Sharanam
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GoogleTranslate />
      <LandingHeader />
      <HeroSection />
      <GoalsSection />
      <CalculatorSection />
      <CTABanner />
      <TeamSection />
      <HighlightsSection />
      <TestimonialsSection />
      <Ticker />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
