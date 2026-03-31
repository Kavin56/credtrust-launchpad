import Header from "@/components/Header";
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

const Index = () => (
  <div className="min-h-screen">
    <Header />
    <HeroSection />
    <GoalsSection />
    <ServicesSection />
    <ProductsSection />
    <CalculatorSection />
    <CTABanner />
    <DigitalBankingSection />
    <TestimonialsSection />
    <Footer />
    <ChatWidget />
  </div>
);

export default Index;
