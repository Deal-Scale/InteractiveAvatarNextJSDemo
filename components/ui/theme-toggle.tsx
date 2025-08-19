"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

import { useThemeStore } from "@/lib/stores/theme";

/****
 * Accessible theme toggle that cycles through: system -> light -> dark -> system.
 * - Keyboard accessible (Enter/Space)
 * - Announces current theme via aria-label
 * - No SSR flash: waits for mount before rendering icon
 */
export function ThemeToggle() {
	const { systemTheme } = useTheme();
	const mode = useThemeStore((s) => s.mode);
	const setMode = useThemeStore((s) => s.setMode);
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => setMounted(true), []);

	const effectiveTheme = mode === "system" ? systemTheme : mode;

	const cycle = React.useCallback(() => {
		if (mode === "system") setMode("light");
		else if (mode === "light") setMode("dark");
		else setMode("system");
	}, [mode, setMode]);

	const label = `Toggle theme (current: ${mode ?? "system"}${mounted ? `, effective: ${effectiveTheme}` : ""})`;

	return (
		<button
			aria-label={label}
			className="inline-flex items-center justify-center rounded-md border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground px-2.5 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			title={label}
			type="button"
			onClick={cycle}
		>
			{!mounted ? null : effectiveTheme === "dark" ? (
				<Moon className="h-4 w-4" />
			) : effectiveTheme === "light" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Monitor className="h-4 w-4" />
			)}
			<span className="sr-only">Toggle theme</span>
		</button>
	);
}
