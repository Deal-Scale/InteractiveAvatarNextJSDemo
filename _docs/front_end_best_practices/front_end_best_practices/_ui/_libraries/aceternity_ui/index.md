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
