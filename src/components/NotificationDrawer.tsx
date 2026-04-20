import React, { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  Bell, 
  Tag, 
  ChevronRight, 
  CreditCard, 
  ShieldCheck, 
  Gem, 
  Clock, 
  Activity, 
  Zap, 
  Lock,
  ArrowRight
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const offers = [
  {
    category: "Bank Offers",
    title: "Cashback Reward",
    content: "Get up to 15% cashback on debit card transactions this month.",
    color: "blue",
    icon: CreditCard,
  },
  {
    category: "Bank Offers",
    title: "Loan Special",
    content: "Zero processing fee on personal loans for a limited period.",
    color: "blue",
    icon: Zap,
  },
  {
    category: "Insurance",
    title: "Renewal Alert",
    content: "Your health insurance policy is due for renewal in 7 days.",
    color: "green",
    icon: ShieldCheck,
  },
  {
    category: "Insurance",
    title: "KYC Update",
    content: "Update your KYC to continue uninterrupted policy benefits.",
    color: "green",
    icon: Lock,
  },
  {
    category: "Gold Loan",
    title: "Rate Drop",
    content: "Gold loan interest rates starting from 8.5% per annum.",
    color: "gold",
    icon: Gem,
  },
  {
    category: "Exclusive",
    title: "Festive Offer",
    content: "Special festive offer: Reduced interest rates on gold loans.",
    color: "gold",
    icon: Tag,
  },
];

const notifications = [
  {
    category: "Reminder",
    title: "EMI Due",
    content: "Your Home Loan EMI of ₹24,500 is due on 25th Apr.",
    color: "purple",
    icon: Clock,
    time: "2h ago"
  },
  {
    category: "Update",
    title: "Credit Score",
    content: "Your credit score improved by 12 points! Check it now.",
    color: "blue",
    icon: Activity,
    time: "5h ago"
  },
  {
    category: "Interest",
    title: "FD Highlights",
    content: "FD rates hiked to 7.8% p.a. for senior citizens.",
    color: "green",
    icon: Zap,
    time: "1d ago"
  },
  {
    category: "Security",
    title: "Account Login",
    content: "Recent login detected from a new device in Mumbai.",
    color: "purple",
    icon: Lock,
    time: "2d ago"
  }
];

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    iconBackground: "bg-blue-100",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    iconBackground: "bg-emerald-100",
  },
  gold: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    iconBackground: "bg-amber-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    iconBackground: "bg-purple-100",
  },
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false })
  ]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto font-sans">
        <div className="flex flex-col h-full bg-slate-50/50">
          {/* Header */}
          <div className="p-6 bg-white border-b sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">Notifications Center</SheetTitle>
                <SheetDescription className="text-xs">Stay updated with latest offers and alerts</SheetDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Offers Carousel Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#1a1f36] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Exclusive Offers
                </h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              </div>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {offers.map((offer, idx) => {
                    const colors = colorMap[offer.color as keyof typeof colorMap];
                    const Icon = offer.icon;
                    return (
                      <div key={idx} className="flex-[0_0_100%] pr-4 pl-1">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "rounded-3xl p-6 border-2 transition-all shadow-sm",
                            colors.bg,
                            colors.border
                          )}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl", colors.iconBackground)}>
                              <Icon className={cn("w-6 h-6", colors.text)} />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-lg", colors.iconBackground, colors.text)}>
                              {offer.category}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-[#1a1f36] mb-2 leading-tight">
                            {offer.title}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
                            {offer.content}
                          </p>
                          <button className={cn(
                            "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all active:scale-95 shadow-md",
                            "bg-white border-2 border-transparent hover:border-current",
                            colors.text
                          )}>
                            Avail Now
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#1a1f36] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Recent Updates
              </h3>
              <div className="space-y-3">
                {notifications.map((notif, idx) => {
                  const colors = colorMap[notif.color as keyof typeof colorMap];
                  const Icon = notif.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
                    >
                      <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:rotate-12", colors.iconBackground)}>
                        <Icon className={cn("w-5 h-5", colors.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-sm font-black text-[#1a1f36] truncate">{notif.title}</p>
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2 uppercase tracking-tighter">{notif.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed italic">
                          {notif.content}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="bg-[#1a1f36] rounded-3xl p-6 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <p className="text-[#c9a84c] text-[10px] font-black uppercase tracking-widest mb-2">Smart Assist</p>
                <h4 className="text-xl font-bold mb-3 leading-tight">Your credit health has improved by 4%!</h4>
                <button className="text-xs font-bold bg-[#c9a84c] text-[#1a1f36] px-4 py-2 rounded-full hover:bg-white transition-colors flex items-center gap-2">
                  View Full Report
                  <Activity className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16" />
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-white border-t">
            <button className="w-full py-4 text-center text-sm font-black text-[#1a1f36] hover:text-primary transition-colors hover:bg-slate-50 rounded-2xl">
              Mark all as read
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const TrendingUp = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

export default NotificationDrawer;
