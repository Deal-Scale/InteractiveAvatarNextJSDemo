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

  // Optional pixel offset convenience (UI specific; not required by layout engine)
  bottomOffset?: number;
  setBottomOffset: (px: number) => void;

  // Right mode width (0..1 fraction of viewport width)
  rightWidthFrac: number; // e.g., 0.3 means 30% width
  setRightWidthFrac: (frac: number) => void;

  // Floating window geometry
  floating: FloatingRect;
  setFloating: (rect: Partial<FloatingRect>) => void;

  // Convenience alias API requested by docs
  isWindowed: boolean; // mirrors dockMode === "floating"
  setIsWindowed: (v: boolean) => void;
  windowPosition: { x: number; y: number };
  setWindowPosition: (pos: { x: number; y: number }) => void;
  windowSize: { width: number; height: number };
  setWindowSize: (size: { width: number; height: number }) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Alias for expanded flag expected by some components
  sidebarExpanded: boolean; // derived from !sidebarCollapsed
  setSidebarExpanded: (v: boolean) => void;

  // Active tab within video container
  activeVideoTab: VideoTab;
  setActiveVideoTab: (tab: VideoTab) => void;

  // Alias for generic active tab name used by docs/components
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Bulk update helper
  update: (
    patch: Partial<
      Omit<
        PlacementState,
        | "update"
        | "setUserId"
        | "setDockMode"
        | "setBottomHeightFrac"
        | "setRightWidthFrac"
        | "setFloating"
        | "setSidebarCollapsed"
        | "setActiveVideoTab"
      >
    >,
  ) => void;

  // Reset to defaults (keeps userId)
  reset: () => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const DEFAULTS = {
  schemaVersion: 1,
  dockMode: "bottom" as DockMode,
  bottomHeightFrac: 0.35,
  rightWidthFrac: 0.32,
  floating: {
    x: 80,
    y: 80,
    width: 420,
    height: 320,
    visible: false,
  } as FloatingRect,
  sidebarCollapsed: false,
  activeVideoTab: "video" as VideoTab,
};

// Per-user storage key helper
const ANON_ID = "anon";
let currentUserIdForStorage: string | undefined = undefined;
const keyForUser = (id?: string) => `placement-store-${id || ANON_ID}`;

const userScopedStorage = {
  getItem: (_name: string): string | null => {
    try {
      const k = keyForUser(currentUserIdForStorage);

      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },

  setItem: (_name: string, _value: string): void => {
    try {
      const k = keyForUser(currentUserIdForStorage);

      localStorage.setItem(k, _value);
    } catch {
      // no-op
    }
  },

  removeItem: (_name: string): void => {
    try {
      const k = keyForUser(currentUserIdForStorage);

      localStorage.removeItem(k);
    } catch {
      // no-op
    }
  },
};

function loadPersistedForUser(
  id?: string,
): Partial<PlacementState> | undefined {
  try {
    const raw = localStorage.getItem(keyForUser(id));

    if (!raw) return undefined;
    const parsed = JSON.parse(raw);

    // Zustand persist stores { state, version }
    if (parsed && parsed.state) return parsed.state as Partial<PlacementState>;
  } catch {
    // ignore
  }

  return undefined;
}

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

      bottomOffset: 0,
      setBottomOffset: (px) =>
        set({
          bottomOffset: Math.max(0, Math.floor(px)),
          updatedAt: Date.now(),
        }),

      rightWidthFrac: DEFAULTS.rightWidthFrac,
      setRightWidthFrac: (frac) =>
        set({ rightWidthFrac: clamp01(frac), updatedAt: Date.now() }),

      floating: DEFAULTS.floating,
      setFloating: (rect) =>
        set({
          floating: { ...get().floating, ...rect },
          updatedAt: Date.now(),
        }),

      // Aliases
      get isWindowed() {
        return get().dockMode === "floating";
      },
      setIsWindowed: (v) =>
        set({
          dockMode: v ? "floating" : DEFAULTS.dockMode,
          updatedAt: Date.now(),
        }),
      get windowPosition() {
        return { x: get().floating.x, y: get().floating.y };
      },
      setWindowPosition: (pos) =>
        set({
          floating: { ...get().floating, x: pos.x, y: pos.y },
          updatedAt: Date.now(),
        }),
      get windowSize() {
        return { width: get().floating.width, height: get().floating.height };
      },
      setWindowSize: (size) =>
        set({
          floating: {
            ...get().floating,
            width: size.width,
            height: size.height,
          },
          updatedAt: Date.now(),
        }),

      sidebarCollapsed: DEFAULTS.sidebarCollapsed,
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: !!collapsed, updatedAt: Date.now() }),

      get sidebarExpanded() {
        return !get().sidebarCollapsed;
      },
      setSidebarExpanded: (v) =>
        set({ sidebarCollapsed: !v, updatedAt: Date.now() }),

      activeVideoTab: DEFAULTS.activeVideoTab,
      setActiveVideoTab: (tab) =>
        set({ activeVideoTab: tab, updatedAt: Date.now() }),

      get activeTab() {
        return get().activeVideoTab;
      },
      setActiveTab: (tab) =>
        set({
          activeVideoTab: (tab as VideoTab) || DEFAULTS.activeVideoTab,
          updatedAt: Date.now(),
        }),

      setUserId: (id) => {
        currentUserIdForStorage = id || ANON_ID;
        const next = loadPersistedForUser(id);

        if (next) {
          // Apply persisted state for this user id
          set({ ...(next as any), userId: id, updatedAt: Date.now() });
        } else {
          // No saved state for this user, reset to defaults but keep id
          set({
            ...DEFAULTS,
            userId: id,
            bottomOffset: 0,
            updatedAt: Date.now(),
          } as any);
        }
      },

      update: (patch) => set({ ...(patch as any), updatedAt: Date.now() }),

      reset: () =>
        set({
          ...DEFAULTS,
          userId: get().userId,
          schemaVersion: DEFAULTS.schemaVersion,
          bottomOffset: 0,
          updatedAt: Date.now(),
        }),
    }),
    {
      name: "placement-store", // logical name; actual storage key is user-scoped via wrapper
      storage: createJSONStorage(() => userScopedStorage as any),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        updatedAt: s.updatedAt,
        userId: s.userId,
        dockMode: s.dockMode,
        bottomHeightFrac: s.bottomHeightFrac,
        bottomOffset: s.bottomOffset,
        rightWidthFrac: s.rightWidthFrac,
        floating: s.floating,
        sidebarCollapsed: s.sidebarCollapsed,
        activeVideoTab: s.activeVideoTab,
      }),
      version: 1,
      migrate: (persisted, _version) => {
        // Add migration logic on schema changes
        return persisted as any;
      },
    },
  ),
);
