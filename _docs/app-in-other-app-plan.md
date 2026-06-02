# App-in-Other-App Integration Plan

## Summary

Embed `InteractiveAvatarNextJSDemo` inside a separate host app without rewriting the product. The safest path is an embeddable app shell plus a small bridge for state, actions, and session events. That keeps the avatar/chat experience isolated while still letting the host control high-level workflows.

## Integration Model

- Add a dedicated embed surface for the app shell.
- Support a compact mode that hides non-essential chrome.
- Use route parameters or a host bridge message to pass startup config.
- Keep the interactive avatar app as the owner of chat, sessions, tours, and composer state.

## Host Bridge Contract

The host app should be able to trigger these actions:

- open or close chat
- switch tabs between Brain, Data, and Actions
- start or stop avatar sessions
- attach agents, assets, knowledge bases, and tools
- launch guided tours

The app should emit these events back to the host:

- session started or stopped
- message sent or received
- task created or updated
- resource attached or removed
- tour started or completed

Prefer `postMessage` for cross-origin embeds. Use direct callbacks only when the host and embedded app share the same origin and runtime.

## Configuration And Auth

- Require explicit runtime config for provider keys and base URLs.
- Accept host-provided session context, user identity, or workspace metadata.
- Fail fast when required credentials or context are missing.
- Keep secrets server-side; never embed provider keys directly in the host page.

## Shared Resource Flow

The embedded app should accept host-provided selections for:

- agents
- knowledge bases
- assets
- tools and connectors

The host may preselect these resources before the app mounts. The app should then:

- show the active selection in the composer or session UI
- allow the user to change or remove the selection
- keep the existing attachment and MCP/runtime behavior intact

## Testing Plan

- Verify the app renders in embed mode without host-specific assumptions.
- Verify startup config arrives correctly from the host.
- Verify host-to-app actions:
  - switch tab
  - start chat
  - attach resources
  - launch a tour
- Verify app-to-host events:
  - session lifecycle updates
  - message lifecycle updates
  - task lifecycle updates
- Verify fallback behavior when the bridge is missing or partially configured.

## Assumptions

- The first implementation should be route/embed based, not a separate package rewrite.
- Same-origin integration is preferred, but `postMessage` must work across origins.
- The embedded app keeps control of its internal UI state; the host only drives high-level actions.
- Existing provider and session flows remain the source of truth inside the app.
