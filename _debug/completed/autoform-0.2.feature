Feature: AutoForm widgets display and behavior enhancements

  As a user filling out a form
  I want the slider widget to show the currently selected value
  And I want to have select, multi-select, and checkbox widgets render for the appropriate field types
  So that I get clear, interactive controls for each kind of field

  Background:
    Given I open the Session Config modal → Agent tab in the app
    And browser devtools console is open to capture AutoForm/AutoField logs

  Scenario: Slider shows the current value
    When the form renders the field "temperature" as a slider
    Then the slider control displays the selected value next to the handle or label

  Scenario: Single select renders for enum field
    When the form renders the field "quality"
    Then the AutoField widget is a single-select dropdown

  Scenario: Multi-select renders for array of options
    When the form renders the field "mcpServers"
    Then the AutoField widget is a multi-select control
    And the user can select multiple options

  Scenario: Checkbox renders for boolean fields
    When the form renders the field "disableIdleTimeout"
    Then the AutoField widget is a checkbox input
    And toggling the checkbox updates the field value
