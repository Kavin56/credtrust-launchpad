import React from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  ShieldAlert, 
  TrendingUp, 
  CreditCard, 
  Gift, 
  Clock, 
  Zap, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = 
  | "security" 
  | "transaction" 
  | "insight" 
  | "personalized" 
  | "reminder" 
  | "offer" 
  | "investment";

interface NotificationCardProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const typeConfigs = {
  security: {
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]",
  },
  transaction: {
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  },
  insight: {
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
  },
  personalized: {
    icon: CheckCircle2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
  reminder: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
  },
  offer: {
    icon: Gift,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]",
  },
  investment: {
    icon: TrendingUp,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]",
  },
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  timestamp,
  priority = "medium",
  actionLabel,
  onAction,
  className,
}) => {
  const config = typeConfigs[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative rounded-2xl p-4 min-w-[300px] max-w-[340px] border backdrop-blur-md transition-all duration-300",
        "bg-white/80 dark:bg-black/60 border-white/20 dark:border-white/10",
        config.glow,
        className
      )}
    >
      <div className="flex gap-4 items-start">
        {/* Icon Container */}
        <div className={cn("p-2 rounded-xl shrink-0", config.bg)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              {title}
            </h4>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {timestamp}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
            {message}
          </p>
          
          {/* Action Button */}
          {actionLabel && (
            <button
              onClick={onAction}
              className="flex items-center gap-1 mt-2 text-[11px] font-bold text-primary hover:underline group"
            >
              {actionLabel}
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Priority Indicator */}
        {priority === "high" && (
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
        )}
      </div>

      {/* Decorative sparkline-like line for Investment type */}
      {type === "investment" && (
        <div className="mt-3 h-4 w-full overflow-hidden opacity-30">
          <svg viewBox="0 0 100 20" className="w-full h-full stroke-indigo-500 fill-none stroke-2">
            <path d="M0,15 L10,12 L20,18 L30,8 L40,12 L50,5 L60,15 L70,12 L80,14 L90,5 L100,2" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationCard;
