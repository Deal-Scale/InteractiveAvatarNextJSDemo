Feature: Sidebar bookmark titles truncate to prevent layout overflow
  As a user viewing bookmarks in the sidebar
  I want long bookmark titles to be truncated with ellipsis
  So that the actions button remains visible and layout does not overflow

  Background:
    Given the sidebar is visible
    And the Bookmarks section is expanded

  Scenario: Long bookmark title is truncated
    Given there exists a bookmarked conversation with a long title exceeding the available width
    When the bookmarks tree renders the item
    Then the bookmark title should render on a single line
    And the title should end with an ellipsis
    And the action button should remain aligned on the right and fully visible

  Scenario: Normal-length title does not truncate unnecessarily
    Given there exists a bookmarked conversation with a short title
    When the bookmarks tree renders the item
    Then the entire title should be visible without ellipsis
    And the action button should remain aligned on the right and fully visible

  Scenario: Responsive layout maintains truncation
    Given the window width changes
    When the sidebar shrinks
    Then long titles continue to truncate with ellipsis
    And the action button remains visible
