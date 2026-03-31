import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";

const testimonials = [
  {
    image: testimonial1,
    quote: "I just wanted to open a new personal account. My business partner recommended CredTrust and I am quite happy with my decision. The staff is very kind, very supportive and they attend to you very well.",
    name: "Karan Deodatta Pradeshi",
    product: "Savings Account",
    date: "02 Nov, 2023",
  },
  {
    image: testimonial2,
    quote: "CredTrust's digital banking has completely changed how I manage my finances. The app is intuitive, fast, and I can do everything from my phone. Truly impressed by the experience.",
    name: "Priya Mehra",
    product: "Digital Banking",
    date: "15 Jan, 2024",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const t = testimonials[current];

  return (
    <section ref={ref} className="py-16 md:py-24 bg-muted/30">
      <div className="container text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <p className="section-label mb-2">BANKING WITH ✦ RELIABILITY</p>
          <h2 className="section-title mb-3">Banking with trust, expertise and care</h2>
          <p className="section-subtitle mx-auto">Expanding the CredTrust family everyday</p>
        </motion.div>
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center max-w-5xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl border-2 border-secondary/40 hidden md:block" style={{ borderRadius: "40% 60% 50% 50% / 50% 50% 60% 40%" }} />
            <img src={t.image} alt={t.name} className="rounded-2xl w-full aspect-square object-cover" loading="lazy" width={400} height={400} />
            <button className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-5 h-5 ml-0.5" />
            </button>
          </div>

          <div>
            <blockquote className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-6">
              "{t.quote}"
            </blockquote>
            <p className="font-semibold text-foreground">{t.name}</p>
            <p className="text-sm text-primary mt-1">{t.product}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.date}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent((current + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
