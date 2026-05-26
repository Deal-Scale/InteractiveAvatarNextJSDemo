Line Shadow Text

A text component with a moving line shadow.

"use client";
 
import { LineShadowText } from "@/registry/magicui/line-shadow-text";
import { useTheme } from "next-themes";
 
export function LineShadowTextDemo() {
  const theme = useTheme();
  const shadowColor = theme.resolvedTheme === "dark" ? "white" : "black";
  return (
    <h1 className="text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
      Ship
      <LineShadowText className="italic" shadowColor={shadowColor}>
        Fast
      </LineShadowText>
    </h1>
  );
}

Installation
Copy and paste the following code into your project.

import { cn } from "@/lib/_utils";

import { motion, MotionProps } from "motion/react";
 
interface LineShadowTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
    MotionProps {
  shadowColor?: string;
  as?: React.ElementType;
}
 
export function LineShadowText({
  children,
  shadowColor = "black",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const MotionComponent = motion.create(Component);
  const content = typeof children === "string" ? children : null;
 
  if (!content) {
    throw new Error("LineShadowText only accepts string content");
  }
 
  return (
    <MotionComponent
      style={{ "--shadow-color": shadowColor } as React.CSSProperties}
      className={cn(
        "relative z-0 inline-flex",
        "after:absolute after:left-[0.04em] after:top-[0.04em] after:content-[attr(data-text)]",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]",
        "after:-z-10 after:bg-[length:0.06em_0.06em] after:bg-clip-text after:text-transparent",
        "after:animate-line-shadow",
        className,
      )}
      data-text={content}
      {...props}
    >
      {content}
    </MotionComponent>
  );
}

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-line-shadow: line-shadow 15s linear infinite;
 
  @keyframes line-shadow {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 100% -100%;
    }
  }
}

Usage

import { LineShadowText } from "@/components/magicui/line-shadow-text";

<LineShadowText>Magic UI</LineShadowText>

Props
Prop	Type	Default	Description
shadowColor	string	"black"	The color of the shadow effect
children	string	-	The text to display with shadow effect
as	string	"span"	The HTML element to render the text as