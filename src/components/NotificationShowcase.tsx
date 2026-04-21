import React, { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import NotificationCard, { NotificationType } from "./NotificationCard";
import { ChevronLeft, ChevronRight, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
  actionLabel?: string;
}

const mockNotifications: NotificationData[] = [
  {
    id: "1",
    type: "security",
    title: "Security Alert",
    message: "New login detected from Chrome on Windows (Bangalore, IN). Was this you?",
    timestamp: "2 mins ago",
    priority: "high",
    actionLabel: "Review Security",
  },
  {
    id: "2",
    type: "transaction",
    title: "Funds Credited",
    message: "₹45,200.00 credited to your Savings Account XX9842 from SALARY Payout.",
    timestamp: "15 mins ago",
    actionLabel: "View Details",
  },
  {
    id: "3",
    type: "insight",
    title: "Smart Savings",
    message: "Great job! You've saved ₹5,200 more this month compared to March. 🚀",
    timestamp: "1 hour ago",
    actionLabel: "View Insights",
  },
  {
    id: "4",
    type: "investment",
    title: "Portfolio Update",
    message: "Your mutual fund portfolio is up 2.4% today. Net gain: ₹1,240.00.",
    timestamp: "3 hours ago",
    actionLabel: "Analyze Growth",
  },
  {
    id: "5",
    type: "reminder",
    title: "Bill Reminder",
    message: "HDFC Credit Card statement due in 48 hours. Amount: ₹12,450.00.",
    timestamp: "5 hours ago",
    priority: "medium",
    actionLabel: "Pay Now",
  },
  {
    id: "6",
    type: "offer",
    title: "Exclusive Offer",
    message: "Get up to 7.5% p.a. on Fixed Deposits for a limited time. Invest now!",
    timestamp: "Today",
    actionLabel: "Check Rates",
  },
  {
    id: "7",
    type: "reminder",
    title: "🔴 Urgent: EMI Due",
    message: "Your Home Loan EMI of ₹24,500 is due today. Please ensure sufficient balance in your savings account.",
    timestamp: "1 hour ago",
    priority: "high",
    actionLabel: "Pay Now",
  },
  {
    id: "8",
    type: "personalized",
    title: "🟡 Policy Update",
    message: "We've updated our Personal Data Protection policy to enhance your security. Please review the changes.",
    timestamp: "2 hours ago",
    priority: "medium",
    actionLabel: "Read More",
  },
  {
    id: "9",
    type: "transaction",
    title: "🟢 Exclusive Info: Offers",
    message: "Special festive offers on Gold Loans! Get interest rates as low as 1.5% and zero processing fees.",
    timestamp: "Just Now",
    priority: "low",
    actionLabel: "View Offers",
  },
];

const NotificationShowcase = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      skipSnaps: false,
      dragFree: true
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="w-full py-8 group/showcase">
      <div className="container px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="w-6 h-6 text-primary animate-bounce-slow" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] items-center justify-center text-white font-bold">9</span>
              </span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Live Smart Insights</h2>
              <p className="text-sm text-muted-foreground italic">Your financial assistant, always active.</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="p-2 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-4">
            {mockNotifications.map((notification) => (
              <div key={notification.id} className="flex-[0_0_auto]">
                <NotificationCard {...notification} />
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {mockNotifications.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === selectedIndex ? "bg-primary w-8" : "bg-muted-foreground/20 w-3 hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationShowcase;
