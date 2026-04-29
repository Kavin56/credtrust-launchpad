import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
const professionalBanking = "https://static.vecteezy.com/system/resources/thumbnails/034/598/907/small_2x/ai-generative-happy-business-man-in-a-suit-white-background-free-photo.jpg";

const tabs = ["EMI Calculator", "Home Loan", "Car Loan", "FD Calculator"];

const CalculatorSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState(0);
  const [amount, setAmount] = useState(500000);
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
          <p className="section-label mb-2">BANKING WITH ✦ A PLAN</p>
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
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Loan amount</label>
                  <div className="mt-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                    <span className="text-foreground font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                    />
                  </div>
                  <input type="range" min={25000} max={10000000} step={25000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rate of interest</label>
                  <div className="mt-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                    <input
                      type="number"
                      step={0.1}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                  <input type="range" min={2} max={20} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Loan tenure</label>
                  <div className="mt-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="bg-transparent outline-none text-base font-semibold text-foreground w-full"
                    />
                    <span className="text-muted-foreground text-sm">months</span>
                  </div>
                  <input type="range" min={1} max={360} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-1.5 accent-primary h-1.5" />
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
            className="lg:col-span-2 hidden lg:block"
          >
            <img src={professionalBanking} alt="Professional banking" className="rounded-2xl w-full h-full object-cover" loading="lazy" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
