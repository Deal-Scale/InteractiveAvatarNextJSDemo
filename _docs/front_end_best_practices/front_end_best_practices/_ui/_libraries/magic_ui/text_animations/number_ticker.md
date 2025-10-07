Number Ticker

Animate numbers to count up or down to a target number

import { NumberTicker } from "@/registry/magicui/number-ticker";
 
export function NumberTickerDemo() {
  return (
    <NumberTicker
      value={100}
      className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
    />
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { useInView, useMotionValue, useSpring } from "motion/react";
import { ComponentPropsWithoutRef, useEffect, useRef } from "react";
 
import { cn } from "@/lib/_utils";

 
interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}
 
export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });
 
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction, startValue]);
 
  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [springValue, decimalPlaces],
  );
 
  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-wider text-black dark:text-white",
        className,
      )}
      {...props}
    >
      {startValue}
    </span>
  );
}

Update the import paths to match your project setup.
Example
Decimal

import { NumberTicker } from "@/registry/magicui/number-ticker";
 
export function NumberTickerDemo() {
  return (
    <NumberTicker
      value={5.67}
      decimalPlaces={2}
      className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
    />
  );
}

Start Value

import { NumberTicker } from "@/registry/magicui/number-ticker";
 
export function NumberTickerDemo() {
  return (
    <NumberTicker
      value={100}
      startValue={80}
      className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
    />
  );
}

Usage

import { NumberTicker } from "@/components/magicui/number-ticker";

<NumberTicker value={100} />

Props
Prop	Type	Default	Description
value	int	0	The value to count to
direction	up | down	"up"	The direction to count in
delay	number	0	The delay before counting
decimalPlaces	number	0	The number of decimal places to show
startValue	number	0	The value to start counting from