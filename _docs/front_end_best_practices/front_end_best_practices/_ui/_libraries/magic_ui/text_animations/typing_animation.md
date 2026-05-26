Typing Animation

Characters appearing in typed animation

import { TypingAnimation } from "@/registry/magicui/typing-animation";

export function TypingAnimationDemo() {
return <TypingAnimation>Typing Animation</TypingAnimation>;
}

Installation
Copy and paste the following code into your project.

"use client";

import { cn } from "@/lib/_utils";

import { motion, MotionProps } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps extends MotionProps {
children: string;
className?: string;
duration?: number;
delay?: number;
as?: React.ElementType;
startOnView?: boolean;
}

export function TypingAnimation({
children,
className,
duration = 100,
delay = 0,
as: Component = "div",
startOnView = false,
...props
}: TypingAnimationProps) {
const MotionComponent = motion.create(Component, {
forwardMotionProps: true,
});

const [displayedText, setDisplayedText] = useState<string>("");
const [started, setStarted] = useState(false);
const elementRef = useRef<HTMLElement | null>(null);

useEffect(() => {
if (!startOnView) {
const startTimeout = setTimeout(() => {
setStarted(true);
}, delay);
return () => clearTimeout(startTimeout);
}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setStarted(true);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();

}, [delay, startOnView]);

useEffect(() => {
if (!started) return;

    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };

}, [children, duration, started]);

return (
<MotionComponent
ref={elementRef}
className={cn(
"text-4xl font-bold leading-[5rem] tracking-[-0.02em]",
className,
)}
{...props} >
{displayedText}
</MotionComponent>
);
}

Update the import paths to match your project setup.
Usage

import { TypingAnimation } from "@/components/magicui/typing-animation";

<TypingAnimation>Typing Animation</TypingAnimation>

Props
Prop Type Default Description
children string - Text content to animate
className string - The class name to be applied to the component
duration number 100 Duration to wait in between each char type
delay number 0 Delay before animation starts (in ms)
as React.ElementType "div" Component to render as
startOnView boolean false Start animation when component is in view
