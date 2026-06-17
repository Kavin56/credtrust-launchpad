import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import hl1 from "@/Highlights-Images/HL-1.jpeg";
import hl2 from "@/Highlights-Images/HL-2.jpeg";
import hl3 from "@/Highlights-Images/HL-3.jpeg";
import hl4 from "@/Highlights-Images/HL-4.jpeg";
import hl5 from "@/Highlights-Images/HL-5.jpeg";
import hl6 from "@/Highlights-Images/HL-6.jpeg";
import hl7 from "@/Highlights-Images/HL-7.jpeg";
import hl8 from "@/Highlights-Images/HL-8.jpeg";

const quotes = [
  "Service to humanity is the highest form of leadership and the foundation of a compassionate society.",
  "When we serve others, we create a stronger, kinder, and more united community.",
  "A society grows not by what it gains, but by what it gives to those in need.",
  "Every act of kindness, no matter how small, has the power to transform lives.",
  "Together we can build a future where every individual has the opportunity to thrive.",
  "True success is measured by the positive impact we make in the lives of others.",
  "Serving people today creates hope, dignity, and opportunity for tomorrow.",
  "Compassion in action is the driving force behind meaningful social change.",
  "A trust is built on integrity, strengthened by service, and sustained by community support.",
  "Our mission is simple: empower people, uplift communities, and inspire lasting change."
];

const slides = quotes.map((quote, idx) => {
  const images = [hl1, hl2, hl3, hl4, hl5, hl6, hl7, hl8];
  return {
    image: images[idx % images.length],
    title: quote,
    subtitle: "Sharanam Cooperative Credit Society",
    cta: "Learn More",
  };
});

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative bg-muted overflow-hidden">
      <div className="container pt-6 pb-0 md:pt-8 md:pb-0 lg:pt-10 lg:pb-0">
        {/* Main Branding Title */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-[#1a1f36] leading-tight text-center max-w-5xl mx-auto uppercase">
              Sri Roja Shabarish Guruji Souharada Sahakara Niyamitha
            </h1>
            <div className="text-2xl md:text-4xl font-heading font-extrabold text-[#6b21a8] tracking-widest mt-4 uppercase flex items-center justify-center gap-2">
              <span>ಶರಣಂ</span>
              <span className="opacity-40 font-light">|</span>
              <span>Sharanam</span>
            </div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#6b21a8]/30 to-transparent mx-auto mt-4 rounded-full" />
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
              <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground leading-snug mb-4 italic text-[#1a1f36]">
                "{slide.title}"
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mb-8 max-w-md uppercase tracking-widest font-black">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="btn-primary-banking text-base px-8 py-3">
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
                  className="rounded-2xl w-full max-w-md lg:max-w-lg shadow-2xl object-cover aspect-[4/3]"
                  width={640}
                  height={480}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Slide Indicators */}
        <div className="flex justify-center gap-2 mt-4 mb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-4" : "bg-foreground/20"}`}
            />
          ))}
        </div>
      </div>



      {/* Marquee remains at the very bottom */}
      <div className="marquee-strip -mt-6 relative z-30">
        <div className="animate-scroll inline-flex gap-12 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold whitespace-nowrap">
              ✦ 1floor, Gowri Complex, D. V. G park opposite, Kashipura, shimoga ✦ Celebrating 100+ Years of Legacy ✦ Awarded Best Cooperative Society 2025 ✦ Over 1 Lakh+ Satisfied Members ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
