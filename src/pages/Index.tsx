import { useEffect } from "react";
import LandingHeader from "@/components/LandingHeader";
import Ticker from "@/components/Ticker";
import HeroSection from "@/components/HeroSection";
import GoalsSection from "@/components/GoalsSection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import CalculatorSection from "@/components/CalculatorSection";
import CTABanner from "@/components/CTABanner";
import DigitalBankingSection from "@/components/DigitalBankingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const testConnection = async () => {
      console.log("Checking initialization...");
      
      // Firebase Check
      if (!loading) {
        console.log("Firebase Auth Initialized:", user ? `Logged in as ${user.email}` : "Not logged in");
      }

      // Supabase Check
      try {
        const { data, error } = await supabase.from('test_connection').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') { // Ignore missing table error
           console.log("Supabase Initialized (Handshake successful)");
        } else {
           console.log("Supabase Initialized");
        }
      } catch (e) {
        console.error("Supabase handshake failed:", e);
      }
    };

    testConnection();
  }, [user, loading]);

  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <GoalsSection />
      <ServicesSection />
      <ProductsSection />
      <CalculatorSection />
      <CTABanner />
      <DigitalBankingSection />
      <TestimonialsSection />
      <Ticker />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
