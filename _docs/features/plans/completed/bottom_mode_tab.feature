Feature: Bottom Mode Tab - Modes UX
  As a user selecting a creation mode from the bottom mode tab
  I want the app to adapt layout per mode
  So that I can focus on the primary task (talk, video, chat, or music)

  # Global expectations for modes
  # - When a create mode is active, all bars are minimized (top/app bars, sidebars, and non-essential panels)
  # - Exiting mode restores the previous layout
  # - Responsive behavior preserves the same rules on mobile and desktop
  # - State for create mode and layout snapshots is persisted to cache and restored on reload

  Background:
    Given the application is running
    # Shell host: components/InteractiveAvatar.tsx:159-176
    And I am on a page with the bottom mode tab visible
    # Bottom tab UI: components/ui/bottom-tab.tsx:9-21, 108-161, 165-183
    # Chat docking surface: components/AvatarSession/ChatPanel.tsx:68-127, 130-189
    And there is an active session context with a configured session avatar
    # Session provider: components/logic/context.tsx (state)
    # Video surface uses: components/AvatarSession/AvatarVideoPanel.tsx:120-129

  @talk
  Scenario: Enter Talk mode
    When I select "Talk" in the bottom mode tab
    # Trigger via ModeTab (new): components/ui/ModeTab.tsx (to add)
    # Store updates: lib/stores/placement.ts -> setSidebarCollapsed, setDockMode, setBottomHeightFrac
    Then all bars are minimized
    # Sidebar: lib/stores/placement.ts:267-286 (setSidebarCollapsed)
    And the primary talk interface is focused and visible
    # Chat input focus: components/AvatarSession/Chat.tsx:249-269 (ChatInput via inputRef)
    And the chat input (if applicable) is readily accessible
    # ChatPanel passes props -> Chat: components/AvatarSession/ChatPanel.tsx:94-110, 156-172
    And the viewport prioritizes vertical content (no content is cut off)
    # Layout containers use min-h-0: bottom-tab.tsx:160; ChatPanel.tsx:94, 156, 243

  @video
  Scenario: Enter Video mode
    When I select "Video" in the bottom mode tab
    # Trigger via ModeTab (new): components/ui/ModeTab.tsx (to add)
    # Ensure viewTab=video: lib/stores/session.ts (useSessionStore.setViewTab) consumed by AvatarVideoPanel
    Then all bars are minimized
    # Sidebar minimized: lib/stores/placement.ts:267-274
    And the session avatar for the current session is displayed prominently
    # Avatar/video canvas render gated by viewTab: components/AvatarSession/AvatarVideoPanel.tsx:120-129
    And the video canvas/container is visible within the content area
    # AvatarVideo component mount: components/AvatarSession/AvatarVideoPanel.tsx:121-123
    And the layout avoids horizontal scroll on standard breakpoints
    # Panel container: AvatarVideoPanel.tsx:106-119, 299-319

  @chat
  Scenario: Enter Chat mode (maximize chat)
    When I select "Chat" in the bottom mode tab
    # Trigger via ModeTab (new): components/ui/ModeTab.tsx (to add)
    # Dock bottom and expand height: lib/stores/placement.ts setDockMode/setBottomHeightFrac:170-189
    Then all bars are minimized
    # Sidebar minimized: lib/stores/placement.ts:267-286
    And the chat panel is maximized to occupy the primary content area
    # BottomTab expanded content: components/ui/bottom-tab.tsx:108-161
    And the message input is focused for immediate typing
    # Chat input focus logic: components/AvatarSession/Chat.tsx:249-269 (ChatInput)
    And the transcript area is scrollable within the viewport
    # Scroll container: components/AvatarSession/Chat.tsx:191-223 (ChatContainerRoot + StickToBottom)

  @music
  Scenario: Enter Music mode (same maximize rules as chat)
    When I select "Music" in the bottom mode tab
    # Trigger via ModeTab (new): components/ui/ModeTab.tsx (to add)
    Then all bars are minimized
    # Same as Chat mode minimize rules: lib/stores/placement.ts:267-286
    And the music composition/lyrics chat panel is maximized to the primary content area
    # Placeholder: reuse Chat layout for now (ChatPanel/BottomTab)
    And the input controls are focused or easily reachable
    # ChatInput focus: components/AvatarSession/Chat.tsx:249-269
    And playback/preview controls remain accessible within the maximized panel
    # Future: music controls component (TBD)

  @switching
  Scenario: Switching between modes updates layout accordingly
    Given I am in Talk mode
    # Placement store holds mode/layout (to add): lib/stores/placement.ts
    When I switch to Video mode
    # Set viewTab('video') and keep bars minimized
    Then the session avatar is displayed
    # AvatarVideoPanel.tsx:120-129
    And the layout follows Video mode rules
    # See @video notes above
    When I switch to Chat mode
    # Dock bottom + expand chat
    Then the chat panel is maximized
    # BottomTab content: bottom-tab.tsx:108-161
    And all bars remain minimized
    # sidebarCollapsed remains true until exit
    When I switch to Music mode
    # Same behavior as Chat; different surface later
    Then the music/chat panel remains maximized with music controls visible
    # Placeholder until music surface exists

  @exit
  Scenario: Exit mode restores layout
    Given I am in any mode
    When I exit mode
    # From ModeTab: call restore snapshot: lib/stores/placement.ts (to add snapshot helpers)
    Then the previously visible bars are restored to their prior state
    # Restore sidebarCollapsed and sizes from snapshot
    And any temporary focus or scroll overrides are reset
    # No code change needed; relies on DOM focus management post-restore

  @state_cache
  Scenario: Mode and layout snapshot persist to cache and restore on reload
    Given I am in Chat mode
    And all bars are minimized
    And a layout snapshot has been saved
    # Persisted by placement-store partialize: lib/stores/placement.ts:369-380 (+ include `mode` later)
    When I reload the application
    Then the last mode "chat" is restored from cache
    And the minimized layout is restored from the cached snapshot
    And the chat panel remains maximized with input focused
    # Chat focus behavior: Chat.tsx:249-269

  @snapshot_save_restore
  Scenario: Snapshot is saved on enter and cleared on exit
    When I enter Video mode
    # Save snapshot then minimize bars; set viewTab('video')
    Then the current layout snapshot is saved to cache
    # placement-store persisted state
    And all bars are minimized
    When I exit mode
    # Restore snapshot then clear it
    Then the previous layout is restored from snapshot
    And the cached snapshot is cleared

  @idempotent
  Scenario: Re-entering the same mode is idempotent (no flicker)
    Given I am in Music mode
    When I select Music mode again
    Then no additional snapshot is saved
    And the UI does not flicker or reflow unnecessarily
    And bars remain minimized
    # Guard against redundant state sets in store actions

  @fallback
  Scenario: Missing/invalid snapshot falls back to a safe default
    Given I am in Talk mode
    And the cached snapshot is missing or invalid
    When I exit mode
    Then the app restores a safe default layout with bars visible
    # If no snapshot, default to sidebarCollapsed=false, bottomHeightFrac=DEFAULTS.bottomHeightFrac

  @responsive
  Scenario Outline: Responsive behavior in modes
    Given I am in <mode> mode
    When the viewport width is <width>
    Then the primary content remains visible without horizontal scrolling
    And vertical overflow scrolls within the content area (headers remain fixed as designed)
    # Ensure min-h-0 on containers and overflow-y-auto on content surfaces

    Examples:
      | mode  | width  |
      | Talk  | 360px  |
      | Talk  | 768px  |
      | Video | 360px  |
      | Video | 1024px |
      | Chat  | 360px  |
      | Chat  | 1280px |
      | Music | 360px  |
      | Music | 1440px |

  @a11y
  Scenario: Accessibility affordances in modes
    Given I am in any mode
    Then focus order starts at the primary control (e.g., input or canvas)
    # Chat input first; video canvas focusable when viewTab==='video'
    And ARIA roles/labels are applied to the maximized panel
    # bottom-tab.tsx:111-121 role/aria; region for drawer; resize handle is separator
    And keyboard shortcuts for exit/escape from create mode are available
    # Implement Escape in ModeTab and/or global handler (new)
    And tooltip or help text is available where necessary (e.g., video avatar indicator)
    # AvatarVideoPanel tooltips: 234-259
