import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1.5rem] [gap:var(--gap)] select-none",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, trackIndex) => (
          <div
            key={trackIndex}
            aria-hidden={trackIndex > 0}
            className={cn("flex shrink-0 w-max [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "[animation-direction:reverse]": reverse,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
            })}
          >
            {React.Children.map(children, (child, childIndex) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  key: `track-${trackIndex}-item-${childIndex}`,
                } as any);
              }
              return child;
            })}
          </div>
        ))}
    </div>
  );
}
