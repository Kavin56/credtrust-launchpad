import React from 'react';
import { Sparkles } from 'lucide-react';

const Ticker = () => {
  return (
    <div className="w-full bg-[#fcfd5a] h-10 border-t border-b border-yellow-200 overflow-hidden flex items-center shadow-inner">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-10 text-[13px] font-bold text-[#1a1f36]">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Sparkles className="w-4 h-4 text-[#6b21a8]" />
              <span>Sri Roja Shabarish Guruji: 1floor, Gowri Complex, D. V. G park opposite, Kashipura, shimoga</span>
            </div>
        ))}
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
