import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";

const products = [
  {
    title: "CredTrust Xpress Cash Loan",
    prefix: "Apply for a",
    features: ["Quick disbursal", "Attractive rates", "No collateral"],
  },
  {
    title: "CredTrust Gold Loan",
    prefix: "Apply for a",
    features: ["Safe gold custody", "High loan-to-value ratio", "No income proof"],
  },
];

const ProductsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-muted/50" id="loans">
      <div className="container text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label mb-2">BANKING WITH ✦ EASE</p>
          <h2 className="section-title">Catering to all your needs</h2>
        </motion.div>
      </div>
      <div className="container grid md:grid-cols-2 gap-6 lg:gap-8">
        {products.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            className="card-banking"
          >
            <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-1">
              {p.prefix} <span className="font-bold">{p.title}</span>
            </h3>
            <ul className="mt-5 space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-foreground/80">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="btn-primary-banking text-sm">Apply now</a>
              <a href="#" className="btn-outline-banking text-sm">Know more</a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;
