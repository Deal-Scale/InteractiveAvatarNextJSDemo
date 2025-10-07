Feature Sections

A set of feature sections ranging from bento grids to simple layouts
card
features
bento grid
Installation
Install dependencies

npm i motion clsx tailwind-merge @tabler/icons-react cobe

Add util file
lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
return twMerge(clsx(inputs));
}

Bento Grid

import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

export function FeaturesSectionDemo() {
const features = [
{
title: "Track issues effectively",
description:
"Track and manage your project issues with ease using our intuitive interface.",
skeleton: <SkeletonOne />,
className:
"col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
},
{
title: "Capture pictures with AI",
description:
"Capture stunning photos effortlessly using our advanced AI technology.",
skeleton: <SkeletonTwo />,
className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
},
{
title: "Watch our AI on YouTube",
description:
"Whether its you or Tyler Durden, you can get to know about our product on YouTube",
skeleton: <SkeletonThree />,
className:
"col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
},
{
title: "Deploy in seconds",
description:
"With our blazing fast, state of the art, cutting edge, we are so back cloud servies (read AWS) - you can deploy your model in seconds.",
skeleton: <SkeletonFour />,
className: "col-span-1 lg:col-span-3 border-b lg:border-none",
},
];
return (
<div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
<div className="px-8">
<h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
Packed with thousands of features
</h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          From Image generation to video generation, Everything AI has APIs for
          literally everything. It can even create this website copy for you.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>

);
}

const FeatureCard = ({
children,
className,
}: {
children?: React.ReactNode;
className?: string;
}) => {
return (
<div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
{children}
</div>
);
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
return (
<p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
{children}
</p>
);
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
return (
<p
className={cn(
"text-sm md:text-base max-w-4xl text-left mx-auto",
"text-neutral-500 text-center font-normal dark:text-neutral-300",
"text-left max-w-sm mx-0 md:text-sm my-2"
)} >
{children}
</p>
);
};

export const SkeletonOne = () => {
return (
<div className="relative flex py-8 px-2 gap-10 h-full">
<div className="w-full  p-5  mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
<div className="flex flex-1 w-full h-full flex-col space-y-2  ">
{/_ TODO _/}
<img
            src="/linear.webp"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-left-top rounded-sm"
          />
</div>
</div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>

);
};

export const SkeletonThree = () => {
return (
<a
      href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
      target="__blank"
      className="relative flex gap-10  h-full group/image"
    >
<div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
<div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
{/_ TODO _/}
<IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
<img
            src="https://assets.aceternity.com/fireship.jpg"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
</div>
</div>
</a>
);
};

export const SkeletonTwo = () => {
const images = [
"https://images.unsplash.com/photo-1517322048670-4fba75cbbb62?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=3425&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1554931670-4ebfabf6e7a9?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
"https://images.unsplash.com/photo-1546484475-7f7bd55792da?q=80&w=2581&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const imageVariants = {
whileHover: {
scale: 1.1,
rotate: 0,
zIndex: 100,
},
whileTap: {
scale: 1.1,
rotate: 0,
zIndex: 100,
},
};
return (
<div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
{/_ TODO _/}
<div className="flex flex-row -ml-20">
{images.map((image, idx) => (
<motion.div
variants={imageVariants}
key={"images-first" + idx}
style={{
              rotate: Math.random() * 20 - 10,
            }}
whileHover="whileHover"
whileTap="whileTap"
className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden" >
<img
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
</motion.div>
))}
</div>
<div className="flex flex-row">
{images.map((image, idx) => (
<motion.div
key={"images-second" + idx}
style={{
              rotate: Math.random() * 20 - 10,
            }}
variants={imageVariants}
whileHover="whileHover"
whileTap="whileTap"
className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 shrink-0 overflow-hidden" >
<img
              src={image}
              alt="bali images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
</motion.div>
))}
</div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent  h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-white dark:from-black  to-transparent h-full pointer-events-none" />
    </div>

);
};

export const SkeletonFour = () => {
return (
<div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
<Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
</div>
);
};

export const Globe = ({ className }: { className?: string }) => {
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };

}, []);

return (
<canvas
ref={canvasRef}
style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
className={className}
/>
);
};

Simple with card gradient

import React from "react";
import { useId } from "react";

export function FeaturesSectionDemo() {
return (
<div className="py-20 lg:py-40">
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
{grid.map((feature) => (
<div
            key={feature.title}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden"
          >
<Grid size={20} />
<p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
{feature.title}
</p>
<p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
{feature.description}
</p>
</div>
))}
</div>
</div>
);
}

