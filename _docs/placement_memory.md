## Persistent UI State Management for Chat and Sidebar

This project ships with a per-user persistent placement store at `lib/stores/placement.ts` that remembers docking, sizes, floating window geometry, sidebar state, and active tab. It is powered by Zustand with `persist` and a user-scoped storage key.

### Implemented State Shape

- **Docking and Sizes**
  - `dockMode`: `"bottom" | "right" | "floating"`
  - `bottomHeightFrac`: number (0..1) — bottom drawer height as viewport fraction
  - `rightWidthFrac`: number (0..1) — right drawer width as viewport fraction
  - `setDockMode(frac)`, `setBottomHeightFrac(frac)`, `setRightWidthFrac(frac)`

- **Floating Window Geometry**
  - `floating`: `{ x, y, width, height, visible }`
  - `setFloating(partial)`
  - Aliases for convenience:
    - `isWindowed` ↔ `dockMode === "floating"`, `setIsWindowed(v)`
    - `windowPosition` `{ x, y }`, `setWindowPosition(pos)`
    - `windowSize` `{ width, height }`, `setWindowSize(size)`

- **Sidebar**
  - `sidebarCollapsed: boolean`, `setSidebarCollapsed(v)`
  - Alias: `sidebarExpanded` (derived), `setSidebarExpanded(v)`

- **Active Tab**
  - `activeVideoTab: "video" | "brain" | "data" | "actions"`, `setActiveVideoTab(tab)`
  - Alias: `activeTab: string`, `setActiveTab(tab)`

- **Other**
  - `bottomOffset?: number`, `setBottomOffset(px)` — optional pixel offset used by some UI placements
  - `update(patch)`, `reset()`
  - `schemaVersion`, `updatedAt`

### Per-User Persistence

- The store persists using a user-scoped key: `placement-store-{userId}`.
- Call `usePlacementStore.getState().setUserId(userId)` after login to switch the storage namespace. The store will:
  - Load that user’s last saved state if available, or
  - Reset to defaults while keeping `userId` if no state exists.
- Data is stored in `localStorage` via a small wrapper so each user has separate state.

### Usage Examples

```ts
import { usePlacementStore } from "@/lib/stores/placement";

// Set user after login
usePlacementStore.getState().setUserId(session.user?.id);

// Read values in a component
const dockMode = usePlacementStore((s) => s.dockMode);
const bottomH = usePlacementStore((s) => s.bottomHeightFrac);
const isWindowed = usePlacementStore((s) => s.isWindowed);
const sidebarExpanded = usePlacementStore((s) => s.sidebarExpanded);
const activeTab = usePlacementStore((s) => s.activeTab);

// Update values
const setBottom = usePlacementStore((s) => s.setBottomHeightFrac);
const setRight = usePlacementStore((s) => s.setRightWidthFrac);
const setDock = usePlacementStore((s) => s.setDockMode);
const setActiveTab = usePlacementStore((s) => s.setActiveTab);
```

### Integration Notes

- Use selectors to avoid re-renders; prefer `(s) => s.field`.
- Persist only UI state. Do not store sensitive data.
- When the auth user changes, call `setUserId(newId)` to switch to that user’s saved layout.
- The bottom and right dock components (`components/ui/bottom-tab.tsx`, `components/ui/right-tab.tsx`) already read/write fractions in this store.

### Gherkin Acceptance Criteria

```gherkin
Feature: Persistent Chat and Sidebar UI State

  Scenario: User reloads the page
    Given the user has customized the chat window position and sidebar state
    When the user reloads the application
    Then the chat window and sidebar should restore to the user's last configuration

  Scenario: User logs in from another device
    Given the user's UI state is stored per user
    When the user logs in on a new device
    Then their last UI state is restored on that device

  Scenario: User logs out and logs in as another user
    Given User A and User B have different chat window and sidebar configurations
    When User A logs out and User B logs in
    Then the UI restores to User B's last configuration

  Scenario: User resets UI preferences
    Given the user wants to revert to defaults
    When the user triggers a "reset layout" action
    Then the chat window, sidebar, and video tab restore to default positions and sizes
```

---

**Best Practices:**

- Store only non-sensitive, UI-related data.
- Use selectors to avoid unnecessary re-renders.
- Document all customizations and state shape in the codebase.
- Continuously test state restoration across reloads, logins, and device changes.

See `components/ui/bottom-tab.tsx`, `components/ui/right-tab.tsx`, and `lib/stores/placement.ts` for example usage and integration with the Zustand store.

### Known issue (2025-08-16)

Positions aren’t restoring after a browser refresh for some users. The store (`lib/stores/placement.ts`) correctly persists `dockMode`, `bottomHeightFrac`, `rightWidthFrac`, and `floating` geometry per user, but the active UI hook wiring may not be fully reading/writing from this store yet in all paths.

Suspected areas:

- `components/AvatarSession.tsx` → `useDockablePanel()` manages `floatingPos`, `floatingSize`, and sizing without directly binding to `usePlacementStore`. If it uses internal state instead of the store setters, changes won’t persist.
- Ensure `setUserId(userId)` is called after auth resolution so the correct per-user namespace is hydrated before UI reads from the store.

Planned fix:

1. Wire `useDockablePanel()` to placement store:
   - Read: `dockMode`, `bottomHeightFrac`, `rightWidthFrac`, `floating`.
   - Write via: `setDockMode`, `setBottomHeightFrac`, `setRightWidthFrac`, `setWindowPosition`, `setWindowSize` (or `setFloating`).
2. On mount of `AvatarSession`, ensure initial UI derives from the store (avoid shadow state that diverges).
3. Verify `BottomTab`/`RightTab` are reading fractions from the store and not maintaining their own persisted copies.
4. Confirm `setUserId()` is invoked on login/logout transitions; add a no-op anonymous fallback for logged-out usage.
5. QA: manual resize/move, refresh, and re-open app; confirm restoration for bottom/right/floating.

Status: Pending integration audit and wiring. Tracking in TODO: "Investigate and fix: Dock/floating positions not persisted on refresh; update placement store and hydration."