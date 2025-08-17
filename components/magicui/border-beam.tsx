"use client";

import { motion, MotionStyle, Transition } from "motion/react";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
  /**
   * The border width of the beam.
   */
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  // Use theme-driven defaults; callers can override
  colorFrom = "hsl(var(--aurora-1))",
  colorTo = "hsl(var(--aurora-2))",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={
        {
          "--border-beam-width": `${borderWidth}px`,
          // Tailwind v3 does not support the `border-(length:var(--...))` syntax.
          // Apply the border width directly via inline style using the CSS variable.
          borderWidth: "var(--border-beam-width)",
        } as React.CSSProperties
      }
    >
      <motion.div
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        className={cn(
          "absolute aspect-square",
          "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
          className,
        )}
        initial={{ offsetDistance: `${initialOffset}%` }}
        style={
          {
            "--color-from": colorFrom,
            "--color-to": colorTo,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            width: size,
            ...style,
          } as MotionStyle
        }
        transition={{
          delay: -delay,
          duration,
          ease: "linear",
          repeat: Infinity,
          ...transition,
        }}
      />
    </div>
  );
};
