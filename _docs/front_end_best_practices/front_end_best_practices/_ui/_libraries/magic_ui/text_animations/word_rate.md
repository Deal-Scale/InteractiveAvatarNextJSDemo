Word Rotate

A vertical rotation of words

import { WordRotate } from "@/registry/magicui/word-rotate";
 
export function WordRotateDemo() {
  return (
    <WordRotate
      className="text-4xl font-bold text-black dark:text-white"
      words={["Word", "Rotate"]}
    />
  );
}

Installation
Install the following dependencies:

pnpm add motion

Copy and paste the following code into your project.

"use client";
 
import { AnimatePresence, motion, MotionProps } from "motion/react";
import { useEffect, useState } from "react";
 
import { cn } from "@/lib/_utils";

 
interface WordRotateProps {
  words: string[];
  duration?: number;
  motionProps?: MotionProps;
  className?: string;
}
 
export function WordRotate({
  words,
  duration = 2500,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);
 
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [words, duration]);
 
  return (
    <div className="overflow-hidden py-2">
      <AnimatePresence mode="wait">
        <motion.h1
          key={words[index]}
          className={cn(className)}
          {...motionProps}
        >
          {words[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}

Update the import paths to match your project setup.
Usage

import { WordRotate } from "@/components/magicui/word-rotate";

<WordRotate words={["Word", "Rotate"]} />

Props
Prop	Type	Default	Description
className	string	-	The class name to be applied to the component
duration	number	2500	Duration of the animation
words	string[]	""	An array of words to rotate through
motionProps	HTMLMotionProps	{}	An object containing motion animation props