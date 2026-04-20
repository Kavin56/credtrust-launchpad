import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationShowcase from "./NotificationShowcase";
import heroBanking from "@/assets/hero-banking.jpg";
import familyBanking from "@/assets/family-banking.jpg";
import professionalBanking from "@/assets/professional-banking.jpg";

const slides = [
  {
    image: heroBanking,
    title: "Drive Your Dreams with CredTrust Loans",
    subtitle: "Competitive rates starting at just 8.50%* p.a.",
    cta: "Know More",
  },
  {
    image: familyBanking,
    title: "Secure Your Family's Future Today",
    subtitle: "Smart savings & investment solutions for every goal.",
    cta: "Start Saving",
  },
  {
    image: professionalBanking,
    title: "Banking Built for Modern Professionals",
    subtitle: "Instant digital account opening in minutes.",
    cta: "Open Account",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative bg-muted overflow-hidden">
      <div className="container pt-10 pb-6 md:pt-14 md:pb-8 lg:pt-20 lg:pb-12">
        {/* Main Branding Title */}
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tight text-[#1a1f36] flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6">
              <span>ಶರಣಂ</span>
              <span className="text-primary font-light opacity-40 hidden md:block">|</span>
              <span className="text-primary font-light opacity-40 md:hidden">-</span>
              <span>Sharanam</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-light tracking-[0.2em] uppercase mt-4 opacity-80 italic">
              A Space of Refuge and Peace
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-8 rounded-full" />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[280px] md:min-h-[340px]">
          {/* Text content stays as is - demoted to h2 for SEO hierarchy */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-foreground leading-tight mb-4">
                {slide.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="btn-primary-banking text-base px-8">
                  {slide.cta}
                </a>
                <a href="#services" className="px-8 py-3 rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm text-foreground hover:bg-primary/5 transition-all text-sm font-semibold">
                  View All Services
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image content stays as is */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-full border-2 border-secondary/50 hidden lg:block" style={{ borderRadius: "40% 60% 55% 45% / 55% 45% 60% 40%" }} />
                <img
                  src={slide.image}
                  alt="Banking"
                  className="rounded-2xl w-full max-w-lg shadow-2xl object-cover aspect-[4/3]"
                  width={640}
                  height={480}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Slide Indicators */}
        <div className="flex justify-center gap-2 mt-8 mb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-6" : "bg-foreground/20"}`}
            />
          ))}
        </div>
      </div>

      {/* NEW: Smart Notification Showcase (Live Feed) */}
      <div className="relative z-20 -mt-2 bg-gradient-to-b from-transparent via-background/40 to-background/80 backdrop-blur-sm border-t border-white/10">
        <NotificationShowcase />
      </div>

      {/* Marquee remains at the very bottom */}
      <div className="marquee-strip">
        <div className="animate-scroll inline-flex gap-12 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium whitespace-nowrap">
              ✦ Celebrating 100+ Years of Legacy ✦ Awarded Best Cooperative Society 2025 ✦ Over 1 Lakh+ Satisfied Members ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
