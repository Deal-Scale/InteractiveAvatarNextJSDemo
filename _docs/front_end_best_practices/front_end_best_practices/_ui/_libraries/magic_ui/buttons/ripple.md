Ripple Button

An animated button with ripple useful for user engagement.

import { RippleButton } from "@/registry/magicui/ripple-button";
 
export function RippleButtonDemo() {
  return <RippleButton rippleColor="#ADD8E6">Click me</RippleButton>;
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { cn } from "@/lib/_utils";

import React, { MouseEvent, useEffect, useState } from "react";
 
interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: string;
}
 
export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "#ffffff",
      duration = "600ms",
      onClick,
      ...props
    },
    ref,
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([]);
 
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      onClick?.(event);
    };
 
    const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
 
      const newRipple = { x, y, size, key: Date.now() };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };
 
    useEffect(() => {
      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1];
        const timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key),
          );
        }, parseInt(duration));
        return () => clearTimeout(timeout);
      }
    }, [buttonRipples, duration]);
 
    return (
      <button
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-background px-4 py-2 text-center text-primary",
          className,
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <span
              className="absolute animate-rippling rounded-full bg-background opacity-30"
              key={ripple.key}
              style={{
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: rippleColor,
                transform: `scale(0)`,
              }}
            />
          ))}
        </span>
      </button>
    );
  },
);
 
RippleButton.displayName = "RippleButton";

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-rippling: rippling var(--duration) ease-out;
 
  @keyframes rippling {
    0% {
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
}

Usage

import { RippleButton } from "@/components/magicui/ripple-button";

<RippleButton>Ripple Button</RippleButton>

Props
Prop	Type	Default	Description
children	React.ReactNode	-	The content of the button.
className	string	-	Additional class names for the button.
rippleColor	string	-	The rbg numbers only for the color of the rippling waves.
duration	string	-	The time span of one ripple.