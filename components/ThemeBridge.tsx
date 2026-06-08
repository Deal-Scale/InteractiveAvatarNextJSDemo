"use client";

import { useTheme } from "next-themes";
import * as React from "react";

import {
	type ThemeEmotion,
	type ThemeMode,
	useThemeStore,
} from "@/lib/stores/theme";

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

function computeHostMoodClass(emotion: ThemeEmotion) {
	if (emotion === "happy" || emotion === "surprise") {
		return "variant-mood-energetic";
	}
	if (emotion === "neutral" || emotion === "sad" || emotion === "fear") {
		return "variant-mood-calm";
	}
	if (emotion === "anger" || emotion === "disgust") {
		return "variant-mood-focused";
	}

	return null;
}

export default function ThemeBridge() {
	const { setTheme, resolvedTheme } = useTheme();
	const mode = useThemeStore((s) => s.mode);
	const emotion = useThemeStore((s) => s.emotion);
	const setStore = useThemeStore((s) => s.setTheme);

	// SSR-safe window alias
	const w = typeof window !== "undefined" ? window : undefined;
	// SSR-safe document alias
	const d = typeof document !== "undefined" ? document : undefined;

	// Apply emotion CSS class to <html>
	const applyEmotionClass = React.useCallback(
		(emo: ThemeEmotion, resolved: string | null | undefined) => {
			if (!d) return;
			const root = d.documentElement;
			const cls = computeEmotionClass(emo, resolved);
			const hostMoodClass = computeHostMoodClass(emo);
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
			root.classList.remove(
				"variant-mood-calm",
				"variant-mood-energetic",
				"variant-mood-focused",
			);
			if (cls) root.classList.add(cls);
			if (hostMoodClass) root.classList.add(hostMoodClass);
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
		w?.addEventListener(THEME_SET_EVENT, onThemeEvent as EventListener);

		return () => {
			w?.removeEventListener(THEME_SET_EVENT, onThemeEvent as EventListener);
		};
	}, [setStore]);

	return null;
}
