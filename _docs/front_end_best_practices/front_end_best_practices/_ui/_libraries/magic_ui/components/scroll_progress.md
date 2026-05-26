Scroll Progress

Animated Scroll Progress for your pages

import { ScrollProgress } from "@/registry/magicui/scroll-progress";
 
export function ScrollProgressDemo() {
  return (
    <div className="z-10 rounded-lg p-4">
      <ScrollProgress className="top-[65px]" />
      <h2 className="pb-4 font-bold">
        Note: The scroll progress is shown below the navbar of the page.
      </h2>
    </div>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { cn } from "@/lib/_utils";

import { motion, MotionProps, useScroll } from "motion/react";
import React from "react";
interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {}
 
export const ScrollProgress = React.forwardRef<
  HTMLDivElement,
  ScrollProgressProps
>(({ className, ...props }, ref) => {
  const { scrollYProgress } = useScroll();
 
  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]",
        className,
      )}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
});
 
ScrollProgress.displayName = "ScrollProgress";

Usage

import { ScrollProgress } from "@/components/magicui/scroll-progress";

<ScrollProgress />

Props
Prop	Type	Default	Description
className	string	-	The class name to be applied to the component

The ScrollProgress compo