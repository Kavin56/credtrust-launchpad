import React from "react";
import { Marquee } from "./ui/marquee";
import { UserCheck } from "lucide-react";

// Image imports
import sandeshImg from "@/Team_photos/Mr. Sandesh Shanmugam.jpeg";
import malarImg from "@/Team_photos/Mrs. Malar.jpeg";
import payaniImg from "@/Team_photos/Mr. Payani.jpeg";
import vishwaImg from "@/Team_photos/Mr. Vishwa.jpeg";
import sumaImg from "@/Team_photos/Mrs. Suma.jpeg";
import manjunathImg from "@/Team_photos/Mr. Manjunath.jpeg";
import yuvarajImg from "@/Team_photos/Mr. Yuvaraj.jpeg";
import purshotamImg from "@/Team_photos/Mr. S. Purshotam.png";
import sendilImg from "@/Team_photos/Mr. Sendil.jpeg";
import venkateshImg from "@/Team_photos/Mr. Venkatesh K.jpeg";
import jayashreeImg from "@/Team_photos/Mrs. Jayashree S.jpeg";
import sureshImg from "@/Team_photos/Mr. K M Suresh.png";
import kalyaniImg from "@/Team_photos/Mrs. Kalyani L.png";

const teamMembers = [
  { name: "Mr. K. Venkatesh", role: "President", image: venkateshImg },
  { name: "Mr. Sandesh Shanmugam", role: "Vice President", image: sandeshImg },
  { name: "Mr. Payani", role: "Director", image: payaniImg },
  { name: "Mr. Vishwanath R", role: "Director", image: vishwaImg },
  { name: "Mrs. Jayashree S", role: "Director", image: jayashreeImg },
  { name: "Mrs. Kalyani L", role: "Director", image: kalyaniImg },
  { name: "Mr. S. Purshotam", role: "Director", image: purshotamImg },
  { name: "Mrs. Suma", role: "Director", image: sumaImg },
  { name: "Mr. Sendil Kumar M", role: "Director", image: sendilImg },
  { name: "Mr. K. M. Suresh", role: "Director", image: sureshImg },
  { name: "Mr. Manjunath", role: "Director", image: manjunathImg },
  { name: "Mrs. Malar", role: "Director", image: malarImg },
  { name: "Mr. Yuvaraj", role: "Director", image: yuvarajImg },
];

export default function TeamSection() {
  const marqueeList = [...teamMembers, ...teamMembers];

  return (
    <section className="relative w-full overflow-hidden bg-white py-20 md:py-32 dark:bg-background border-y border-gray-100 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <svg
          className="absolute right-0 bottom-0 text-neutral-100 dark:text-neutral-900"
          fill="none"
          height="154"
          viewBox="0 0 460 154"
          width="460"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_494_1104)">
            <path
              d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="40"
            />
          </g>
          <defs>
            <clipPath id="clip0_494_1104">
              <rect fill="white" height="154" width="460" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="mx-auto mb-12 flex max-w-5xl flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6b21a8] text-white shadow-xl shadow-[#6b21a8]/20 animate-float">
            <UserCheck className="w-7 h-7" />
          </div>

          <p className="text-xs font-black text-[#6b21a8] uppercase tracking-[0.3em] mb-3">Leadership Excellence</p>
          <h2 className="relative mb-6 font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-[#1a1f36] tracking-tight">
            Sri Roja Shabarish Guruji Board of Directors
          </h2>
          <p className="max-w-2xl text-base text-gray-500 font-medium leading-relaxed">
            Guiding our institution with integrity, vision, and a commitment to serving our community with excellence.
          </p>
        </div>

        {/* Pure Auto Scroll Marquee Slider */}
        <div className="relative w-full py-6">
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />

          <Marquee className="[--gap:1.5rem] [--duration:50s]" pauseOnHover={true} repeat={2}>
            {marqueeList.map((member, idx) => (
              <div className="group flex w-64 md:w-72 shrink-0 flex-col px-2" key={`${member.name}-${idx}`}>
                <div className="relative h-[380px] w-full overflow-hidden rounded-[32px] bg-neutral-50 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-900/10 group-hover:-translate-y-2">
                  <img
                    alt={member.name}
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                    src={member.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 w-full p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white text-center">
                      <h3 className="font-bold text-[#1a1f36] text-base leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[#c9a84c] font-black text-[10px] uppercase tracking-wider mt-1">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Footer Quote */}
        <div className="mx-auto mt-20 max-w-4xl px-6 text-center lg:px-0">
          <p className="text-xl md:text-2xl font-serif italic text-neutral-800 leading-relaxed mb-8">
            "Our strength lies in our collective vision. We work tirelessly to ensure we remain the most reliable financial partner for every member."
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="h-0.5 w-24 bg-[#c9a84c]" />
            <div className="text-center">
              <p className="font-bold text-[#1a1f36] uppercase tracking-[0.2em] text-xs">
                Sri Roja Shabarish Guruji Souharada Sahakara Niyamitha
              </p>
              <p className="text-[#c9a84c] text-[11px] font-bold mt-1 tracking-widest uppercase">
                Board of Directors · EST. 2025
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
