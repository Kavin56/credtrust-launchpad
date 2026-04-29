import React from "react";
import { Marquee } from "./ui/marquee";
import { Sparkles } from "lucide-react";

// Image imports
import hl1 from "@/Highlights-Images/HL-1.jpeg";
import hl2 from "@/Highlights-Images/HL-2.jpeg";
import hl3 from "@/Highlights-Images/HL-3.jpeg";
import hl4 from "@/Highlights-Images/HL-4.jpeg";
import hl5 from "@/Highlights-Images/HL-5.jpeg";
import hl6 from "@/Highlights-Images/HL-6.jpeg";
import hl7 from "@/Highlights-Images/HL-7.jpeg";
import hl8 from "@/Highlights-Images/HL-8.jpeg";

const highlights = [
  { id: 1, title: "Grand Inauguration", date: "Jan 2026", image: hl1 },
  { id: 2, title: "Community Outreach", date: "Feb 2026", image: hl2 },
  { id: 3, title: "Annual General Meet", date: "Mar 2026", image: hl3 },
  { id: 4, title: "Financial Literacy", date: "Mar 2026", image: hl4 },
  { id: 5, title: "Award Ceremony", date: "Apr 2026", image: hl5 },
  { id: 6, title: "Tech Integration", date: "Apr 2026", image: hl6 },
  { id: 7, title: "Strategic Planning", date: "May 2026", image: hl7 },
  { id: 8, title: "Member Milestone", date: "Jun 2026", image: hl8 },
];

export default function HighlightsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f8fafc] py-20 md:py-32 border-y border-gray-100">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg
          className="absolute left-0 top-0 text-[#6b21a8]/10"
          fill="none"
          height="154"
          viewBox="0 0 460 154"
          width="460"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M547.463 -304.432C562.118 -194.092 537.342 -84.841 475.074 -34.274C402.587 24.592 279.292 3.929 108.252 -187.128C181.754 528.233 -173.954 -226.602 -88.123 111.229"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="40"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center px-6 text-center lg:px-0">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6b21a8] text-white shadow-xl shadow-purple-900/20 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>

          <p className="text-sm font-bold text-[#6b21a8] uppercase tracking-[0.3em] mb-4">Platform Growth</p>
          <h1 className="relative mb-6 font-heading font-bold text-4xl text-neutral-900 tracking-tight sm:text-5xl lg:text-6xl">
            Sharanam <span className="text-[#c9a84c]">Highlights</span>
          </h1>
          <p className="max-w-2xl text-lg text-neutral-500 font-medium leading-relaxed">
            Celebrating our journey, achievements, and the milestones that define our commitment to financial empowerment.
          </p>
        </div>

        <div className="relative w-full py-10">
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-40 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/40 to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-40 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/40 to-transparent" />

          <Marquee className="[--gap:2rem] [--duration:60s]" reverse pauseOnHover>
            {highlights.map((item) => (
              <div
                className="group flex w-[400px] shrink-0 flex-col px-4"
                key={item.id}
              >
                <div className="relative h-[280px] w-full overflow-hidden rounded-[40px] bg-white border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-900/10 group-hover:-translate-y-2">
                  <img
                    alt={item.title}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                    src={item.image}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50">
                      <h3 className="font-bold text-[#1a1f36] text-sm leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[#c9a84c] font-bold text-[10px] uppercase tracking-widest mt-1">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
