Background Boxes

A full width background box container that highlights on hover
card
background
gradient
special
call to action

"use client";
import React from "react";
import { Boxes } from "../ui/background-boxes";
import { cn } from "@/lib/_utils";


export function BackgroundBoxesDemo() {
return (
<div className="h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
<div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20")}>
        Tailwind is Awesome
      </h1>
      <p className="text-center mt-2 text-neutral-300 relative z-20">
        Framer motion is the best animation library ngl
      </p>
    </div>

);
}

Installation
Install dependencies

npm i motion clsx tailwind-merge

Add util file
lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}

Copy the source code

components/ui/background-boxes.tsx

"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/_utils";


export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
const rows = new Array(150).fill(1);
const cols = new Array(100).fill(1);
let colors = [
"#93c5fd",
"#f9a8d4",
"#86efac",
"#fde047",
"#fca5a5",
"#d8b4fe",
"#93c5fd",
"#a5b4fc",
"#c4b5fd",
];
const getRandomColor = () => {
return colors[Math.floor(Math.random() * colors.length)];
};

return (
<div
style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
className={cn(
"absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
className,
)}
{...rest} >
{rows.map((_, i) => (
<motion.div
key={`row` + i}
className="relative h-8 w-16 border-l border-slate-700" >
{cols.map((_, j) => (
<motion.div
whileHover={{
                backgroundColor: `${getRandomColor()}`,
                transition: { duration: 0 },
              }}
animate={{
                transition: { duration: 2 },
              }}
key={`col` + j}
className="relative h-8 w-16 border-t border-r border-slate-700" >
{j % 2 === 0 && i % 2 === 0 ? (
<svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-slate-700"
                >
<path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
</svg>
) : null}
</motion.div>
))}
</motion.div>
))}
</div>
);
};

export const Boxes = React.memo(BoxesCore);

Props
Prop name Type Description
className string (optional) The class name of the Boxes component.
rest any (optional) The rest of the props.
Build websites faster and 10x better than your competitors with Aceternity UI Pro

With the best in class components and templates, stand out from the crowd and get more attention to your website. Trusted by founders and entrepreneurs from all over the world.
Go Pro
I've been working
