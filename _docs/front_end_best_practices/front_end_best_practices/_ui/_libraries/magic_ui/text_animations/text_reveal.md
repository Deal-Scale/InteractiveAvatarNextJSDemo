Animated Gradient Text

An animated gradient background which transitions between colors for text.

import { cn } from "@/lib/_utils";

import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text";
import { ChevronRight } from "lucide-react";
 
export function AnimatedGradientTextDemo() {
  return (
    <div className="group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
      <span
        className={cn(
          "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]",
        )}
        style={{
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract",
          WebkitClipPath: "padding-box",
        }}
      />
      🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
      <AnimatedGradientText className="text-sm font-medium">
        Introducing Magic UI
      </AnimatedGradientText>
      <ChevronRight
        className="ml-1 size-4 stroke-neutral-500 transition-transform
 duration-300 ease-in-out group-hover:translate-x-0.5"
      />
    </div>
  );
}

Installation
Copy and paste the following code into your project.

import { cn } from "@/lib/_utils";

import { ComponentPropsWithoutRef } from "react";
 
export interface AnimatedGradientTextProps
  extends ComponentPropsWithoutRef<"div"> {
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
}
 
export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          "--bg-size": `${speed * 300}%`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={cn(
        `inline animate-gradient bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-gradient: gradient 8s linear infinite;
 
  @keyframes gradient {
    to {
      background-position: var(--bg-size, 300%) 0;
    }
  }
}

Examples
Custom Speed

import { AnimatedGradientText } from "@/registry/magicui/animated-gradient-text";
 
export function AnimatedGradientTextDemo() {
  return (
    <AnimatedGradientText
      speed={2}
      colorFrom="#4ade80"
      colorTo="#06b6d4"
      className="text-4xl font-semibold tracking-tight"
    >
      Fast Gradient
    </AnimatedGradientText>
  );
}

Usage

import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

<AnimatedGradientText>Animated Gradient Text</AnimatedGradientText>

Props
Prop	Type	Default	Description
children	node	-	The children passed into the component
className	string	-	The class name to be applied
speed	number	1	The speed of the gradient animation
colorFrom	string	"#ffaa40"	The starting color of the gradient
colorTo	string	"#9c40ff"	The ending color of the gradient