import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="container py-12 md:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[400px] md:min-h-[480px]">
          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
              className="z-10"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-foreground leading-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
                {slide.subtitle}
              </p>
              <a href="#" className="btn-primary-banking text-base">
                {slide.cta}
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Image */}
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
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-full border-2 border-secondary/50 hidden lg:block" style={{ borderRadius: "40% 60% 55% 45% / 55% 45% 60% 40%" }} />
                <img
                  src={slide.image}
                  alt="Banking"
                  className="rounded-2xl w-full max-w-lg object-cover aspect-[4/3]"
                  width={640}
                  height={480}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-8" : "bg-foreground/20"}`}
            />
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="marquee-strip">
        <div className="animate-scroll inline-flex gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-medium">
              ✦ Celebrating a Legacy of Trust, Service, and Excellence — CredTrust
              <span className="mx-4">✦</span>
              Your Family Bank. Across India.
              <span className="mx-4">✦</span>
              100+ Years of Banking Heritage
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
