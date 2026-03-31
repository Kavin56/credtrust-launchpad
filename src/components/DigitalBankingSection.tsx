import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import cardsStack from "@/assets/cards-stack.jpg";
import { Globe, Smartphone, MapPin } from "lucide-react";

const channels = [
  { icon: Globe, label: "Internet Banking", name: "CredTrust MoneyClick" },
  { icon: Smartphone, label: "Digital Banking", name: "WhatsApp Banking" },
  { icon: MapPin, label: "Service Branches", name: "Locate Us" },
];

const DigitalBankingSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24">
      {/* Cards promo */}
      <div className="container mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-muted rounded-3xl p-8 md:p-12 grid lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <p className="section-label mb-2">BANKING WITH ✦ SIMPLICITY</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight mb-4">
              Live in the now with simplified payments
            </h2>
            <p className="text-muted-foreground mb-6">
              Pay your bills, metro rail, utility expenses and more using CredTrust cards with ease
            </p>
            <a href="#" className="btn-primary-banking text-sm">Discover cards</a>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <img src={cardsStack} alt="Cards" className="max-w-sm w-full animate-float" loading="lazy" width={400} height={300} />
          </motion.div>
        </motion.div>
      </div>

      {/* Support section */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-highlight rounded-3xl p-8 md:p-12 grid lg:grid-cols-5 gap-8 items-center"
          id="contact"
        >
          <div className="lg:col-span-3">
            <p className="section-label mb-2">BANKING WITH ✦ YOU</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight mb-3">
              Here for you, always
            </h2>
            <p className="text-muted-foreground mb-6">24/7 support for your banking needs</p>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="btn-primary-banking text-sm">Get a callback</a>
              <a href="#" className="btn-outline-banking text-sm">Raise your concerns</a>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-3">
            {channels.map((ch) => (
              <a key={ch.name} href="#" className="card-banking flex items-center gap-4 !p-4 group">
                <ch.icon className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground">{ch.label}</span>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{ch.name}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DigitalBankingSection;
