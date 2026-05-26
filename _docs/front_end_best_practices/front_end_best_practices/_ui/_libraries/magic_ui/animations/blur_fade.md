Blur Fade

Blur fade in and out animation. Used to smoothly fade in and out content.

/* eslint-disable @next/next/no-img-element */
import { BlurFade } from "@/registry/magicui/blur-fade";
 
const images = Array.from({ length: 9 }, (_, i) => {
  const isLandscape = i % 2 === 0;
  const width = isLandscape ? 800 : 600;
  const height = isLandscape ? 600 : 800;
  return `https://picsum.photos/seed/${i + 1}/${width}/${height}`;
});
 
export function BlurFadeDemo() {
  return (
    <section id="photos">
      <div className="columns-2 gap-4 sm:columns-3">
        {images.map((imageUrl, idx) => (
          <BlurFade key={imageUrl} delay={0.25 + idx * 0.05} inView>
            <img
              className="mb-4 size-full rounded-lg object-contain"
              src={imageUrl}
              alt={`Random stock image ${idx + 1}`}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import {
  AnimatePresence,
  motion,
  useInView,
  UseInViewOptions,
  Variants,
  MotionProps,
} from "motion/react";
import { useRef } from "react";
 
type MarginType = UseInViewOptions["margin"];
 
interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
}
 
export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

Update the import paths to match your project setup.
Examples

import { BlurFade } from "@/registry/magicui/blur-fade";
 
export function BlurFadeTextDemo() {
  return (
    <section id="header">
      <BlurFade delay={0.25} inView>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Hello World 👋
        </h2>
      </BlurFade>
      <BlurFade delay={0.25 * 2} inView>
        <span className="text-pretty text-xl tracking-tighter sm:text-3xl xl:text-4xl/none">
          Nice to meet you
        </span>
      </BlurFade>
    </section>
  );
}

Usage

import { BlurFade } from "@/components/magicui/blur-fade";

<BlurFade>
  <img src="https://picsum.photos/300/200?random=1" alt="Sample 1" />
  <img src="https://picsum.photos/300/200?random=2" alt="Sample 2" />
  <img src="https://picsum.photos/300/200?random=3" alt="Sample 3" />
</BlurFade>

Props
Prop	Type	Default	Description
children	React.ReactNode	-	The content to be animated
className	string	-	The class name to be applied to the component
variant	object	-	Custom animation variants for motion component
duration	number	0.4	Duration (seconds) for the animation
delay	number	0	Delay (seconds) before the animation starts
offset	number	6	Offset for the animation
direction	string	"down"	Direction for the animation (up, down, left, right)
inView	boolean	false	Whether to trigger animation when component is in view
inViewMargin	MarginType	"-50px"	Margin for triggering the in-view animation
blur	string	"6px"	Amount of blur to apply during the animation