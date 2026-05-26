Spinning Text

The Spinning Text component animates text in a circular motion with customizable speed, direction, color, and transitions for dynamic and engaging effects.

import { SpinningText } from "@/registry/magicui/spinning-text";
 
export function SpinningTextBasic() {
  return <SpinningText>learn more • earn more • grow more •</SpinningText>;
}

Installation
Copy and paste the following code into your project.

"use client";
import { cn } from "@/lib/_utils";

import { motion, Transition, Variants } from "motion/react";
import React, { CSSProperties } from "react";
 
type SpinningTextProps = {
  children: string | string[];
  style?: CSSProperties;
  duration?: number;
  className?: string;
  reverse?: boolean;
  fontSize?: number;
  radius?: number;
  transition?: Transition;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
};
 
const BASE_TRANSITION = {
  repeat: Infinity,
  ease: "linear",
};
 
const BASE_ITEM_VARIANTS = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
  },
};
 
export function SpinningText({
  children,
  duration = 10,
  style,
  className,
  reverse = false,
  radius = 5,
  transition,
  variants,
}: SpinningTextProps) {
  if (typeof children !== "string" && !Array.isArray(children)) {
    throw new Error("children must be a string or an array of strings");
  }
 
  if (Array.isArray(children)) {
    // Validate all elements are strings
    if (!children.every((child) => typeof child === "string")) {
      throw new Error("all elements in children array must be strings");
    }
    children = children.join("");
  }
 
  const letters = children.split("");
  letters.push(" ");
 
  const finalTransition = {
    ...BASE_TRANSITION,
    ...transition,
    duration: (transition as { duration?: number })?.duration ?? duration,
  };
 
  const containerVariants = {
    visible: { rotate: reverse ? -360 : 360 },
    ...variants?.container,
  };
 
  const itemVariants = {
    ...BASE_ITEM_VARIANTS,
    ...variants?.item,
  };
 
  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        ...style,
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={finalTransition}
    >
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden="true"
          key={`${index}-${letter}`}
          variants={itemVariants}
          className="absolute left-1/2 top-1/2 inline-block"
          style={
            {
              "--index": index,
              "--total": letters.length,
              "--radius": radius,
              transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
              transformOrigin: "center",
            } as React.CSSProperties
          }
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{children}</span>
    </motion.div>
  );
}

Update the import paths to match your project setup.
Examples
Reverse

import { SpinningText } from "@/registry/magicui/spinning-text";
 
export function SpinningTextBasic() {
  return (
    <SpinningText reverse className="text-4xl" duration={4} radius={6}>
      learn more • earn more • grow more •
    </SpinningText>
  );
}

Usage

import { SpinningText } from "@/components/magicui/spinning-text";

<SpinningText>learn more • earn more • grow more •</SpinningText>

Props
Prop	Type	Default	Description
children	ReactElement		The text content to be animated in a circular motion.
style	CSSProperties	{}	Custom styles for the text container.
duration	number	10	The duration of the full circular rotation animation.
className	string		A custom class name for the text container.
reverse	boolean	false	Determines if the animation should rotate in reverse.
fontSize	number	1	The font size of the text being animated in rem.
radius	number	5	The radius of the circular path for the text animation.
transition	Transition		Custom transition effects for the animation.
variants	{ container?: Variants; item?: Variants; }		Variants for container and item animations.
Credits