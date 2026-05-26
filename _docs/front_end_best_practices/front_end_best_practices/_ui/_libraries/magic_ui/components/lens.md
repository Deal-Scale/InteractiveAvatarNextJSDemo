Lens

A interactive component that enables zooming into images, videos and other elements.

/* eslint-disable @next/next/no-img-element */
 
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lens } from "@/registry/magicui/lens";
 
export function LensDemo() {
  return (
    <Card className="relative max-w-md shadow-none">
      <CardHeader>
        <Lens
          zoomFactor={2}
          lensSize={150}
          isStatic={false}
          ariaLabel="Zoom Area"
        >
          <img
            src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="image placeholder"
            width={500}
            height={500}
          />
        </Lens>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">Your next camp</CardTitle>
        <CardDescription>
          See our latest and best camp destinations all across the five
          continents of the globe.
        </CardDescription>
      </CardContent>
      <CardFooter className="space-x-4">
        <Button>Let&apos;s go</Button>
        <Button variant="secondary">Another time</Button>
      </CardFooter>
    </Card>
  );
}

Installation
Copy and paste the following code into your project.

"use client";
 
import { AnimatePresence, motion, useMotionTemplate } from "motion/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
 
interface Position {
  /** The x coordinate of the lens */
  x: number;
  /** The y coordinate of the lens */
  y: number;
}
 
interface LensProps {
  /** The children of the lens */
  children: React.ReactNode;
  /** The zoom factor of the lens */
  zoomFactor?: number;
  /** The size of the lens */
  lensSize?: number;
  /** The position of the lens */
  position?: Position;
  /** The default position of the lens */
  defaultPosition?: Position;
  /** Whether the lens is static */
  isStatic?: boolean;
  /** The duration of the animation */
  duration?: number;
  /** The color of the lens */
  lensColor?: string;
  /** The aria label of the lens */
  ariaLabel?: string;
}
 
export function Lens({
  children,
  zoomFactor = 1.3,
  lensSize = 170,
  isStatic = false,
  position = { x: 0, y: 0 },
  defaultPosition,
  duration = 0.1,
  lensColor = "black",
  ariaLabel = "Zoom Area",
}: LensProps) {
  if (zoomFactor < 1) {
    throw new Error("zoomFactor must be greater than 1");
  }
  if (lensSize < 0) {
    throw new Error("lensSize must be greater than 0");
  }
 
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState<Position>(position);
  const containerRef = useRef<HTMLDivElement>(null);
 
  const currentPosition = useMemo(() => {
    if (isStatic) return position;
    if (defaultPosition && !isHovering) return defaultPosition;
    return mousePosition;
  }, [isStatic, position, defaultPosition, isHovering, mousePosition]);
 
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);
 
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsHovering(false);
  }, []);
 
  const maskImage = useMotionTemplate`radial-gradient(circle ${
    lensSize / 2
  }px at ${currentPosition.x}px ${
    currentPosition.y
  }px, ${lensColor} 100%, transparent 100%)`;
 
  const LensContent = useMemo(() => {
    const { x, y } = currentPosition;
 
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.58 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration }}
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          transformOrigin: `${x}px ${y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    );
  }, [currentPosition, lensSize, lensColor, zoomFactor, children, duration]);
 
  return (
    <div
      ref={containerRef}
      className="relative z-20 overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
      {isStatic || defaultPosition ? (
        LensContent
      ) : (
        <AnimatePresence mode="popLayout">
          {isHovering && LensContent}
        </AnimatePresence>
      )}
    </div>
  );
}

Update the import paths to match your project setup.
Examples
Static Lens

/* eslint-disable @next/next/no-img-element */
 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lens } from "@/registry/magicui/lens";
 
export function LensDemo() {
  return (
    <Card className="relative max-w-md shadow-none">
      <CardHeader>
        <Lens isStatic position={{ x: 260, y: 150 }}>
          <img
            src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="image placeholder"
            width={500}
            height={500}
          />
        </Lens>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">Your next camp</CardTitle>
        <CardDescription>
          See our latest and best camp destinations all across the five
          continents of the globe.
        </CardDescription>
      </CardContent>
      <CardFooter className="space-x-4">
        <Button>Let&apos;s go</Button>
        <Button variant="secondary">Another time</Button>
      </CardFooter>
    </Card>
  );
}

Lens with a Default Position

/* eslint-disable @next/next/no-img-element */
 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lens } from "@/registry/magicui/lens";
 
export function LensDemo() {
  return (
    <Card className="relative max-w-md shadow-none">
      <CardHeader>
        <Lens defaultPosition={{ x: 260, y: 150 }}>
          <img
            src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="image placeholder"
            width={500}
            height={500}
          />
        </Lens>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">Your next camp</CardTitle>
        <CardDescription>
          See our latest and best camp destinations all across the five
          continents of the globe.
        </CardDescription>
      </CardContent>
      <CardFooter className="space-x-4">
        <Button>Let&apos;s go</Button>
        <Button variant="secondary">Another time</Button>
      </CardFooter>
    </Card>
  );
}

Usage

import { Lens } from "@/components/magicui/lens";

<Lens>
  <img src="/images/lens-demo.jpg" alt="Lens Demo" />
</Lens>

Props
Property	Type	Default	Description
children	React.ReactNode	-	The content that will be magnified by the lens
zoomFactor	number	1.3	The magnification factor of the lens
lensSize	number	170	The size of the lens in pixels (works as a diameter)
position	Position	-	The current position of the lens
defaultPosition	Position	-	The initial position of the lens
isStatic	boolean	false	Determines if the lens will remain in a fixed position
duration	number	0.1	Duration of the animation when the lens moves (in seconds)
lensColor	string	-	The color of the lens (CSS color value)
ariaLabel	string	-	Accessibility label for the lens component