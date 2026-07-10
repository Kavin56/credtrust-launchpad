import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import professionalBanking from "@/assets/calculator-man.png";

const tabs = ["EMI Calculator", "Home Loan", "Car Loan", "FD Calculator"];

const CalculatorSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState(0);
  const [amount, setAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(36);

  const monthlyRate = rate / 12 / 100;
  const emi = monthlyRate > 0
    ? Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1))
    : Math.round(amount / tenure);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - amount;
  const principalPercent = Math.round((amount / totalPayment) * 100);

  return (
    <section ref={ref} className="py-16 md:py-24" id="deposits">
      <div className="container text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label mb-2">SOCIETY WITH ✦ A PLAN</p>
          <h2 className="section-title mb-3">Turn your dreams into reality</h2>
          <p className="section-subtitle mx-auto">Access our tools and calculators for smart spending and savings</p>
        </motion.div>
      </div>

      <div className="container max-w-5xl">
        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 card-banking !p-0 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex overflow-x-auto bg-muted">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    i === activeTab ? "bg-background text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5 md:p-7 grid md:grid-cols-2 gap-8 items-center">
              {/* Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold">Loan amount</label>
                  <div className="mt-1 flex items-center justify-between gap-2 border border-border bg-background rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 flex-grow">
                      <span className="text-foreground font-semibold text-sm">₹</span>
                      <input
                        type="number"
                        min={1000}
                        max={100000}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setAmount(prev => Math.max(1000, prev - 1000))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        -
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAmount(prev => Math.min(100000, prev + 1000))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input type="range" min={1000} max={100000} step={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5 cursor-pointer" />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[1000, 10000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${amount === val ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        ₹{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-semibold">Rate of interest</label>
                  <div className="mt-1 flex items-center justify-between gap-2 border border-border bg-background rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 flex-grow">
                      <input
                        type="number"
                        step={0.1}
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setRate(prev => Math.max(1, Math.round((prev - 0.5) * 10) / 10))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        -
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRate(prev => Math.min(20, Math.round((prev + 0.5) * 10) / 10))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input type="range" min={1} max={20} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5 cursor-pointer" />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[5, 8.5, 12, 15].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRate(val)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${rate === val ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-semibold">Loan tenure</label>
                  <div className="mt-1 flex items-center justify-between gap-2 border border-border bg-background rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 flex-grow">
                      <input
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                      />
                      <span className="text-muted-foreground text-sm">months</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setTenure(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        -
                      </button>
                      <button 
                        type="button"
                        onClick={() => setTenure(prev => Math.min(360, prev + 1))}
                        className="w-7 h-7 rounded bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-sm font-bold transition-colors select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input type="range" min={1} max={360} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5 cursor-pointer" />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[12, 24, 36, 60].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTenure(val)}
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${tenure === val ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {val}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <a href="#" className="btn-primary-banking text-xs px-6 py-2">Apply now</a>
                </div>
              </div>

              {/* Chart */}
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="12"
                      strokeDasharray={`${principalPercent * 2.64} ${264 - principalPercent * 2.64}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">You will pay</span>
                    <span className="text-lg font-bold text-foreground">₹{emi.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">/month</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Principal</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Interest</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 hidden lg:block relative group overflow-hidden rounded-2xl"
          >
            <img src={professionalBanking} alt="Dr Joy Quadras (C. E. O)" className="rounded-2xl w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white text-center shadow-lg">
              <h4 className="font-bold text-[#1a1f36] text-sm">Dr. Joy Quadras</h4>
              <p className="text-[#c9a84c] font-extrabold text-[10px] uppercase tracking-wider mt-0.5">C.E.O</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
