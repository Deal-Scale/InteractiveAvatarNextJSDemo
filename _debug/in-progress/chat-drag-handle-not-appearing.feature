Feature: Chat panel drag/resize handle not appearing or not interactive near sidebar
  As a user
  I want the chat panel's drag area and resize handles to always be visible and clickable
  So that I can drag/resize even when the chat overlaps or is near the sidebar

  # Context
  # Affected files and key locations (as of this commit):
  # - components/AvatarSession/hooks/useDockablePanel.ts
  #   - Drag move handler: lines ~127-145 (onGlobalPointerMove)
  #   - Resize move/useEffect: lines ~170-192 (onMove), ~308-323 (snap when floating)
  # - components/AvatarSession.tsx
  #   - Floating container: lines ~173-187 (fixed, z-index)
  # - components/ui/right-tab.tsx
  #   - Open drawer section: lines ~91-101 (z-50)
  #   - Collapsed trigger button: lines ~139-155 (z-50)
  # - components/ui/bottom-tab.tsx
  #   - Open drawer section: lines ~108-121 (z-50)
  #   - Collapsed trigger button: lines ~164-177 (z-50)
  # - components/AvatarSession/ChatPanel.tsx
  #   - Floating header drag target: lines ~208-215 (onPointerDown on header)

  Background:
    Given the app is running in a desktop viewport (>= 1024px width)
    And the sidebar is open

  @floating
  Scenario: Drag handle appears and is usable in Floating mode over the sidebar
    Given I switch chat dock to "floating"
    And the floating chat is positioned near the right edge overlapping the sidebar area
    When I hover the chat header (Move icon area)
    Then the cursor should become a "grab" cursor
    And mousedown+drag should move the window following the pointer across the entire viewport
    And the window should not be constrained by the content parent when crossing the sidebar

  @right-dock
  Scenario: Left-edge resize area is visible and responds when overlapping sidebar
    Given I dock chat to the right
    And the right drawer overlaps the sidebar edge
    When I hover the 3px left-edge resize rail
    Then the cursor should become "ew-resize"
    And dragging left/right should change width

  @bottom-dock
  Scenario: Top bar resize area works when overlapping the sidebar edge
    Given I dock chat to the bottom
    And the top bar overlaps the sidebar edge area
    When I hover the top bar (resize region)
    Then the cursor should become "ns-resize"
    And dragging up/down should change height

  @regression
  Scenario: Floating panel resizes from bottom-right corner across viewport
    Given I am in floating mode
    When I drag from the bottom-right corner visual handle
    Then the panel resizes within viewport bounds (window.innerWidth/innerHeight)

  # Notes / Hypotheses
  # 1) Z-index: ensure drawers and floating panel have higher z-index than sidebar triggers.
  #    - right-tab.tsx and bottom-tab.tsx were raised to z-50; floating set to z-[60].
  # 2) Positioning reference: floating movement used to clamp to parent rect; now clamps to viewport
  #    via window.innerWidth/innerHeight (useDockablePanel.ts onGlobalPointerMove, resize onMove).
  # 3) If handles still do not show, check for any overlay with pointer-events blocking header/top bars.
  #    Add explicit pointer-events: auto to header/handles if needed.
