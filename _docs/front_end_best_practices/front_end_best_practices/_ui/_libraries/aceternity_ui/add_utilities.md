Add Utilities

Commonly used utilities for using Aceternity UI
Install dependencies

npm i motion clsx tailwind-merge

Add util file
lib/utils.ts

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

Next.js 15 and React 19 Framer Motion Fix

if you're using Next.js 15 and React 19, you'll need to the following changes in order to use framer motion (which is now motion), since framer motion is not compatible with React 19 yet.

 
 "dependencies": {
    "framer-motion": "^12.0.0-alpha.1",
    "next": "15.0.3",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "tailwind-merge": "^2.5.5"
  },
  "overrides": {
    "framer-motion": {
      "react": "19.0.0-rc-66855b96-20241106",
      "react-dom": "19.0.0-rc-66855b96-20241106"
    }
  },
 

if you're using motion instead of framer-motion, you can make the following changes:

 
 "dependencies": {
    "motion": "^12.0.0-alpha.1",
    "next": "15.0.3",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "tailwind-merge": "^2.5.5"
  },
  "overrides": {
    "motion": {
      "react": "19.0.0-rc-66855b96-20241106",
      "react-dom": "19.0.0-rc-66855b96-20241106"
    }
  },
 

Build websites fa