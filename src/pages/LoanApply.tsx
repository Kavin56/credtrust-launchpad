import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, ArrowRight, CheckCircle2 } from "lucide-react";

const LoanApply = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a84c]/10 text-[#a08530] text-sm font-bold mb-4">
              Loan Application
            </span>
            <h1 className="text-4xl font-heading font-bold text-[#1a1f36] mb-4">
              Apply for Your Loan in Minutes
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Please complete the following steps to submit your loan application. Our team will review it within 24 hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Landmark, title: "Eligibility", desc: "Check your pre-approved limit" },
              { icon: ArrowRight, title: "Documents", desc: "Upload ID and income proof" },
              { icon: CheckCircle2, title: "Approval", desc: "Get funds in your account" }
            ].map((step, idx) => (
              <Card key={idx} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#1a1f36]/5 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-[#1a1f36]" />
                  </div>
                  <CardTitle className="text-lg font-bold">{idx + 1}. {step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-gray-500">
                  {step.desc}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-[#1a1f36] p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
              <p className="text-white/60 mb-6">Our digital loan process is easy, fast, and secure.</p>
              <Button className="bg-[#c9a84c] text-[#1a1f36] hover:bg-[#d4b65c] font-bold h-12 px-8">
                Start New Application
              </Button>
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <h4 className="font-bold text-[#1a1f36]">Required Information:</h4>
                <ul className="space-y-3">
                  {[
                    "Valid government-issued ID",
                    "Income proof (Last 3 months salary slip)",
                    "Bank account details",
                    "Residential address proof"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanApply;
