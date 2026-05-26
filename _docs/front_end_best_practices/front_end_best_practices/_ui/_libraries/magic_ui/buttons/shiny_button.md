Shimmer Button

A button with a shimmering light which travels around the perimeter.

import { ShimmerButton } from "@/registry/magicui/shimmer-button";
 
export function ShimmerButtonDemo() {
  return (
    <ShimmerButton className="shadow-2xl">
      <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
        Shimmer Button
      </span>
    </ShimmerButton>
  );
}

Installation
Copy and paste the following code into your project.

import React, { CSSProperties, ComponentPropsWithoutRef } from "react";
 
import { cn } from "@/lib/_utils";

 
export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}
 
export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        {children}
 
        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute size-full",
 
            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
 
            // transition
            "transform-gpu transition-all duration-300 ease-in-out",
 
            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
 
            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
          )}
        />
 
        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);
 
ShimmerButton.displayName = "ShimmerButton";

Update the import paths to match your project setup.
Add the required CSS animations

Add the following animations to your global CSS file.
app/globals.css

@theme inline {
  --animate-shimmer-slide: shimmer-slide var(--speed) ease-in-out infinite
    alternate;
  --animate-spin-around: spin-around calc(var(--speed) * 2) infinite linear;
 
  @keyframes shimmer-slide {
    to {
      transform: translate(calc(100cqw - 100%), 0);
    }
  }
  @keyframes spin-around {
    0% {
      transform: translateZ(0) rotate(0);
    }
    15%,
    35% {
      transform: translateZ(0) rotate(90deg);
    }
    65%,
    85% {
      transform: translateZ(0) rotate(270deg);
    }
    100% {
      transform: translateZ(0) rotate(360deg);
    }
  }
}

Usage

import { ShimmerButton } from "@/components/magicui/shimmer-button";

<ShimmerButton>Shimmer Button</ShimmerButton>

Props
Prop	Type	Default	Description
shimmerColor	string	#ffffff	The color of the shimmer
shimmerSize	string	0.05em	The size of the shimmer
borderRadius	string	100px	The border radius of the button
shimmerDuration	string	3s	The duration of the spark animation
background	string	rgba(0, 0, 0, 1)	The background of the button
className	string	undefined	The class name of the button
children	React.ReactNode	undefined	The children of the button
Credits