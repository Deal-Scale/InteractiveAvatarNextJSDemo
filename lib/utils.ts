import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// SSR-safe accessors
export function safeWindow(): Window | null {
	return typeof window !== "undefined" ? window : null;
}

export function safeDocument(): Document | null {
	return typeof document !== "undefined" ? document : null;
}
