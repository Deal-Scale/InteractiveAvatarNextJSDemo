## User Story

As a user of the client chat interface,  
I want to have a bottom mode tab and a sidebar tab that remain always visible,  
So that I can easily reopen the chat drawer or sidebar even when they are fully closed,  
While still having access to drag-to-resize functionality for the containers.

## Gherkin Feature

Feature: Persistent Bottom and Sidebar Chat Tabs

  Scenario: User closes the chat drawer or sidebar
    Given the chat drawer and sidebar can be fully collapsed by the user
    When the user fully closes either the bottom drawer or sidebar
    Then a grab-handle tab remains visible at the edge of the screen for each container
    And the user can drag the tab to resize and reopen the chat drawer or sidebar
    And the tab is always accessible for reopening or resizing
    And the UI remains uncluttered and intuitive for the user