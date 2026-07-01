import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import hl3 from "@/Highlights-Images/HL-3.jpeg";
import hl4 from "@/Highlights-Images/HL-4.jpeg";
import hl7 from "@/Highlights-Images/HL-7.jpeg";

const offers = [
  {
    id: 1,
    title: "Instant Gold Loans",
    subtitle: "At just 0.5% p.m. interest rates",
    description: "Unlock the value of your gold instantly with minimal documentation and spot disbursal.",
    image: hl3,
    icon: Sparkles,
    color: "#c9a84c"
  },
  {
    id: 2,
    title: "Fixed Deposit Booster",
    subtitle: "Earn up to 7.5% p.a. returns",
    description: "Highest safety rating with attractive interest rates for senior citizens and long-term savers.",
    image: hl4,
    icon: TrendingUp,
    color: "#10b981"
  },
  {
    id: 3,
    title: "Lifestyle Loans",
    subtitle: "Zero processing loan for lucky customers",
    description: "Finance your dreams with our flexible repayment terms and lightning-fast digital approvals.",
    image: hl7,
    icon: ShieldCheck,
    color: "#6b21a8"
  }
];

import { useNavigate } from 'react-router-dom';

export const OfferSlider = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative group overflow-hidden rounded-[40px] shadow-2xl shadow-black/10 border border-gray-100 bg-white">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {offers.map((offer) => (
            <div key={offer.id} className="relative flex-[0_0_100%] min-w-0 h-[320px] lg:h-[400px]">
              <img 
                src={offer.image} 
                alt={offer.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1f36]/90 via-[#1a1f36]/40 to-transparent" />
              
              <div className="relative h-full flex flex-col justify-center px-10 lg:px-16 space-y-4 max-w-2xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <offer.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Special Member Offer</span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl lg:text-5xl font-black text-white leading-tight"
                >
                  {offer.title} <br />
                  <span className="text-[#c9a84c] text-3xl lg:text-4xl">{offer.subtitle}</span>
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white/70 text-sm lg:text-base font-medium max-w-lg leading-relaxed"
                >
                  {offer.description}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <button 
                    onClick={() => navigate('/loan-apply')}
                    className="mt-4 px-8 py-3.5 bg-white text-[#1a1f36] font-bold rounded-2xl hover:bg-[#c9a84c] hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    Check Eligibility
                  </button>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#1a1f36] z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#1a1f36] z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-10 lg:left-16 flex gap-2 z-20">
        {offers.map((_, idx) => (
          <button 
            key={idx}
            className={`h-1.5 transition-all rounded-full ${selectedIndex === idx ? "w-8 bg-[#c9a84c]" : "w-2 bg-white/30"}`}
            onClick={() => emblaApi?.scrollTo(idx)}
          />
        ))}
      </div>
    </div>
  );
};
