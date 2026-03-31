import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Landmark, CreditCard, PiggyBank, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";

const services = [
  { icon: Landmark, title: "Savings Accounts", desc: "High-interest savings accounts with zero balance options" },
  { icon: CreditCard, title: "Credit Cards", desc: "Rewards & cashback on every transaction with premium cards" },
  { icon: PiggyBank, title: "Fixed Deposits", desc: "Secure deposits with up to 7.5% p.a. interest rates" },
  { icon: ShieldCheck, title: "Insurance", desc: "Comprehensive life & general insurance solutions" },
  { icon: Smartphone, title: "Digital Banking", desc: "Bank anytime, anywhere with our mobile-first platform" },
  { icon: TrendingUp, title: "Investments", desc: "Mutual funds, bonds & portfolio management services" },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24" id="services">
      <div className="container text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label mb-2">BANKING WITH ✦ EXCELLENCE</p>
          <h2 className="section-title">Complete banking solutions</h2>
        </motion.div>
      </div>
      <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.08 * i }}
            className="card-banking group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <s.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
