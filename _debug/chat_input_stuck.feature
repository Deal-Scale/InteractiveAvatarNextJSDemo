Feature: Chat Input Container Positioning in Draggable Dialog

  As a user of the chat interface
  I want the chat input container to remain anchored to the bottom of the draggable dialog
  So that when the dialog is resized (expanded or shrunk), the input stays accessible and does not overlap chat content

  Background:
    Given I am on the chat interface with a draggable dialog open
    And the dialog contains a chat history area and a chat input container at the bottom

  Scenario: Input stays anchored when dialog is expanded
    When I drag to expand the dialog vertically
    Then the chat input container should remain attached to the bottom edge of the dialog
    And the chat history area should grow above the input
    And there should be no overlap between the input and the chat messages

  Scenario: Input stays anchored when dialog is shrunk
    When I drag to shrink the dialog vertically
    Then the chat input container should remain attached to the bottom edge of the dialog
    And the chat history area should shrink above the input
    And the chat input should never overlap with the chat messages

  Scenario: Input stays anchored when dialog is moved
    When I drag the dialog to a new position on the screen
    Then the chat input container should remain at the bottom of the dialog
    And the relative position of the input to the dialog edges should not change

  Scenario: Input does not float or overlap on resize
    Given I have sent several messages so that chat history is scrollable
    When I resize the dialog in any direction
    Then the chat input container should not float in the middle of the dialog
    And it should never overlap the chat history area

  Scenario: Input accessibility on resize
    When I resize the dialog
    Then the chat input container should remain fully visible and focusable
    And no part of the input should be clipped or hidden outside the dialog bounds

  Scenario: Input container maintains layout with keyboard navigation
    When I use keyboard shortcuts to focus and interact with the chat input
    And I resize the dialog using mouse or keyboard
    Then the input remains at the bottom and fully usable

  Scenario: Visual feedback during resize
    When I resize the dialog
    Then the input container should animate or smoothly transition its position to remain at the bottom
    And there should be no flicker or abrupt jumps in the input position
