import type { UserSettings, AppGlobalSettings } from "@/lib/schemas/global";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  userSettings?: UserSettings;
  setUserSettings: (s: UserSettings) => void;
  clearUserSettings: () => void;

  globalSettings?: AppGlobalSettings;
  setGlobalSettings: (s: AppGlobalSettings) => void;
  clearGlobalSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      userSettings: undefined,
      setUserSettings: (s) => set({ userSettings: s }),
      clearUserSettings: () => set({ userSettings: undefined }),

      globalSettings: undefined,
      setGlobalSettings: (s) => set({ globalSettings: s }),
      clearGlobalSettings: () => set({ globalSettings: undefined }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userSettings: state.userSettings,
        globalSettings: state.globalSettings,
      }),
    },
  ),
);
