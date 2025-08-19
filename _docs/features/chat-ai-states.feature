Feature: AI reply message states (Talking and Tools)
  As a user chatting with the avatar
  I want clear visual indicators of the avatar's current state
  So that I can tell when it is talking versus when it is running tools

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

  @ui @state
  Scenario: Avatar is using tools (tool execution running)
    Given the latest avatar message has tools executing
    When I view the avatar message header
    Then I see a status pill labeled "Tools running"
    And the pill uses subtle emphasis (secondary or accent color)
    And the pill is announced to screen readers as a status update

  @ui @state
  Scenario: Avatar finished tools and shows tool outputs
    Given the avatar message tools have completed and outputs are available
    When I view the avatar message content
    Then I do not see the "Tools running" status pill anymore
    And I can expand tool panels to see outputs

  @ui @state
  Scenario: Priority between states
    Given the avatar is both streaming text and running tools concurrently
    When I view the avatar message header
    Then the "Talking…" pill is shown
    And the tools state is still visible below as tool panels when available

  @a11y
  Scenario: Status updates are announced politely
    Given the avatar starts or stops talking or tools start/finish
    Then a live status region updates with the new state politely (aria-live="polite")
    And there are no React DOM warnings for unknown attributes

  @regression
  Scenario: User message has no status pills
    Given a user-authored message is rendered
    Then no talking or tools status pill is displayed
