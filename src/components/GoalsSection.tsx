import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import familyBanking from "@/assets/family-banking.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Home, PiggyBank, Briefcase, TrendingUp, GraduationCap } from "lucide-react";

const goals = [
  { value: "buy-home", label: "Buy a Home", icon: Home },
  { value: "save-retirement", label: "Save for Retirement", icon: PiggyBank },
  { value: "start-business", label: "Start a Business", icon: Briefcase },
  { value: "invest", label: "Invest Wisely", icon: TrendingUp },
  { value: "plan-education", label: "Plan for Education", icon: GraduationCap },
];

const GoalsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedGoal, setSelectedGoal] = useState("");

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
              <label className="text-xs text-muted-foreground mb-1.5 block">I want to</label>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-full text-lg font-medium border-0 shadow-none px-0 h-auto focus:ring-0">
                  <SelectValue placeholder="Choose a goal..." />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <SelectItem key={goal.value} value={goal.value} className="gap-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm">{goal.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
                Show solutions
              </Button>
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
