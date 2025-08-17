- Create a Zustand store to manage:
  - The chat container's bottom distance from the window (for when it's docked/undocked, accounting for sidebar position)
  - The chat container's windowed state, with its position (x, y) and size (width, height)
  - The sidebar's expanded/collapsed state (if not already present)
  - The active tab in the video container (e.g., data, tasks, etc.)
  - User-specific UI settings using a user storage pattern for per-user state persistence

- Implement logic to persist these UI states to local storage (or a cache) whenever they change, and restore from storage on reload for a seamless UX.
  - Use user storage to scope persisted state by user identity where possible

- Write Gherkin-style acceptance criteria for the expected UX of state restoration, e.g.:
  ```
  Feature: Chat UI state persistence
    Scenario: User reloads the page
      Given the user has customized the chat window position and sidebar state
      When the user reloads the application
      Then the chat window and sidebar should restore to the user's last configuration

    Scenario: User logs in from another device
      Given the user's UI state is stored per user
      When the user logs in on a new device
      Then their last UI state is restored on that device
  ```

- Review existing state management in the project to avoid duplication and ensure new state integrates cleanly with current stores and component structure.