## Persistent UI State Management for Chat and Sidebar

To deliver a seamless, user-centric chat experience, implement a state management system that persistently remembers UI customizations across reloads and devices. This ensures users always return to their preferred layout, even when switching devices or logging in/out.

### State Requirements

- **Zustand Store Design**  
  Create a single Zustand store (e.g., `usePlacementStore`) to manage the following UI states:
  - **Chat Container Positioning**
    - `bottomOffset`: Number – the pixel distance from the bottom of the chat container to the window (accounts for docked/undocked state and sidebar positioning).
    - `isWindowed`: Boolean – whether the chat is in a floating window mode.
    - `windowPosition`: `{ x: number, y: number }` – coordinates of the chat window when undocked.
    - `windowSize`: `{ width: number, height: number }` – dimensions of the windowed chat container.
  - **Sidebar State**
    - `sidebarExpanded`: Boolean – whether the sidebar is expanded or collapsed.
  - **Active Video Tab**
    - `activeTab`: String – currently selected tab in the video container (e.g., "data", "tasks", etc.).
  - **User-Specific UI Settings**
    - Store all UI-related preferences in a structure keyed by user ID to enable per-user persistence (using a "user storage" pattern).

- **Persistence Logic**
  - Use Zustand's `persist` middleware with a custom storage key that includes the user ID (e.g., `placement-state-{userId}`).
  - Persist all relevant properties to `localStorage` (or another cache) on every change.
  - On app load, hydrate the Zustand store from storage, restoring the last known state for the current user.
  - Listen for user login/logout events to update the storage key (and migrate/clear state as needed).

- **Integration Guidelines**
  - Review existing stores (`useSessionStore`, etc.) to ensure no duplication; extend or compose with current stores as appropriate.
  - Only the minimal, UI-relevant state should be persisted; do not store sensitive or transient data.
  - UI components (e.g., chat container, sidebar, video tab) should read/write their state via this store for consistent synchronization.

### Example Zustand Store (TypeScript)

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PlacementState = {
  bottomOffset: number;
  isWindowed: boolean;
  windowPosition: { x: number; y: number };
  windowSize: { width: number; height: number };
  sidebarExpanded: boolean;
  activeTab: string;
  setBottomOffset: (n: number) => void;
  setIsWindowed: (v: boolean) => void;
  setWindowPosition: (pos: { x: number; y: number }) => void;
  setWindowSize: (size: { width: number; height: number }) => void;
  setSidebarExpanded: (v: boolean) => void;
  setActiveTab: (tab: string) => void;
};

const getUserKey = () => {
  // Replace with your user identity selector
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : "anon";
  return `placement-state-${userId}`;
};

export const usePlacementStore = create<PlacementState>()(
  persist(
    (set) => ({
      bottomOffset: 0,
      isWindowed: false,
      windowPosition: { x: 100, y: 100 },
      windowSize: { width: 400, height: 600 },
      sidebarExpanded: true,
      activeTab: "data",
      setBottomOffset: (n) => set({ bottomOffset: n }),
      setIsWindowed: (v) => set({ isWindowed: v }),
      setWindowPosition: (pos) => set({ windowPosition: pos }),
      setWindowSize: (size) => set({ windowSize: size }),
      setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: getUserKey(),
      // Optionally, customize storage, versioning, or migrate logic here
    }
  )
);
```

### Integration Notes

- In your chat, sidebar, and video container components, use selectors from `usePlacementStore` to read and update persistent state.
- Whenever the user logs in/out, rehydrate/migrate state keyed by the new user ID.
- Avoid duplicating state in multiple stores; unify through `usePlacementStore` (or extend as needed).
- For global UI settings, compose additional stores if necessary, but keep per-user persistence in mind.

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

See [`components/ui/bottom-tab.tsx`](../components/ui/bottom-tab.tsx) and [`components/ui/sidebar.tsx`](../components/ui/sidebar.tsx) for example usage and integration with the Zustand store.