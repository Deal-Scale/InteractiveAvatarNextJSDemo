Feature: Chat slash ("/") commands with submenus inside input
  As a user composing a message
  I want a lightweight "/" command palette inline in the chat input
  So I can quickly insert custom inputs or trigger actions, including nested submenus,
  without opening the expanded Actions menu

  # Glossary
  # - Command palette: a small popover anchored to the caret inside the chat input
  # - Command: an item with a label, icon (optional), and behavior (insert text, run action, or open a submenu)
  # - Submenu: a nested list of commands navigable via keyboard and mouse

  Background:
    Given I am on the chat page
    And I can see the chat input focused

  Scenario: Open command palette by typing "/"
    When I type "/" in the chat input
    Then a small command palette appears below the caret
    And it lists top-level commands
    And the first command is highlighted for selection

  Scenario: Filter commands by typing after "/"
    Given the palette is open
    When I type "up"
    Then only commands whose label or keywords match "up" are shown
    And the first visible command is highlighted

  Scenario: Keyboard navigation and selection
    Given the palette is open with multiple commands
    When I press ArrowDown
    Then the highlight moves to the next command
    When I press ArrowUp
    Then the highlight moves to the previous command
    When I press Enter
    Then the highlighted command is executed

  Scenario: Dismiss palette with Escape or blur
    Given the palette is open
    When I press Escape
    Then the palette closes
    And no text is inserted and no action is executed

  Scenario: Execute a text-insert command
    Given the palette is open
    And I highlight the command "Insert date"
    When I press Enter
    Then the command inserts the current date text at the caret
    And the palette closes

  Scenario: Execute an action command
    Given the palette is open
    And I highlight the command "Start voice chat"
    When I press Enter
    Then voice chat starts via the existing onStartVoiceChat handler
    And the palette closes

  Scenario: Open a submenu from a parent command
    Given the palette is open
    And I highlight the command "Insert snippet ▸"
    When I press Enter
    Then a submenu appears to the right aligned with the parent command
    And the submenu lists available snippets (e.g., "Greeting", "Summary", "Bug report")

  Scenario: Navigate and select inside a submenu
    Given a submenu is open
    When I press ArrowDown
    Then the submenu highlight moves to the next item
    When I press ArrowLeft
    Then the submenu closes and focus returns to the parent item in the root palette
    When I press Enter on a submenu item
    Then the submenu item action executes (e.g., inserts a snippet) and all palettes close

  Scenario: Mouse interactions
    Given the palette or submenu is open
    When I hover items
    Then the hovered item becomes highlighted
    When I click an item
    Then the item's action executes and the palette closes

  Scenario: Accessibility and ARIA
    Given the palette is open
    Then the palette uses role="listbox" and items use role="option"
    And the highlighted item has aria-selected="true"
    And the palette is anchored to the textarea and announced politely via aria-live="polite" only on open/close
    And the submenu is focus-trapped when open and labelled by its parent item

  Scenario: Close palette on non-command typing
    Given the palette is open after typing "/"
    When I press Backspace to remove "/"
    Then the palette closes immediately
    When I type normal text without a leading "/"
    Then the palette does not open

  Scenario: Regression — sending a message with palette open
    Given the palette is open with a highlighted item
    When I press Shift+Enter to add a newline
    Then no command executes and palette remains open
    When I press Enter without Shift and the input is not empty
    Then the message is sent normally and palettes (if any) close

  # Implementation Notes (non-normative)
  # Files to touch:
  # - components/AvatarSession/ChatInput.tsx
  #   * Detect trigger state when text matches /^\/\w*$/ at caret position
  #   * Provide caret position/anchor rect to palette component
  #   * Wire command execution handlers (insert text at caret, call onStartVoiceChat, etc.)
  # - components/ui/prompt-input.tsx
  #   * Ensure wrapper key handling does not eat characters needed for filtering
  #   * Expose textareaRef for caret ops and selection management
  # - components/AvatarSession/chat/SlashCommandPalette.tsx (new)
  #   * Presentational + keyboard navigation for listbox + submenu
  #   * Props: anchorRect, items, onSelect, onClose, onNavigate
  # - lib/stores or local state
  #   * Optional: transient state for palette open/close, query text, highlightedIndex, submenu stack
  # - types/commands.ts (new)
  #   * Define Command type: { id, label, keywords?: string[], icon?: ReactNode, action?: () => void, insertText?: string, children?: Command[] }
  # - data/commands.ts (new)
  #   * Provide default commands: Insert date, Insert time, Insert snippet (submenu: Greeting, Summary, Bug report), Start voice chat, Stop voice chat, Attach file
  #
  # Keyboard logic:
  # - Open on "/" typed at start-of-token; query is text following "/" until whitespace
  # - ArrowDown/ArrowUp cycle highlight; Enter selects; Escape closes; ArrowRight opens submenu (if any); ArrowLeft closes submenu
  # - Clicking outside closes
  #
  # Text insertion:
  # - Use textarea.setRangeText(insertText, start, end, 'end') and dispatch input event to sync controlled value
  #
  # Accessibility:
  # - listbox/option semantics, aria-activedescendant for highlight, proper labelling and roving tabindex
  # - Keep palette width constrained; support keyboard only
  #
  # Non-goals for first pass:
  # - Persisted command customization UI
  # - Search across remote tools
