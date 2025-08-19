"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { useThemeStore, ThemeEmotion, ThemeMode } from "@/lib/stores/theme";

const THEME_SET_EVENT = "app:theme:set";

function computeEmotionClass(
	emotion: ThemeEmotion,
	resolvedTheme?: string | null,
) {
	if (!emotion || emotion === "none") return null;
	const isDark = resolvedTheme === "dark";
	const suffix = isDark ? "dark" : "light";

	return `${emotion}-${suffix}`;
}

export default function ThemeBridge() {
	const { setTheme, resolvedTheme } = useTheme();
	const mode = useThemeStore((s) => s.mode);
	const emotion = useThemeStore((s) => s.emotion);
	const setStore = useThemeStore((s) => s.setTheme);

	// Apply emotion CSS class to <html>
	const applyEmotionClass = React.useCallback(
		(emo: ThemeEmotion, resolved: string | null | undefined) => {
			if (typeof document === "undefined") return;
			const root = document.documentElement;
			const cls = computeEmotionClass(emo, resolved);
			// remove previous classes
			const EMOTIONS: ThemeEmotion[] = [
				"happy",
				"sad",
				"anger",
				"fear",
				"surprise",
				"disgust",
				"neutral",
				"none",
			];

			EMOTIONS.forEach((e) => {
				if (e === "none") return;
				root.classList.remove(`${e}-light`);
				root.classList.remove(`${e}-dark`);
			});
			if (cls) root.classList.add(cls);
		},
		[],
	);

	// Keep next-themes in sync with store mode
	React.useEffect(() => {
		if (mode) setTheme(mode);
	}, [mode, setTheme]);

	// Keep emotion class in sync with store emotion and resolved light/dark
	React.useEffect(() => {
		applyEmotionClass(emotion, resolvedTheme);
	}, [emotion, resolvedTheme, applyEmotionClass]);

	// Listen for MCP theme events and update the store
	React.useEffect(() => {
		function onThemeEvent(e: Event) {
			const ce = e as CustomEvent<
				Partial<{ mode: ThemeMode; emotion: ThemeEmotion }>
			>;

			if (ce.detail) setStore(ce.detail);
		}
		window.addEventListener(THEME_SET_EVENT, onThemeEvent as EventListener);

		return () => {
			window.removeEventListener(
				THEME_SET_EVENT,
				onThemeEvent as EventListener,
			);
		};
	}, [setStore]);

	return null;
}
