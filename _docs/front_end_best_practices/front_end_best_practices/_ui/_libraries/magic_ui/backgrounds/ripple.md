Ripple

An animated ripple effect typically used behind elements to emphasize them.

import { Ripple } from "@/registry/magicui/ripple";
 
export function RippleDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
        Ripple
      </p>
      <Ripple />
    </div>
  );
}

Installation
Copy and paste the following code into your project.

import React, { ComponentPropsWithoutRef, CSSProperties } from "react";
 
import { cn } from "@/lib/_utils";

 
interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}
 
export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className,
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        const borderOpacity = 5 + i * 5;
 
        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full border bg-foreground/25 shadow-xl`}
            style={
              {
                "--i": i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "1px",
                borderColor: `hsl(var(--foreground), ${borderOpacity / 100})`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});
 
Ripple.displayName = "Ripple";

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-ripple: ripple var(--duration, 2s) ease calc(var(--i, 0) * 0.2s)
    infinite;
 
  @keyframes ripple {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(0.9);
    }
  }
}

Usage

import { Ripple } from "@/components/magicui/ripple";

<div className="relative h-[500px] w-full overflow-hidden">
  <Ripple />
</div>

Props
Prop	Type	Default	Description
mainCircleSize	number	210	The size of the main circle in pixels
mainCircleOpacity	number	0.24	The opacity of the main circle
numCircles	number	8	The number of ripple circles to re