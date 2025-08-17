# Plan: Unify Agent Modal UX for View, Edit, and Create (from Sidebar)

## Summary
Redesign the Agent modal system to support three modes: View Agent, Edit Agent, and Create Agent. Each mode displays fields from the `Agent` object as appropriate. Ensure clear layout, smooth transitions, strong accessibility, and full mobile responsiveness for all variants.

## Scope
- Frontend-only changes: modal logic, layout, field rendering, responsive styles.
- Modal supports:
  - **View Agent**: read-only display of agent fields.
  - **Edit Agent**: form for updating editable fields.
  - **Create Agent**: form for entering new agent data, omitting read-only fields.
- Integration points: `components/Sidebar/AgentCard.tsx` (view/edit), plus a "New Agent" trigger (create).
- Use Tailwind token-based theming.

## Non-Goals
- No backend/server changes.
- No new agent data fields added (use existing `Agent` model).
- No business logic for validation or submission flows (UI only).

## Relevant Code
- Sidebar trigger: `components/Sidebar/AgentCard.tsx`
- New agent trigger: button or menu in sidebar
- Modal: `components/Sidebar/AgentModal.tsx`
- Styles: `styles/globals.css`, `tailwind.config.js`

## UX/Design

- **Modal Variants**
  - *View Agent*: All agent fields in read-only form.
  - *Edit Agent*: Fields in editable form inputs (pre-filled).
  - *Create Agent*: Empty form inputs for new agent (no id, no timestamps).
- **Header**
  - Avatar, name, (status/active), mode label (View/Edit/Create), close button.
- **Body Fields**
  - `name`, `description`, `avatar`, `status`, `createdAt`, `updatedAt` (timestamps only shown in View/Edit).
  - For edit/create: editable inputs for name, description, avatar, status.
- **Footer**
  - *View*: Primary action (Start/Preview), secondary (Cancel/Close).
  - *Edit*: Save and Cancel buttons.
  - *Create*: Create and Cancel buttons.
- **Motion**
  - Enter: scale-95 → 100, fade backdrop.
  - Exit: reverse (with reduced motion support).
- **Mobile**
  - Full-screen sheet below `md`, sticky header, scrollable content, safe-area padding.
- **Accessibility**
  - Focus trap, ESC to close, `aria-modal`, `aria-labelledby`.
  - Initial focus on first interactive control.

## Tech Plan

- **Modal Component**
  - Single `AgentModal` with `mode` prop: `"view" | "edit" | "create"`.
  - Props: `open`, `onOpenChange`, `agent` (optional for create), `mode`.
  - Renders fields conditionally by mode.
  - Use transitions via `@headlessui/react` or Tailwind.
- **Integration**
  - Open from `AgentCard.tsx` (view/edit), from "New Agent" (create).
  - Pass agent data and mode.
- **Responsiveness**
  - Use Tailwind breakpoints (`md:max-w-lg lg:max-w-2xl`, `w-full`, full-screen on mobile).
- **Accessibility**
  - Focus trap, ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- **Theming**
  - Use semantic tokens: `bg-card`, `text-foreground`, `border-border`.

## User Story
As a user, I want to view, edit, or create an agent from the sidebar in a polished modal, with relevant fields per mode, regardless of device, and with consistent accessibility and theming.

## Gherkin Acceptance Criteria
```gherkin
Feature: Agent Modal for View, Edit, and Create

  Scenario: View Agent modal shows agent details
    Given I open "View Agent" from the sidebar
    Then the modal displays all agent fields as read-only
    And the footer has a Start/Preview button

  Scenario: Edit Agent modal allows editing fields
    Given I open "Edit Agent" from agent options
    Then the modal shows editable inputs for name, description, avatar, status
    And created/updated timestamps are shown as read-only
    And the footer has Save and Cancel buttons

  Scenario: Create Agent modal for new agent
    Given I click "New Agent"
    Then the modal shows empty form inputs for name, description, avatar, status
    And no id or timestamps are shown
    And the footer has Create and Cancel buttons

  Scenario: Mobile full-screen and transitions
    Given I am on a mobile width
    When I open any agent modal
    Then the modal is full-screen with sticky header and scrollable body

  Scenario: Accessibility and theming
    Given any agent modal is open
    Then focus is trapped inside
    And ESC closes the modal
    And ARIA attributes are present
    And theming tokens are used throughout
```

## Edge Cases
- Long agent names/descriptions: truncate with tooltip.
- Window resize between mobile/desktop: re-layout modal seamlessly.
- Reduced motion: disables animations, preserves modal state change clarity.
- Form validation: out of scope, but disable "Save/Create" if fields are empty (optional).

## QA Checklist
- Open/close all modal variants on desktop and mobile.
- Verify field rendering and editability per mode.
- Check transitions and reduced-motion.
- Test accessibility: focus trap, ARIA, ESC.
- Verify theming in light/dark.
- Ensure no content overflows or layout bugs.
