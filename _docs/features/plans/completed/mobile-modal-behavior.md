# Plan: Mobile Modal Behavior — Prevent User from Changing Container Type to Chat Modal on Mobile

## Summary
On mobile devices, prevent users from switching the chat container type to the "chat modal" variant. The chat panel/modal should remain fixed, non-draggable, and not allow mode switching that could expose modal affordances or accidental closes.

## Scope
- Frontend-only changes affecting mobile breakpoints.
- Applies to chat panel/container selection logic throughout `components/AvatarSession.tsx` and related UI.

## Non-Goals
- Desktop or tablet container switching remains possible.
- No backend changes.

## Relevant Code
- Container/mode selection logic: `components/AvatarSession.tsx`
- Dock/placement logic: `lib/stores/placement.ts`
- Any UI that triggers a change to modal mode in `components/AvatarSession/` or helpers.

## UX/Design
- On mobile (`max-md`), hide or disable any UI that allows switching to a chat modal or floating modal container.
- Always present the chat as a fixed bottom panel or inline view on mobile.
- If user attempts to switch, show a tooltip or toast explaining the restriction.
- On desktop, retain all switching options.

## Tech Plan
- **Responsive Logic**
  - Detect mobile viewport (`max-md` via CSS or JS).
  - Gate any modal-switching triggers/components with a breakpoint check.
  - If current mode is modal and viewport shrinks to mobile, automatically revert to safe panel.
- **Store Integration**
  - Prevent state updates that would set modal/floating mode on mobile.
  - Optionally, persist last desktop/mobile mode separately.
- **UI**
  - Hide or disable "modal" selection buttons/toggles on mobile.
  - Show clear feedback if user tries to access modal mode on mobile.
- **Accessibility**
  - Ensure disabled options are correctly announced by screen readers.

## User Story
As a mobile user, I cannot switch the chat container into a draggable modal; the UI remains stable and fixed, and all controls for changing container type are hidden or disabled.

## Gherkin Acceptance Criteria
```gherkin
Feature: Prevent chat modal container on mobile

  Scenario: Modal switch not available on mobile
    Given I am on a mobile width
    When I view the chat container controls
    Then I do not see an option to switch to modal mode

  Scenario: Attempting to switch to modal on mobile is blocked
    Given I am on a mobile width
    When I try to trigger a container type change to modal
    Then the action is prevented
    And I see a message explaining modal is unavailable on mobile

  Scenario: Desktop switching unchanged
    Given I am on a desktop width
    When I use chat container controls
    Then I can switch between panel and modal as before
```

## Edge Cases
- Viewport changes (rotation, window resize): auto-revert modal to panel if switching to mobile width.
- Settings persistence: last-used mode per device type.
- Accessibility: Disabled controls are properly labeled for assistive tech.

## QA Checklist
- On iOS Safari and Android Chrome, cannot switch to chat modal.
- Modal switch works on desktop.
- Attempting to force modal mode on mobile triggers correct block/feedback.
- UI and state revert to safe panel if screen shrinks to mobile width.
