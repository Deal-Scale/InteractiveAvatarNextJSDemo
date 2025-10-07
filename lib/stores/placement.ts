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
// Initialize to anon so SSR/first CSR read uses a stable key
let currentUserIdForStorage: string | undefined = ANON_ID;

const userScopedStorage = {
	getItem: (name: string): string | null => {
		try {
			const k = `${name}-${currentUserIdForStorage || ANON_ID}`;

			return localStorage.getItem(k);
		} catch {
			return null;
		}
	},

	setItem: (name: string, _value: string): void => {
		try {
			const k = `${name}-${currentUserIdForStorage || ANON_ID}`;

			localStorage.setItem(k, _value);
		} catch {
			// no-op
		}
	},

	removeItem: (name: string): void => {
		try {
			const k = `${name}-${currentUserIdForStorage || ANON_ID}`;

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
		const storageKey = `placement-store-${id || ANON_ID}`;
		const raw = localStorage.getItem(storageKey);

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
			setDockMode: (mode) => {
				const prev = get().dockMode;
				if (prev === mode) return;
				console.debug("[placement] setDockMode", {
					userId: get().userId,
					prev,
					mode,
				});
				set({ dockMode: mode, updatedAt: Date.now() });
			},

			bottomHeightFrac: DEFAULTS.bottomHeightFrac,
			setBottomHeightFrac: (frac) => {
				const next = clamp01(frac);
				const prev = get().bottomHeightFrac;
				if (Math.abs(prev - next) < 0.0005) return;
				console.debug("[placement] setBottomHeightFrac", {
					userId: get().userId,
					prev,
					next,
				});
				set({ bottomHeightFrac: next, updatedAt: Date.now() });
			},

			bottomOffset: 0,
			setBottomOffset: (px) => {
				const next = Math.max(0, Math.floor(px));
				const prev = get().bottomOffset || 0;
				if (prev === next) return;
				console.debug("[placement] setBottomOffset", {
					userId: get().userId,
					prev,
					next,
				});
				set({ bottomOffset: next, updatedAt: Date.now() });
			},

			rightWidthFrac: DEFAULTS.rightWidthFrac,
			setRightWidthFrac: (frac) => {
				const next = clamp01(frac);
				const prev = get().rightWidthFrac;
				if (Math.abs(prev - next) < 0.0005) return;
				console.debug("[placement] setRightWidthFrac", {
					userId: get().userId,
					prev,
					next,
				});
				set({ rightWidthFrac: next, updatedAt: Date.now() });
			},

			floating: DEFAULTS.floating,
			setFloating: (rect) => {
				const prev = get().floating;
				const next = { ...prev, ...rect };
				console.debug("[placement] setFloating", {
					userId: get().userId,
					prev,
					patch: rect,
					next,
				});
				set({ floating: next, updatedAt: Date.now() });
			},

			// Aliases
			get isWindowed() {
				const s = get() as Partial<PlacementState>;
				const dock = (s && (s as any).dockMode) ?? DEFAULTS.dockMode;
				return dock === "floating";
			},
			setIsWindowed: (v) => {
				const prev = (get() as any)?.dockMode ?? DEFAULTS.dockMode;
				const next = v ? "floating" : DEFAULTS.dockMode;
				if (prev === next) return;
				console.debug("[placement] setIsWindowed", {
					userId: get().userId,
					prev,
					next,
				});
				set({ dockMode: next, updatedAt: Date.now() });
			},
			get windowPosition() {
				const f = (get() as any)?.floating ?? DEFAULTS.floating;
				return { x: f.x, y: f.y };
			},
			setWindowPosition: (pos) => {
				const f = (get() as any)?.floating ?? DEFAULTS.floating;
				const prev = { x: f.x, y: f.y };
				if (Math.abs(prev.x - pos.x) < 0.5 && Math.abs(prev.y - pos.y) < 0.5)
					return;
				console.debug("[placement] setWindowPosition", {
					userId: get().userId,
					prev,
					pos,
				});
				set({
					floating: {
						...((get() as any)?.floating ?? DEFAULTS.floating),
						x: pos.x,
						y: pos.y,
					},
					updatedAt: Date.now(),
				});
			},
			get windowSize() {
				const f = (get() as any)?.floating ?? DEFAULTS.floating;
				return { width: f.width, height: f.height };
			},
			setWindowSize: (size) => {
				const f = (get() as any)?.floating ?? DEFAULTS.floating;
				const prev = { width: f.width, height: f.height };
				if (
					Math.abs(prev.width - size.width) < 0.5 &&
					Math.abs(prev.height - size.height) < 0.5
				)
					return;
				console.debug("[placement] setWindowSize", {
					userId: get().userId,
					prev,
					size,
				});
				set({
					floating: {
						...((get() as any)?.floating ?? DEFAULTS.floating),
						width: size.width,
						height: size.height,
					},
					updatedAt: Date.now(),
				});
			},

			sidebarCollapsed: DEFAULTS.sidebarCollapsed,
			setSidebarCollapsed: (collapsed) => {
				const next = !!collapsed;
				const prev = get().sidebarCollapsed;
				if (prev === next) return;
				console.debug("[placement] setSidebarCollapsed", {
					userId: get().userId,
					prev,
					next,
				});
				set({ sidebarCollapsed: next, updatedAt: Date.now() });
			},

			get sidebarExpanded() {
				const collapsed =
					(get() as any)?.sidebarCollapsed ?? DEFAULTS.sidebarCollapsed;
				return !collapsed;
			},
			setSidebarExpanded: (v) => {
				const prev =
					(get() as any)?.sidebarCollapsed ?? DEFAULTS.sidebarCollapsed;
				const next = !v;
				if (prev === next) return;
				console.debug("[placement] setSidebarExpanded", {
					userId: get().userId,
					prevCollapsed: prev,
					nextCollapsed: next,
				});
				set({ sidebarCollapsed: next, updatedAt: Date.now() });
			},

			activeVideoTab: DEFAULTS.activeVideoTab,
			setActiveVideoTab: (tab) => {
				const prev = get().activeVideoTab;
				if (prev === tab) return;
				console.debug("[placement] setActiveVideoTab", {
					userId: get().userId,
					prev,
					tab,
				});
				set({ activeVideoTab: tab, updatedAt: Date.now() });
			},

			get activeTab() {
				return (get() as any)?.activeVideoTab ?? DEFAULTS.activeVideoTab;
			},
			setActiveTab: (tab) => {
				const next = (tab as VideoTab) || DEFAULTS.activeVideoTab;
				const prev = get().activeVideoTab;
				if (prev === next) return;
				console.debug("[placement] setActiveTab", {
					userId: get().userId,
					prev,
					next,
				});
				set({ activeVideoTab: next, updatedAt: Date.now() });
			},

			setUserId: (id) => {
				currentUserIdForStorage = id || ANON_ID;
				const next = loadPersistedForUser(id);

				if (next) {
					// Apply persisted state for this user id
					console.debug("[placement] setUserId -> load persisted", {
						key: `placement-store-${id || ANON_ID}`,
						userId: id,
						next,
					});
					set({ ...(next as any), userId: id, updatedAt: Date.now() });
				} else {
					// No saved state for this user, reset to defaults but keep id
					console.debug(
						"[placement] setUserId -> no persisted; reset to defaults",
						{ key: `placement-store-${id || ANON_ID}`, userId: id },
					);
					set({
						...DEFAULTS,
						userId: id,
						bottomOffset: 0,
						updatedAt: Date.now(),
					} as any);
				}
			},

			update: (patch) => {
				console.debug("[placement] update patch", {
					userId: get().userId,
					patch,
				});
				set({ ...(patch as any), updatedAt: Date.now() });
			},

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
			storage:
				typeof window === "undefined"
					? undefined
					: createJSONStorage(() => userScopedStorage as any),
			onRehydrateStorage:
				typeof window === "undefined"
					? undefined
					: () => {
							console.debug("[placement] onRehydrateStorage: start", {
								key: `placement-store-${currentUserIdForStorage || ANON_ID}`,
								userId: currentUserIdForStorage,
							});
							return (state, error) => {
								if (error) {
									console.error("[placement] onRehydrateStorage: error", error);
								} else {
									console.debug("[placement] onRehydrateStorage: done", {
										key: `placement-store-${(state as any)?.getState?.().userId || ANON_ID}`,
										snapshot: (state as any)?.getState?.(),
									});
								}
							};
						},
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
