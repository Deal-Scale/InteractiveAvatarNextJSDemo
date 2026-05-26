Aurora Text

A beautiful aurora text effect

import { AuroraText } from "@/registry/magicui/aurora-text";
 
export function AuroraTextDemo() {
  return (
    <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
      Ship <AuroraText>beautiful</AuroraText>
    </h1>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import React, { memo } from "react";
 
interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}
 
export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${
        colors[0]
      })`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${10 / speed}s`,
    };
 
    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  },
);
 
AuroraText.displayName = "AuroraText";

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-aurora: aurora 8s ease-in-out infinite alternate;
 
  @keyframes aurora {
    0% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
    25% {
      background-position: 50% 100%;
      transform: rotate(5deg) scale(1.1);
    }
    50% {
      background-position: 100% 50%;
      transform: rotate(-3deg) scale(0.95);
    }
    75% {
      background-position: 50% 0%;
      transform: rotate(3deg) scale(1.05);
    }
    100% {
      background-position: 0% 50%;
      transform: rotate(-5deg) scale(0.9);
    }
  }
}

Usage

import { AuroraText } from "@/components/magicui/aurora-text";

<AuroraText>Aurora Text</AuroraText>

Props
Prop	Type	Default	Description
className	string	""	The class name to be applied to the component
children	ReactNode	-	Children elements
colors	string[]	["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]	Array of colors used for the aurora effect
speed	number	1	Animation speed multiplier (1 is default, 2 is twice as fast)