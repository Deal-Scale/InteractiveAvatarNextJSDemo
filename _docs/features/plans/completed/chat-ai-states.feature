Feature: AI reply message states (Talking and Tools)
  As a user chatting with the avatar
  I want clear visual indicators of the avatar's current state
  So that I can tell when it is talking versus when it is running tools

  # Implementation locations
  # - components/AvatarSession/MessageItem.tsx
  #   Status pill logic and rendering near the sender label (Avatar):
  #   Lines ~203–230 add the self-invoking block determining `isTalking` and `isToolsRunning`
  #   and render the pill with aria-live="polite".
  #
  # - components/ui/message.tsx
  #   Prop filtering for markdown-only props to avoid DOM warnings:
  #   Lines ~69–78 filter out headerLabel/showHeader/remarkPlugins/rehypePlugins/components
  #   from being spread onto <div>.
  #
  # Where to change if porting:
  # - Insert the status block immediately adjacent to the small sender label above the
  #   message bubble. Use Tailwind classes from current implementation for visual parity.
  # - Ensure priority: show "Talking…" when streaming; otherwise, show "Tools running"
  #   when any tool part is not in "output-available" state.

  Background:
    Given I am on the chat page
    And I can see the message history and input

  @ui @state
  Scenario: Avatar is talking (streaming response)
    Given the latest avatar message is actively streaming
    When I view the avatar message header
    Then I see a status pill labeled "Talking…"
    And the pill uses subtle emphasis (primary color) and is readable
    And the pill is announced to screen readers as a status update

    # Example payload (simplified)
    """
    {
      "id": "msg_001",
      "sender": "AVATAR",
      "content": "Hello ther",
      "isStreaming": true,
      "toolParts": []
    }
    """

  @ui @state
  Scenario: Avatar is using tools (tool execution running)
    Given the latest avatar message has tools executing
    When I view the avatar message header
    Then I see a status pill labeled "Tools running"
    And the pill uses subtle emphasis (secondary or accent color)
    And the pill is announced to screen readers as a status update

    # Example payload (simplified)
    """
    {
      "id": "msg_002",
      "sender": "AVATAR",
      "content": "Checking your calendar…",
      "isStreaming": false,
      "toolParts": [
        { "name": "calendar.lookup", "state": "executing" }
      ]
    }
    """

  @ui @state
  Scenario: Avatar finished tools and shows tool outputs
    Given the avatar message tools have completed and outputs are available
    When I view the avatar message content
    Then I do not see the "Tools running" status pill anymore
    And I can expand tool panels to see outputs

    # Example payload (simplified)
    """
    {
      "id": "msg_003",
      "sender": "AVATAR",
      "content": "You have a meeting at 3 PM.",
      "isStreaming": false,
      "toolParts": [
        { "name": "calendar.lookup", "state": "output-available", "output": { "title": "Team Sync", "time": "3 PM" } }
      ]
    }
    """

  @ui @state
  Scenario: Priority between states
    Given the avatar is both streaming text and running tools concurrently
    When I view the avatar message header
    Then the "Talking…" pill is shown
    And the tools state is still visible below as tool panels when available

    # Example payload (simplified)
    """
    {
      "id": "msg_004",
      "sender": "AVATAR",
      "content": "Looking now: you have a meet",
      "isStreaming": true,
      "toolParts": [
        { "name": "calendar.lookup", "state": "executing" }
      ]
    }
    """

  @a11y
  Scenario: Status updates are announced politely
    Given the avatar starts or stops talking or tools start/finish
    Then a live status region updates with the new state politely (aria-live="polite")
    And there are no React DOM warnings for unknown attributes

    # Implementation note:
    # - aria-live is applied on the pill <span> in MessageItem.
    # - Unknown DOM property warnings are avoided by filtering markdown-only props
    #   in components/ui/message.tsx as referenced above.

  @regression
  Scenario: User message has no status pills
    Given a user-authored message is rendered
    Then no talking or tools status pill is displayed
