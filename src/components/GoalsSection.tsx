import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import familyBanking from "@/assets/family-banking.jpg";

const GoalsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24" id="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-2">BANKING WITH ✦ PURPOSE</p>
          <h2 className="section-title mb-10">Your goals, our priority</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-muted rounded-2xl p-8 md:p-10"
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Select your goal</h3>
            <div className="bg-background rounded-xl p-4 mb-6">
              <label className="text-xs text-muted-foreground">I want to</label>
              <select className="w-full mt-1 text-foreground bg-transparent text-lg font-medium outline-none cursor-pointer">
                <option>Buy a Home</option>
                <option>Save for Retirement</option>
                <option>Start a Business</option>
                <option>Invest Wisely</option>
                <option>Plan for Education</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="btn-primary-banking text-sm">Show solutions</a>
              <span className="text-sm text-muted-foreground">2.5k+ people found it useful</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <img
              src={familyBanking}
              alt="Family banking"
              className="rounded-2xl w-full object-cover aspect-[4/3]"
              loading="lazy"
              width={640}
              height={480}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;