const grid = [
{
title: "HIPAA and SOC2 Compliant",
description:
"Our applications are HIPAA and SOC2 compliant, your data is safe with us, always.",
},
{
title: "Automated Social Media Posting",
description:
"Schedule and automate your social media posts across multiple platforms to save time and maintain a consistent online presence.",
},
{
title: "Advanced Analytics",
description:
"Gain insights into your social media performance with detailed analytics and reporting tools to measure engagement and ROI.",
},
{
title: "Content Calendar",
description:
"Plan and organize your social media content with an intuitive calendar view, ensuring you never miss a post.",
},
{
title: "Audience Targeting",
description:
"Reach the right audience with advanced targeting options, including demographics, interests, and behaviors.",
},
{
title: "Social Listening",
description:
"Monitor social media conversations and trends to stay informed about what your audience is saying and respond in real-time.",
},
{
title: "Customizable Templates",
description:
"Create stunning social media posts with our customizable templates, designed to fit your brand's unique style and voice.",
},
{
title: "Collaboration Tools",
description:
"Work seamlessly with your team using our collaboration tools, allowing you to assign tasks, share drafts, and provide feedback in real-time.",
},
];

export const Grid = ({
pattern,
size,
}: {
pattern?: number[][];
size?: number;
}) => {
const p = pattern ?? [
[Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
[Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
[Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
[Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
[Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
];
return (
<div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
<div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
<GridPattern
width={size ?? 20}
height={size ?? 20}
x="-12"
y="4"
squares={p}
className="absolute inset-0 h-full w-full mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
/>
</div>
</div>
);
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
const patternId = useId();

return (
<svg aria-hidden="true" {...props}>
<defs>
<pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
<path d={`M.5 ${height}V.5H${width}`} fill="none" />
</pattern>
</defs>
<rect
width="100%"
height="100%"
strokeWidth={0}
fill={`url(#${patternId})`}
/>
{squares && (
<svg x={x} y={y} className="overflow-visible">
{squares.map(([x, y]: any) => (
<rect
strokeWidth="0"
key={`${x}-${y}`}
width={width + 1}
height={height + 1}
x={x _ width}
y={y _ height}
/>
))}
</svg>
)}
</svg>
);
}

Simple with hover effects

import { cn } from "@/lib/utils";
import {
IconAdjustmentsBolt,
IconCloud,
IconCurrencyDollar,
IconEaseInOut,
IconHeart,
IconHelp,
IconRouteAltLeft,
IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionDemo() {
const features = [
{
title: "Built for developers",
description:
"Built for engineers, developers, dreamers, thinkers and doers.",
icon: <IconTerminal2 />,
},
{
title: "Ease of use",
description:
"It's as easy as using an Apple, and as expensive as buying one.",
icon: <IconEaseInOut />,
},
{
title: "Pricing like no other",
description:
"Our prices are best in the market. No cap, no lock, no credit card required.",
icon: <IconCurrencyDollar />,
},
{
title: "100% Uptime guarantee",
description: "We just cannot be taken down by anyone.",
icon: <IconCloud />,
},
{
title: "Multi-tenant Architecture",
description: "You can simply share passwords instead of buying new seats",
icon: <IconRouteAltLeft />,
},
{
title: "24/7 Customer Support",
description:
"We are available a 100% of the time. Atleast our AI Agents are.",
icon: <IconHelp />,
},
{
title: "Money back guarantee",
description:
"If you donot like EveryAI, we will convince you to like us.",
icon: <IconAdjustmentsBolt />,
},
{
title: "And everything else",
description: "I just ran out of copy ideas. Accept my sincere apologies",
icon: <IconHeart />,
},
];
return (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
{features.map((feature, index) => (
<Feature key={feature.title} {...feature} index={index} />
))}
</div>
);
}

const Feature = ({
title,
description,
icon,
index,
}: {
title: string;
description: string;
icon: React.ReactNode;
index: number;
}) => {
return (
<div
className={cn(
"flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
(index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
index < 4 && "lg:border-b dark:border-neutral-800"
)} >
{index < 4 && (
<div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
)}
{index >= 4 && (
<div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
)}
<div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
{icon}
</div>
<div className="text-lg font-bold mb-2 relative z-10 px-10">
<div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
<span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
{title}
</span>
</div>
<p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
{description}
</p>
</div>
);
