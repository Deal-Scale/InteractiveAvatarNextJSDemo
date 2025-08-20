Feature: AutoForm renders correct widgets per Zod type

  As a developer
  I want AutoForm/AutoField to map Zod types to the correct UI widgets
  So that users get proper controls instead of generic single-line text inputs

  Background:
    Given I open the Session Config modal → Agent tab in the app
    And browser devtools console is open to capture AutoForm/AutoField logs
    And logs include entries "AutoForm field <name> <type>", "AutoField detect { name, typeName }", and "unwrapType trace { ... }"

  # Example Expected mappings by field/type
  # - temperature        → ZodNumber                        → slider (range input)
  # - quality            → ZodNativeEnum                    → select
  # - voiceChatTransport → ZodNativeEnum                    → select
  # - language           → ZodString with options           → select
  # - mcpServers         → ZodArray(el: ZodString) options  → multi-select (or tag/checkbox group)
  # - systemPrompt       → ZodString described as multiline → textarea
  # - disableIdleTimeout → ZodBoolean (when widget='select')→ select (true/false)

  Scenario: temperature renders as a slider
    When the form renders the field "temperature"
    Then the AutoField widget is a slider control (range)
    And console shows a detection type "ZodNumber"

  Scenario: quality renders as a select from enum values
    When the form renders the field "quality"
    Then the AutoField widget is a single-select dropdown
    And console shows a detection type "ZodNativeEnum"

  Scenario: voiceChatTransport renders as a select from enum values
    When the form renders the field "voiceChatTransport"
    Then the AutoField widget is a single-select dropdown
    And console shows a detection type "ZodNativeEnum"

  Scenario: language renders as a select from provided options
    When the form renders the field "language"
    Then the AutoField widget is a single-select dropdown
    And console shows a detection type "ZodString"
    And options are populated from schema/config

  Scenario: mcpServers renders as a multi-select
    When the form renders the field "mcpServers"
    Then the AutoField widget is a multi-select (or tag/checkbox group)
    And console shows a detection type "ZodArray"

  Scenario: systemPrompt renders as a textarea
    When the form renders the field "systemPrompt"
    Then the AutoField widget is a textarea (multiline)
    And console shows a detection type "ZodString"

  Scenario: disableIdleTimeout renders as a boolean selector
    When the form renders the field "disableIdleTimeout"
    Then the AutoField widget is a boolean selector (e.g., true/false select)
    And console shows a detection type "ZodBoolean"

  # Bug reproduction: all fields incorrectly render as single-line text inputs
  Scenario: Regression – all fields appear as text inputs
    Given the current bug is present
    When I open the Agent tab
    Then each of the fields above renders as a single-line text input
    And console logs still print type detections for each field
    And this indicates rendering logic is not mapping detected types to widgets

  # Diagnostics and acceptance
  Scenario: Console diagnostics confirm correct type unwrapping
    When I expand the console logs for a few fields: temperature, quality, voiceChatTransport, language
    Then I see "unwrapType trace" logs showing wrappers and a final base type matching expectations

  Scenario: Acceptance – correct widgets render for all fields
    Given the mapping logic is fixed
    When I reload the app with cache disabled
    Then each field renders with the widget specified in the Expected mappings by field/type above

  # File locations and implementation details:
  # - components/forms/AutoForm.tsx: client component; enumerates schema shape; logs "AutoForm field <name> <type>"
  # - components/forms/AutoField.tsx: client component; detects via _def.typeName; logs detection per field
  # - components/forms/utils.ts: unwrapType helper; logs wrappers and final base type
  # - lib/schemas/agent.ts: ensure a single zod import (e.g., `import { z } from 'zod'`)
  # - Acceptance: Logs show correct type detections; UI widgets match expected controls for each field; no generic text inputs for typed fields
