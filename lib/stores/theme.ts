import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

interface ThemeState {
	mode: ThemeMode;
	emotion: ThemeEmotion;
	// actions
	setMode: (mode: ThemeMode) => void;
	setEmotion: (emotion: ThemeEmotion) => void;
	setTheme: (p: Partial<{ mode: ThemeMode; emotion: ThemeEmotion }>) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			mode: "system",
			emotion: "none",
			setMode: (mode) => set({ mode }),
			setEmotion: (emotion) => set({ emotion }),
			setTheme: (p) => set((s) => ({ ...s, ...p })),
		}),
		{
			name: "theme-store",
			storage: createJSONStorage(() => localStorage),
			partialize: (s) => ({ mode: s.mode, emotion: s.emotion }),
		},
	),
);
