import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/modules/login/AuthContext";
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
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

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
  DANGER: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    iconBackground: "bg-rose-100",
  },
  SUCCESS: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    iconBackground: "bg-emerald-100",
  },
  INFO: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    iconBackground: "bg-blue-100",
  },
  WARNING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    iconBackground: "bg-amber-100",
  },
};

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false })
  ]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for new notifications
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return CheckCircle2;
      case 'DANGER': return XCircle;
      case 'WARNING': return ShieldCheck;
      default: return Info;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto font-sans border-l-0 shadow-2xl">
        <div className="flex flex-col h-full bg-slate-50/50">
          {/* Header */}
          <div className="p-6 bg-white border-b sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#1a1f36] rounded-2xl shadow-lg shadow-black/10">
                <Bell className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <div>
                <SheetTitle className="text-xl font-black text-[#1a1f36] tracking-tight">Notification <span className="text-[#6b21a8]">Center</span></SheetTitle>
                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live transaction & credit alerts</SheetDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-10">
            {/* Offers Carousel Section */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#c9a84c]" />
                  Exclusive Offers
                </h3>
                <span className="text-[9px] font-black text-[#6b21a8] bg-[#fdf4ff] px-2 py-0.5 rounded-full border border-purple-100">FEATURED</span>
              </div>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {offers.map((offer, idx) => {
                    const colors = colorMap[offer.color as keyof typeof colorMap];
                    const Icon = offer.icon;
                    return (
                      <div key={idx} className="flex-[0_0_100%] pr-4 pl-1">
                        <motion.div 
                          className={cn(
                            "rounded-[32px] p-6 border transition-all shadow-sm relative overflow-hidden group bg-white hover:border-[#6b21a8]/30 hover:shadow-xl hover:shadow-purple-900/5",
                          )}
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                          <div className="relative z-10">
                             <div className="flex items-start justify-between mb-6">
                               <div className={cn("p-3 rounded-2xl bg-slate-50 border border-slate-100")}>
                                 <Icon className={cn("w-6 h-6 text-[#1a1f36]")} />
                               </div>
                               <span className={cn("text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full bg-slate-100 text-slate-500")}>
                                 {offer.category}
                               </span>
                             </div>
                             <h4 className="text-lg font-black text-[#1a1f36] mb-2 leading-tight">
                               {offer.title}
                             </h4>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                               {offer.content}
                             </p>
                             <button className="w-full py-3.5 bg-[#1a1f36] text-[#c9a84c] rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all hover:bg-[#2d3356] shadow-lg shadow-black/10">
                               Claim Reward
                               <ArrowRight className="w-4 h-4" />
                             </button>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 px-1 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#6b21a8]" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {notifications?.length > 0 ? (
                    notifications.map((notif: any) => {
                      const colors = colorMap[notif.type as keyof typeof colorMap] || colorMap.INFO;
                      const Icon = getIcon(notif.type);
                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => !notif.isRead && markAsReadMutation.mutate(notif.id)}
                          className={cn(
                            "group p-5 rounded-[28px] border transition-all flex items-start gap-4 cursor-pointer relative",
                            notif.isRead ? "bg-white border-slate-100 opacity-60" : "bg-white border-white shadow-xl shadow-black/5 hover:border-purple-100"
                          )}
                        >
                          {!notif.isRead && (
                             <div className="absolute top-5 right-5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                          )}
                          <div className={cn("p-3 rounded-2xl shrink-0 transition-all group-hover:scale-110", colors.bg)}>
                            <Icon className={cn("w-5 h-5", colors.text)} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-start mb-1">
                              <p className={cn("text-sm font-black text-[#1a1f36] truncate", !notif.isRead && "text-[#6b21a8]")}>{notif.title}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-3">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                               {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                          <Clock className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent alerts</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-white border-t border-slate-50">
            <button className="w-full py-4 text-center text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1f36] transition-colors hover:bg-slate-50 rounded-2xl">
              Clear All History
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationDrawer;
