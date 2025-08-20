// MCP Theme utility: lets agents or non-React code control theme.
// Provides both CustomEvent-based API and optional window global.

export type ThemeMode = "system" | "light" | "dark";
export type ThemeEmotion =
	| "none"
	| "happy"
	| "sad"
	| "anger"
	| "fear"
	| "surprise"
	| "disgust"
	| "neutral";

export type ThemePatch = Partial<{ mode: ThemeMode; emotion: ThemeEmotion }>;

const THEME_SET_EVENT = "app:theme:set";

function hasWindow(): boolean {
	return typeof window !== "undefined";
}

const w = typeof window !== "undefined" ? window : undefined;

export function setThemeMode(mode: ThemeMode) {
	if (!hasWindow()) return;
	w?.dispatchEvent(new CustomEvent(THEME_SET_EVENT, { detail: { mode } }));
}

export function setThemeEmotion(emotion: ThemeEmotion) {
	if (!hasWindow()) return;
	w?.dispatchEvent(new CustomEvent(THEME_SET_EVENT, { detail: { emotion } }));
}

export function setTheme(patch: ThemePatch) {
	if (!hasWindow()) return;
	w?.dispatchEvent(new CustomEvent(THEME_SET_EVENT, { detail: patch }));
}

// Optional global for direct control
declare global {
	interface Window {
		mcpTheme?: {
			setMode: (mode: ThemeMode) => void;
			setEmotion: (emotion: ThemeEmotion) => void;
			setTheme: (patch: ThemePatch) => void;
		};
	}
}

if (hasWindow()) {
	try {
		if (w)
			w.mcpTheme = {
				setMode: setThemeMode,
				setEmotion: setThemeEmotion,
				setTheme,
			};
	} catch {}
}
