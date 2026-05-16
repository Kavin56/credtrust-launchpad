import { useEffect } from "react";
import LandingHeader from "@/components/LandingHeader";
import GoogleTranslate from "@/components/GoogleTranslate";
import Ticker from "@/components/Ticker";
import HeroSection from "@/components/HeroSection";
import GoalsSection from "@/components/GoalsSection";
import ServicesSection from "@/components/ServicesSection";
import ProductsSection from "@/components/ProductsSection";
import CalculatorSection from "@/components/CalculatorSection";
import CTABanner from "@/components/CTABanner";
import DigitalBankingSection from "@/components/DigitalBankingSection";
import TeamSection from "@/components/TeamSection";
import HighlightsSection from "@/components/HighlightsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useAuth } from "@/modules/login/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialization checks removed
  }, [user, loading]);

  return (
    <div className="min-h-screen">
      <GoogleTranslate />
      <LandingHeader />
      <HeroSection />
      <GoalsSection />
      <ServicesSection />
      <ProductsSection />
      <CalculatorSection />
      <CTABanner />
      <DigitalBankingSection />
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
