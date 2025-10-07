Animated Shiny Text

A light glare effect which pans across text making it appear as if it is shimmering.

import { ArrowRightIcon } from "@radix-ui/react-icons";
 
import { cn } from "@/lib/_utils";

import { AnimatedShinyText } from "@/registry/magicui/animated-shiny-text";
 
export function AnimatedShinyTextDemo() {
  return (
    <div className="z-10 flex min-h-64 items-center justify-center">
      <div
        className={cn(
          "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <span>✨ Introducing Magic UI</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}

Installation
Copy and paste the following code into your project.

import { ComponentPropsWithoutRef, CSSProperties, FC } from "react";
 
import { cn } from "@/lib/_utils";

 
export interface AnimatedShinyTextProps
  extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}
 
export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70",
 
        // Shine effect
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
 
        // Shine gradient
        "bg-gradient-to-r from-transparent via-black/80 via-50% to-transparent  dark:via-white/80",
 
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-shiny-text: shiny-text 8s infinite;
 
  @keyframes shiny-text {
    0%,
    90%,
    100% {
      background-position: calc(-100% - var(--shiny-width)) 0;
    }
    30%,
    60% {
      background-position: calc(100% + var(--shiny-width)) 0;
    }
  }
}

Usage

import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

<AnimatedShinyText>Animated Shiny Text</AnimatedShinyText>

Props
Prop	Type	Default	Description
children	node	-	The text to be shimmered.
className	string	-	The class name to be applied to the shimmer.
shimmerWidth	number	100	The width of the shimmer in pixels.