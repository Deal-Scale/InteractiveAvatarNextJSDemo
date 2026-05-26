Border Beam

An animated beam of light which travels along the border of its container.

import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/registry/magicui/border-beam";

export function Component() {
return (
<Card className="relative w-[350px] overflow-hidden">
<CardHeader>
<CardTitle>Login</CardTitle>
<CardDescription>
Enter your credentials to access your account.
</CardDescription>
</CardHeader>
<CardContent>
<form>
<div className="grid w-full items-center gap-4">
<div className="flex flex-col space-y-1.5">
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="Enter your email" />
</div>
<div className="flex flex-col space-y-1.5">
<Label htmlFor="password">Password</Label>
<Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
</div>
</div>
</form>
</CardContent>
<CardFooter className="flex justify-between">
<Button variant="outline">Register</Button>
<Button>Login</Button>
</CardFooter>
<BorderBeam duration={8} size={100} />
</Card>
);
}

Installation
Copy and paste the following code into your project.

"use client";

import { cn } from "@/lib/_utils";

import { motion, MotionStyle, Transition } from "motion/react";

interface BorderBeamProps {
/\*\*

- The size of the border beam.
  \*/
  size?: number;
  /\*\*
- The duration of the border beam.
  \*/
  duration?: number;
  /\*\*
- The delay of the border beam.
  \*/
  delay?: number;
  /\*\*
- The color of the border beam from.
  \*/
  colorFrom?: string;
  /\*\*
- The color of the border beam to.
  \*/
  colorTo?: string;
  /\*\*
- The motion transition of the border beam.
  \*/
  transition?: Transition;
  /\*\*
- The class name of the border beam.
  \*/
  className?: string;
  /\*\*
- The style of the border beam.
  \*/
  style?: React.CSSProperties;
  /\*\*
- Whether to reverse the animation direction.
  \*/
  reverse?: boolean;
  /\*\*
- The initial offset position (0-100).
  \*/
  initialOffset?: number;
  }

export const BorderBeam = ({
className,
size = 50,
delay = 0,
duration = 6,
colorFrom = "#ffaa40",
colorTo = "#9c40ff",
transition,
style,
reverse = false,
initialOffset = 0,
}: BorderBeamProps) => {
return (
<div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
<motion.div
className={cn(
"absolute aspect-square",
"bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
className,
)}
style={
{
width: size,
offsetPath: `rect(0 auto auto 0 round ${size}px)`,
"--color-from": colorFrom,
"--color-to": colorTo,
...style,
} as MotionStyle
}
initial={{ offsetDistance: `${initialOffset}%` }}
animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
/>
</div>
);
};

Examples
2 Border Beams

import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "@/registry/magicui/border-beam";
import { Play, SkipBack, SkipForward } from "lucide-react";

export function MusicPlayer() {
return (
<Card className="relative w-[350px] overflow-hidden">
<CardHeader>
<CardTitle>Now Playing</CardTitle>
<CardDescription>Stairway to Heaven - Led Zeppelin</CardDescription>
</CardHeader>
<CardContent>
<div className="flex flex-col items-center gap-4">
<div className="h-48 w-48 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
<div className="h-1 w-full rounded-full bg-secondary">
<div className="h-full w-1/3 rounded-full bg-primary" />
</div>
<div className="flex w-full justify-between text-sm text-muted-foreground">
<span>2:45</span>
<span>8:02</span>
</div>
</div>
</CardContent>
<CardFooter className="flex justify-center gap-4">
<Button variant="outline" size="icon" className="rounded-full">
<SkipBack className="size-4" />
</Button>
<Button size="icon" className="rounded-full">
<Play className="size-4" />
</Button>
<Button variant="outline" size="icon" className="rounded-full">
<SkipForward className="size-4" />
</Button>
</CardFooter>
<BorderBeam
        duration={6}
        size={400}
        className="from-transparent via-red-500 to-transparent"
      />
<BorderBeam
        duration={6}
        delay={3}
        size={400}
        className="from-transparent via-blue-500 to-transparent"
      />
</Card>
);
}

Reverse

import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/registry/magicui/border-beam";

export function LoginForm() {
return (
<Card className="relative w-[350px] overflow-hidden">
<CardHeader>
<CardTitle>Login</CardTitle>
<CardDescription>
Enter your credentials to access your account.
</CardDescription>
</CardHeader>
<CardContent>
<form>
<div className="grid w-full items-center gap-4">
<div className="flex flex-col space-y-1.5">
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="Enter your email" />
</div>
<div className="flex flex-col space-y-1.5">
<Label htmlFor="password">Password</Label>
<Input
                id="password"
                type="password"
                placeholder="Enter your password"
              />
</div>
</div>
</form>
</CardContent>
<CardFooter className="flex justify-between">
<Button variant="outline">Register</Button>
<Button>Login</Button>
</CardFooter>
<BorderBeam
        duration={4}
        size={300}
        reverse
        className="from-transparent via-green-500 to-transparent"
      />
</Card>
);
}

Spring Animation

import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/registry/magicui/border-beam";

export function Component() {
return (
<Button className="relative overflow-hidden" size="lg" variant="outline">
Buy Now
<BorderBeam
size={40}
initialOffset={20}
className="from-transparent via-yellow-500 to-transparent"
transition={{
          type: "spring",
          stiffness: 60,
          damping: 20,
        }}
/>
</Button>
);
}

Usage

import { BorderBeam } from "@/components/magicui/border-beam";

<div className="relative h-[500px] w-full overflow-hidden">
  <BorderBeam />
</div>

Props
Border Beam
Prop Type Default Description
className string - Custom class to apply to the component
size number 50 Size of the beam
duration number 6 Duration of the animation in seconds
delay number 0 Delay before the animation starts
colorFrom string #ffaa40 Start color of the beam gradient
colorTo string #9c40ff End color of the beam gradient
transition Transition - Custom motion transition configuration
style React.CSSProperties - Custom CSS styles to apply
reverse boolean false Whether to reverse animation direction
initialOffset number 0 Initial offset position (0-100)
