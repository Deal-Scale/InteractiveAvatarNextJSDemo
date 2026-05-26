Docs
Confetti
Confetti

Confetti animations are best used to delight your users when something special happens

"use client";

import { useRef } from "react";

import { Confetti, type ConfettiRef } from "@/registry/magicui/confetti";

export function ConfettiDemo() {
const confettiRef = useRef<ConfettiRef>(null);

return (
<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
<span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
Confetti
</span>

      <Confetti
        ref={confettiRef}
        className="absolute left-0 top-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef.current?.fire({});
        }}
      />
    </div>

);
}

Installation
Install the following dependencies:

pnpm add canvas-confetti

Copy and paste the following code into your project.

"use client";

import type {
GlobalOptions as ConfettiGlobalOptions,
CreateTypes as ConfettiInstance,
Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";
import type { ReactNode } from "react";
import React, {
createContext,
forwardRef,
useCallback,
useEffect,
useImperativeHandle,
useMemo,
useRef,
} from "react";

import { Button, ButtonProps } from "@/components/ui/button";

type Api = {
fire: (options?: ConfettiOptions) => void;
};

type Props = React.ComponentPropsWithRef<"canvas"> & {
options?: ConfettiOptions;
globalOptions?: ConfettiGlobalOptions;
manualstart?: boolean;
children?: ReactNode;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

// Define component first
const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
const {
options,
globalOptions = { resize: true, useWorker: true },
manualstart = false,
children,
...rest
} = props;
const instanceRef = useRef<ConfettiInstance | null>(null);

const canvasRef = useCallback(
(node: HTMLCanvasElement) => {
if (node !== null) {
if (instanceRef.current) return;
instanceRef.current = confetti.create(node, {
...globalOptions,
resize: true,
});
} else {
if (instanceRef.current) {
instanceRef.current.reset();
instanceRef.current = null;
}
}
},
[globalOptions],
);

const fire = useCallback(
async (opts = {}) => {
try {
await instanceRef.current?.({ ...options, ...opts });
} catch (error) {
console.error("Confetti error:", error);
}
},
[options],
);

const api = useMemo(
() => ({
fire,
}),
[fire],
);

useImperativeHandle(ref, () => api, [api]);

useEffect(() => {
if (!manualstart) {
(async () => {
try {
await fire();
} catch (error) {
console.error("Confetti effect error:", error);
}
})();
}
}, [manualstart, fire]);

return (
<ConfettiContext.Provider value={api}>
<canvas ref={canvasRef} {...rest} />
{children}
</ConfettiContext.Provider>
);
});

// Set display name immediately
ConfettiComponent.displayName = "Confetti";

// Export as Confetti
export const Confetti = ConfettiComponent;

interface ConfettiButtonProps extends ButtonProps {
options?: ConfettiOptions &
ConfettiGlobalOptions & { canvas?: HTMLCanvasElement };
children?: React.ReactNode;
}

const ConfettiButtonComponent = ({
options,
children,
...props
}: ConfettiButtonProps) => {
const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
try {
const rect = event.currentTarget.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top + rect.height / 2;
await confetti({
...options,
origin: {
x: x / window.innerWidth,
y: y / window.innerHeight,
},
});
} catch (error) {
console.error("Confetti button error:", error);
}
};

return (
<Button onClick={handleClick} {...props}>
{children}
</Button>
);
};

ConfettiButtonComponent.displayName = "ConfettiButton";

export const ConfettiButton = ConfettiButtonComponent;

Update the import paths to match your project setup.
Examples
Basic

import { ConfettiButton } from "@/registry/magicui/confetti";

export function ConfettiButtonDemo() {
return (
<div className="relative">
<ConfettiButton>Confetti 🎉</ConfettiButton>
</div>
);
}

Random Direction

import { ConfettiButton } from "@/registry/magicui/confetti";

export function ConfettiButtonDemo() {
return (
<div className="relative">
<ConfettiButton
options={{
          get angle() {
            return Math.random() * 360;
          },
        }} >
Random Confetti 🎉
</ConfettiButton>
</div>
);
}

Fireworks

"use client";

import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

export function ConfettiFireworks() {
const handleClick = () => {
const duration = 5 \* 1000;
const animationEnd = Date.now() + duration;
const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

};

return (
<div className="relative">
<Button onClick={handleClick}>Trigger Fireworks</Button>
</div>
);
}

Side Cannons

"use client";

import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

export function ConfettiSideCannons() {
const handleClick = () => {
const end = Date.now() + 3 \* 1000; // 3 seconds
const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();

};

return (
<div className="relative">
<Button onClick={handleClick}>Trigger Side Cannons</Button>
</div>
);
}

Stars

"use client";

import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

export function ConfettiStars() {
const handleClick = () => {
const defaults = {
spread: 360,
ticks: 50,
gravity: 0,
decay: 0.94,
startVelocity: 30,
colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
};

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);

};

return (
<div className="relative">
<Button onClick={handleClick}>Trigger Stars</Button>
</div>
);
}

Custom Shapes

"use client";

import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

export function ConfettiCustomShapes() {
const handleClick = () => {
const scalar = 2;
const triangle = confetti.shapeFromPath({
path: "M0 10 L5 0 L10 10z",
});
const square = confetti.shapeFromPath({
path: "M0 0 L10 0 L10 10 L0 10 Z",
});
const coin = confetti.shapeFromPath({
path: "M5 0 A5 5 0 1 0 5 10 A5 5 0 1 0 5 0 Z",
});
const tree = confetti.shapeFromPath({
path: "M5 0 L10 10 L0 10 Z",
});

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [triangle, square, coin, tree],
      scalar,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
      });

      confetti({
        ...defaults,
        particleCount: 5,
      });

      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);

};

return (
<div className="relative flex items-center justify-center">
<Button onClick={handleClick}>Trigger Shapes</Button>
</div>
);
}

Emoji

"use client";

import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";

export function ConfettiEmoji() {
const handleClick = () => {
const scalar = 2;
const unicorn = confetti.shapeFromText({ text: "🦄", scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [unicorn],
      scalar,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
      });

      confetti({
        ...defaults,
        particleCount: 5,
      });

      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);

};

return (
<div className="relative justify-center">
<Button onClick={handleClick}>Trigger Emoji</Button>
</div>
);
}

Usage

import { Confetti } from "@/components/magicui/confetti";

<Confetti />

Props
Confetti
Prop Type Default Description
particleCount Integer 50 The number of confetti particles to launch
angle Number 90 The angle in degrees at which to launch confetti
spread Number 45 The spread in degrees of the confetti
startVelocity Number 45 The initial velocity of the confetti
decay Number 0.9 The rate at which confetti slows down
gravity Number 1 The gravity applied to confetti particles
drift Number 0 The horizontal drift applied to particles
flat Boolean false Whether confetti particles are flat
ticks Number 200 The number of frames confetti lasts
origin Object { x: 0.5, y: 0.5 } The origin point of the confetti
colors Array of Strings ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'] Array of color strings in HEX format
shapes Array of Strings ['square', 'circle'] Array of shapes for the confetti
zIndex Integer 100 The z-index of the confetti
disableForReducedMotion Boolean false Disables confetti for users who prefer no motion
useWorker Boolean true Use Web Worker for better performance
resize Boolean true Whether to resize the canvas
canvas HTMLCanvasElement or null null Custom canvas element to draw confetti
scalar Number 1 Scaling factor for confetti size
ConfettiButton
Prop Type Default Description
options Object {} Options for the confetti
children React.ReactNode null Children to render inside the button
