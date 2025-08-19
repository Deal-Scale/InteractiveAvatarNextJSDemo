Feature: Reusable lazy-loaded media component with modal and hooks in React

  As a developer,
  I want to use reusable components and hooks for lazy-loaded images and videos that open in a modal,
  So that I can easily add performant, focused media viewing to my app.

  Scenario: Use lazy-loaded image component with modal via hook
    Given I import the lazy-loaded media component and its modal hook
    When I render the component for an image
    Then the image should use lazy loading and only load when in the viewport
    When the user clicks the image
    Then the modal hook should open the image in a modal overlay

  Scenario: Use lazy-loaded video component with modal via hook
    Given I import the lazy-loaded media component and its modal hook
    When I render the component for a video thumbnail
    Then the video thumbnail should use lazy loading and only load when in the viewport
    When the user clicks the video thumbnail
    Then the modal hook should open and play the video in a modal overlay

  Scenario: Closing media modal with reusable component/hook