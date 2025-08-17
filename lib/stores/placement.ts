import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DockMode = "bottom" | "right" | "floating";
export type VideoTab = "video" | "brain" | "data" | "actions";

export interface FloatingRect {
  x: number; // px from left
  y: number; // px from top
  width: number; // px
  height: number; // px
  visible: boolean;
}

export interface PlacementState {
  // Versioning for migrations
  schemaVersion: number;
  updatedAt: number; // epoch ms

  // Optional user scoping (set by app after login)
  userId?: string;
  setUserId: (id?: string) => void;

  // Docking mode for chat/video container
  dockMode: DockMode;
  setDockMode: (mode: DockMode) => void;

  // Bottom mode height (0..1 fraction of viewport height)
  bottomHeightFrac: number; // e.g., 0.35 means 35% height
  setBottomHeightFrac: (frac: number) => void;

  // Right mode width (0..1 fraction of viewport width)
  rightWidthFrac: number; // e.g., 0.3 means 30% width
  setRightWidthFrac: (frac: number) => void;

  // Floating window geometry
  floating: FloatingRect;
  setFloating: (rect: Partial<FloatingRect>) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active tab within video container
  activeVideoTab: VideoTab;
  setActiveVideoTab: (tab: VideoTab) => void;

  // Bulk update helper
  update: (patch: Partial<Omit<PlacementState,
    | "update"
    | "setUserId"
    | "setDockMode"
    | "setBottomHeightFrac"
    | "setRightWidthFrac"
    | "setFloating"
    | "setSidebarCollapsed"
    | "setActiveVideoTab"
  >>) => void;

  // Reset to defaults (keeps userId)
  reset: () => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const DEFAULTS = {
  schemaVersion: 1,
  dockMode: "bottom" as DockMode,
  bottomHeightFrac: 0.35,
  rightWidthFrac: 0.32,
  floating: { x: 80, y: 80, width: 420, height: 320, visible: false } as FloatingRect,
  sidebarCollapsed: false,
  activeVideoTab: "video" as VideoTab,
};

export const usePlacementStore = create<PlacementState>()(
  persist(
    (set, get) => ({
      schemaVersion: DEFAULTS.schemaVersion,
      updatedAt: Date.now(),
      userId: undefined,

      dockMode: DEFAULTS.dockMode,
      setDockMode: (mode) => set({ dockMode: mode, updatedAt: Date.now() }),

      bottomHeightFrac: DEFAULTS.bottomHeightFrac,
      setBottomHeightFrac: (frac) =>
        set({ bottomHeightFrac: clamp01(frac), updatedAt: Date.now() }),

      rightWidthFrac: DEFAULTS.rightWidthFrac,
      setRightWidthFrac: (frac) =>
        set({ rightWidthFrac: clamp01(frac), updatedAt: Date.now() }),

      floating: DEFAULTS.floating,
      setFloating: (rect) =>
        set({ floating: { ...get().floating, ...rect }, updatedAt: Date.now() }),

      sidebarCollapsed: DEFAULTS.sidebarCollapsed,
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: !!collapsed, updatedAt: Date.now() }),

      activeVideoTab: DEFAULTS.activeVideoTab,
      setActiveVideoTab: (tab) => set({ activeVideoTab: tab, updatedAt: Date.now() }),

      setUserId: (id) => set({ userId: id, updatedAt: Date.now() }),

      update: (patch) => set({ ...(patch as any), updatedAt: Date.now() }),

      reset: () =>
        set({
          ...DEFAULTS,
          userId: get().userId,
          schemaVersion: DEFAULTS.schemaVersion,
          updatedAt: Date.now(),
        }),
    }),
    {
      name: "placement-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        updatedAt: s.updatedAt,
        userId: s.userId,
        dockMode: s.dockMode,
        bottomHeightFrac: s.bottomHeightFrac,
        rightWidthFrac: s.rightWidthFrac,
        floating: s.floating,
        sidebarCollapsed: s.sidebarCollapsed,
        activeVideoTab: s.activeVideoTab,
      }),
      version: 1,
      migrate: (persisted, version) => {
        // Add migration logic on schema changes
        return persisted as any;
      },
    },
  ),
);
