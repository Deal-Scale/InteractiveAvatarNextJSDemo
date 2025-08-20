# Bottom Mode Tab – Create Modes Implementation Plan

This plan aligns the Modes UX (Talk, Video, Chat, Music) with the current codebase. It maps required behaviors to existing stores/components and specifies where to add minimal new state and handlers. Goal: minimize non‑essential bars in a mode, prioritize the primary surface, persist layout to cache, and restore on exit.

## Objectives
- Minimize bars (sidebars, non-essential panels) when a mode is active; restore on exit.
- Per-mode priorities:
  - Talk: focus mic/input and transcript.
  - Video: show session avatar/video prominently.
  - Chat: maximize transcript + input.
  - Music: mirror Chat layout for composer/lyrics.
- Persist dock position/size and mode to cache; restore on reload.
- Maintain responsive layouts and a11y affordances.

## Scoping
- Reuse existing stores/components. Only add a small `mode` field and snapshot API.
- Defer music-specific logic to later; share Chat layout.

## State Model (use existing stores)
- `lib/stores/placement.ts` (already persisted via `placement-store`):
  - `dockMode` ('bottom' | 'right' | 'floating') lines 24–27, 170–176.
  - `bottomHeightFrac`, `rightWidthFrac` lines 28–39, 178–211.
  - `sidebarCollapsed` lines 52–59, 267–286.
  - Add: `mode?: 'none'|'talk'|'video'|'chat'|'music'` (default 'none').
  - Add: `layoutSnapshot?: { sidebarCollapsed: boolean } | null` and actions `snapshotLayout()`, `restoreLayout()`.

- `lib/stores/session.ts`:
  - `chatMode: 'voice'|'text'` lines 11–23, 65–67 (keep as-is; orthogonal to Modes UX).
  - `viewTab: 'video'|'brain'|'data'|'actions'` lines 42–45, 112–115 (used inside Video surface).

- Transition semantics
  - Enter mode: snapshot -> minimize bars -> set `mode` -> optionally tweak `dockMode` and panel size.
  - Exit mode: restore from snapshot -> set `mode: 'none'`.

## Components/Areas Affected
- `components/ui/bottom-tab.tsx` — bottom drawer implementation for Chat
  - ARIA labels and drag/resize logic lines 108–161 and collapsed tab 165–183.
  - Uses `usePlacementStore()` for `dockMode`, `bottomHeightFrac`, `sidebarCollapsed` lines 36–44.

- `components/AvatarSession/ChatPanel.tsx`
  - Routes to `BottomTab` when `dock === 'bottom'` and `RightTab` when `dock === 'right'` lines 68–127, 130–189.
  - Label shows "Chat" lines 92, 154; actions dock/float on 73–90 and 136–151.

- `components/AvatarSession/AvatarVideoPanel.tsx`
  - Renders video when `viewTab === 'video'` lines 120–129; otherwise alternate views lines 299–318.

- `components/InteractiveAvatar.tsx`
  - Hosts `AvatarSession` and `SessionConfigModal` lines 161–173.

- Sidebar
  - `usePlacementStore().sidebarCollapsed` controls offset in `BottomTab` lines 113–121, 170–176.

## Layout Rules per Mode
- Common (all modes):
  - Minimize sidebar (`setSidebarCollapsed(true)`) and keep chat/video surface in view.
  - Content containers use `flex flex-col min-h-0` and avoid horizontal scroll.
- Talk:
  - Use Chat surface with mic/voice controls; focus input on enter.
- Video:
  - Ensure `viewTab` is `'video'`; show session avatar/video (`AvatarVideoPanel`).
- Chat:
  - Use `BottomTab`/`RightTab` with `expanded` to control `Chat` inputOnly vs full view.
  - Focus message input on enter; transcript scrollable.
- Music:
  - Mirror Chat layout (placeholder composer until dedicated component exists).

## Event Handling
- Add a new `components/ui/ModeTab.tsx` (or integrate into an existing footer) with four buttons: Talk, Video, Chat, Music.
  - On click: `usePlacementStore.getState().update({ /* snapshot/minimize + mode changes */ })` then call helpers (see below).
- Global exit points: Escape key, Close button in ModeTab.

## Implementation Steps (with file pointers)
1) Placement store: add mode + snapshot
   - File: `lib/stores/placement.ts`
   - After line 65 add fields in `PlacementState`:
     - `mode: 'none'|'talk'|'video'|'chat'|'music'`
     - `layoutSnapshot: { sidebarCollapsed: boolean } | null`
     - Actions: `enterMode(m)`, `exitMode()`; helpers `snapshotLayout()`, `restoreLayout()`.
   - Default values: extend `DEFAULTS` (around lines 91–105) with `mode: 'none'`.
   - Persist `mode` and `sidebarCollapsed` (already persisted) via `partialize` (lines 369–380).

2) Chat panel docking driven by store
   - File: `components/AvatarSession/ChatPanel.tsx`
   - Read `dock` from `usePlacementStore().dockMode` and pipe to `ChatPanel` (if not already done in parent).
   - Ensure label/ARIA remain "Chat" (lines 92, 154).

3) Bottom drawer adjustments
   - File: `components/ui/bottom-tab.tsx`
   - ARIA labels already present lines 111–147 and 168–182.
   - No changes required beyond responding to `dockMode === 'bottom'` (lines 42–44) and `sidebarCollapsed` offset (lines 113–121, 170–176).

4) Video surface respects mode
   - File: `components/AvatarSession/AvatarVideoPanel.tsx`
   - When entering Video mode, set `useSessionStore().setViewTab('video')` to ensure the video canvas shows (lines 120–129).

5) ModeTab UI (new)
   - File: `components/ui/ModeTab.tsx` (new)
   - Renders four buttons. On click, call `enterMode(m)` helper below.

6) Helpers (where to call)
   - Enter mode (Talk/Chat):
     - `usePlacementStore().snapshotLayout(); setSidebarCollapsed(true); setDockMode('bottom'); setBottomHeightFrac(0.35); setMode('chat'|'talk');`
     - Set focus to chat input (Chat/Talk) or to mic button (Talk) after a short timeout.
   - Enter mode (Video):
     - Same snapshot + collapse; ensure `setViewTab('video')`.
   - Enter mode (Music):
     - Same as Chat; will use composer panel when available.
   - Exit mode:
     - `restoreLayout(); setMode('none')`.

7) Persistence and restore
   - Placement store already persisted; `mode` should be included in `partialize` to restore last mode from cache.
   - On app mount, if `mode !== 'none'`, re-apply minimized layout rules.

## Acceptance Criteria (summary)
- Entering any create mode minimizes bars; exiting restores them.
- Video mode shows session avatar and video surface without horizontal scroll (`AvatarVideoPanel`).
- Chat/Music modes maximize the chat/composer panel and focus input.
- Talk mode focuses the talk interface and input area.
- Behavior consistent across mobile and desktop.
- a11y: clear focus order, ARIA roles/labels for primary panels, Escape exits create mode.

## Risks and Mitigations
- Global layout flicker: mitigate by batching state updates or using CSS `visibility` instead of mount/unmount where possible.
- Input focus clashes: debounce focus calls after layout transition.
- Restoring previous layout: ensure snapshot/restore is resilient; default to visible if snapshot missing.

## Follow-ups (later)
- Refactor into reusable hooks/utilities after behavior is validated.
- Add E2E tests (Playwright/Cypress) for mode transitions and layout assertions.
- Integrate music-specific logic/controls and richer video controls.

