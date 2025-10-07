Flip Text

Text flipping character animation

import { FlipText } from "@/registry/magicui/flip-text";
 
export function FlipTextDemo() {
  return (
    <FlipText className="text-4xl font-bold -tracking-widest text-black dark:text-white md:text-7xl md:leading-[5rem]">
      Flip Text
    </FlipText>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { AnimatePresence, motion, Variants, MotionProps } from "motion/react";
 
import { cn } from "@/lib/_utils";

import { ElementType } from "react";
import React from "react";
 
interface FlipTextProps extends MotionProps {
  /** The duration of the animation */
  duration?: number;
  /** The delay between each character */
  delayMultiple?: number;
  /** The variants of the animation */
  framerProps?: Variants;
  /** The class name of the component */
  className?: string;
  /** The element type of the component */
  as?: ElementType;
  /** The children of the component */
  children: React.ReactNode;
  /** The variants of the animation */
  variants?: Variants;
}
 
const defaultVariants: Variants = {
  hidden: { rotateX: -90, opacity: 0 },
  visible: { rotateX: 0, opacity: 1 },
};
 
export function FlipText({
  children,
  duration = 0.5,
  delayMultiple = 0.08,
 
  className,
  as: Component = "span",
  variants,
  ...props
}: FlipTextProps) {
  const MotionComponent = motion.create(Component);
  const characters = React.Children.toArray(children).join("").split("");
 
  return (
    <div className="flex justify-center space-x-2">
      <AnimatePresence mode="wait">
        {characters.map((char, i) => (
          <MotionComponent
            key={i}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants || defaultVariants}
            transition={{ duration, delay: i * delayMultiple }}
            className={cn("origin-center drop-shadow-sm", className)}
            {...props}
          >
            {char}
          </MotionComponent>
        ))}
      </AnimatePresence>
    </div>
  );
}

Update the import paths to match your project setup.
Usage

import { FlipText } from "@/components/magicui/flip-text";

<FlipText>Flip Text</FlipText>

Props
Prop	Type	Default	Description
className	string	-	The class name to be applied to the component
duration	number	0.5	Duration of the animation
delayMultiple	number	0.08	Transition delay multiplier.
variants	Variants	{}	An object containing motion variants
as	ElementType	span	The element type of the component
children	React.ReactNode	required	The children of the component