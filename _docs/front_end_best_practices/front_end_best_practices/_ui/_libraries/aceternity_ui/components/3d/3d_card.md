3D Card Effect

A card perspective effect, hover over the card to elevate card elements.
card
background
special

"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export function ThreeDCardDemo() {
return (
<CardContainer className="inter-var">
<CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
<CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
Make things float in air
</CardItem>
<CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
Hover over this card to unleash the power of CSS perspective
</CardItem>
<CardItem translateZ="100" className="w-full mt-4">
<img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
</CardItem>
<div className="flex justify-between items-center mt-20">
<CardItem
            translateZ={20}
            as="a"
            href="https://twitter.com/mannupaaji"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
Try now →
</CardItem>
<CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
Sign up
</CardItem>
</div>
</CardBody>
</CardContainer>
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

components/ui/3d-card.tsx

"use client";

import { cn } from "@/lib/utils";

import React, {
createContext,
useState,
useContext,
useRef,
useEffect,
} from "react";

const MouseEnterContext = createContext<
[boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined

> (undefined);

export const CardContainer = ({
children,
className,
containerClassName,
}: {
children?: React.ReactNode;
className?: string;
containerClassName?: string;
}) => {
const containerRef = useRef<HTMLDivElement>(null);
const [isMouseEntered, setIsMouseEntered] = useState(false);

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
if (!containerRef.current) return;
const { left, top, width, height } =
containerRef.current.getBoundingClientRect();
const x = (e.clientX - left - width / 2) / 25;
const y = (e.clientY - top - height / 2) / 25;
containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
};

const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
setIsMouseEntered(true);
if (!containerRef.current) return;
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
if (!containerRef.current) return;
setIsMouseEntered(false);
containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
};
return (
<MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
<div
className={cn(
"py-20 flex items-center justify-center",
containerClassName
)}
style={{
          perspective: "1000px",
        }} >
<div
ref={containerRef}
onMouseEnter={handleMouseEnter}
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
className={cn(
"flex items-center justify-center relative transition-all duration-200 ease-linear",
className
)}
style={{
            transformStyle: "preserve-3d",
          }} >
{children}
</div>
</div>
</MouseEnterContext.Provider>
);
};

export const CardBody = ({
children,
className,
}: {
children: React.ReactNode;
className?: string;
}) => {
return (
<div
className={cn(
"h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
className
)} >
{children}
</div>
);
};

export const CardItem = ({
as: Tag = "div",
children,
className,
translateX = 0,
translateY = 0,
translateZ = 0,
rotateX = 0,
rotateY = 0,
rotateZ = 0,
...rest
}: {
as?: React.ElementType;
children: React.ReactNode;
className?: string;
translateX?: number | string;
translateY?: number | string;
translateZ?: number | string;
rotateX?: number | string;
rotateY?: number | string;
rotateZ?: number | string;
[key: string]: any;
}) => {
const ref = useRef<HTMLDivElement>(null);
const [isMouseEntered] = useMouseEnter();

useEffect(() => {
handleAnimations();
}, [isMouseEntered]);

const handleAnimations = () => {
if (!ref.current) return;
if (isMouseEntered) {
ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
} else {
ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
}
};

return (
<Tag
ref={ref}
className={cn("w-fit transition duration-200 ease-linear", className)}
{...rest} >
{children}
</Tag>
);
};

// Create a hook to use the context
export const useMouseEnter = () => {
const context = useContext(MouseEnterContext);
if (context === undefined) {
throw new Error("useMouseEnter must be used within a MouseEnterProvider");
}
return context;
};

Examples

With rotation

"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";

export function ThreeDCardDemo() {
return (
<CardContainer className="inter-var">
<CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
<CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
Make things float in air
</CardItem>
<CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
Hover over this card to unleash the power of CSS perspective
</CardItem>
<CardItem
          translateZ="100"
          rotateX={20}
          rotateZ={-10}
          className="w-full mt-4"
        >
<img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
</CardItem>
<div className="flex justify-between items-center mt-20">
<CardItem
            translateZ={20}
            translateX={-40}
            as="button"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
          >
Try now →
</CardItem>
<CardItem
            translateZ={20}
            translateX={40}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
Sign up
</CardItem>
</div>
</CardBody>
</CardContainer>
);
}

Props

CardContainer
Prop Type Description
children React.ReactNode The child elements to be rendered within the container.
className string The CSS class to be applied to the container.
containerClassName string The CSS class to be applied to the outer container.

CardBody
Prop Type Description
children React.ReactNode The child elements to be rendered within the body.
className string The CSS class to be applied to the body.

CardItem
Prop Type Description
as React.ElementType The HTML tag to be used for the item. Defaults to "div".
children React.ReactNode The child elements to be rendered within the item.
className string The CSS class to be applied to the item.
translateX number or string The X translation of the item.
translateY number or string The Y translation of the item.
translateZ number or string The Z translation of the item.
rotateX number or string The X rotation of the item.
rotateY number or string The Y rotation of the item.
rotateZ number or string The Z rotation of the item.
Build websites faster and 10x better than your competitors with Aceternity UI Pro

With the best in class components and templates, stand out from the crowd and get more attention to your website. Trusted by founders and entrepreneurs from all over the world.
Go Pro
Manu was such a
