import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTABanner = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-highlight rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Not sure which product is for you?</h3>
            <p className="text-sm text-muted-foreground">Let's find the best fit together</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground/70">
            <span>✦ No spam calls</span>
            <span>✦ Dedicated experts</span>
            <span>✦ Your schedule</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="tel"
              placeholder="Enter your mobile number"
              className="border border-border rounded-lg px-4 py-3 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30 w-56"
            />
            <a href="#" className="btn-primary-banking text-sm whitespace-nowrap">Get personal assistance</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
