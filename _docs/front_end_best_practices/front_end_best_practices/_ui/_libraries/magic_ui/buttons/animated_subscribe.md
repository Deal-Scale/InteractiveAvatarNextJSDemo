Animated Subscribe Button

An animated subscribe button useful for showing a micro animation from intial to final result.

import { AnimatedSubscribeButton } from "@/registry/magicui/animated-subscribe-button";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
 
export function AnimatedSubscribeButtonDemo() {
  return (
    <AnimatedSubscribeButton className="w-36">
      <span className="group inline-flex items-center">
        Follow
        <ChevronRightIcon className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      <span className="group inline-flex items-center">
        <CheckIcon className="mr-2 size-4" />
        Subscribed
      </span>
    </AnimatedSubscribeButton>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { cn } from "@/lib/_utils";

import { HTMLMotionProps } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
 
interface AnimatedSubscribeButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  subscribeStatus?: boolean;
  children: React.ReactNode;
  className?: string;
}
 
export const AnimatedSubscribeButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedSubscribeButtonProps
>(
  (
    { subscribeStatus = false, onClick, className, children, ...props },
    ref,
  ) => {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(subscribeStatus);
 
    if (
      React.Children.count(children) !== 2 ||
      !React.Children.toArray(children).every(
        (child) => React.isValidElement(child) && child.type === "span",
      )
    ) {
      throw new Error(
        "AnimatedSubscribeButton expects two children, both of which must be <span> elements.",
      );
    }
 
    const childrenArray = React.Children.toArray(children);
    const initialChild = childrenArray[0];
    const changeChild = childrenArray[1];
 
    return (
      <AnimatePresence mode="wait">
        {isSubscribed ? (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-primary-foreground",
              className,
            )}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              setIsSubscribed(false);
              onClick?.(e);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="action"
              className="relative flex h-full w-full items-center justify-center font-semibold"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
            >
              {changeChild} {/* Use children for subscribed state */}
            </motion.span>
          </motion.button>
        ) : (
          <motion.button
            ref={ref}
            className={cn(
              "relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border-none bg-primary px-6 text-primary-foreground",
              className,
            )}
            onClick={(e) => {
              setIsSubscribed(true);
              onClick?.(e);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
          >
            <motion.span
              key="reaction"
              className="relative flex items-center justify-center font-semibold"
              initial={{ x: 0 }}
              exit={{ x: 50, transition: { duration: 0.1 } }}
            >
              {initialChild} {/* Use children for unsubscribed state */}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    );
  },
);
 
AnimatedSubscribeButton.displayName = "AnimatedSubscribeButton";

Update the import paths to match your project setup.
Usage

import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";

<AnimatedSubscribeButton>
  <span>Follow</span>
  <span>Subscribed</span>
</AnimatedSubscribeButton>

Props
Prop	Type	Default	Description
subscribeStatus	boolean	false	A boolean flag to check the condition for the button. This property can be used to toggle the button's state, such as subscribed or unsubscribed.
children	React.ReactNode	-	The content to be displayed inside the button. Should contain two children - first for unsubscribed state and second for subscribed state.
className	string	-	Optional class name to be applied to the button for custom styling.
Credits