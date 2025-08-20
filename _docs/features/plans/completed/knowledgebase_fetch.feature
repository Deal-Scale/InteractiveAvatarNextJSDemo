Feature: CRUD endpoints for Knowledge Base and sidebar integration

  As a developer
  I want to implement backend CRUD endpoints for Knowledge Bases
  So that the sidebar UI can create, read, update, and delete KBs

  Background:
    Given the Knowledge Base section exists in the sidebar
    And the backend exposes a REST API for Knowledge Bases

  @backend
  Scenario: Implement CRUD endpoints for Knowledge Bases
    Then create the following endpoints
      | method | path                | description                       |
      | GET    | /api/kb             | List all KBs                      |
      | POST   | /api/kb             | Create a new KB                   |
      | GET    | /api/kb/:id         | Get a specific KB                 |
      | PATCH  | /api/kb/:id         | Update KB name/desc/source        |
      | DELETE | /api/kb/:id         | Delete a KB                       |
    And implement service functions for each operation in lib/services/kb.ts

  @frontend
  Scenario: Wire sidebar to CRUD endpoints
    Given the sidebar Knowledge Base section is rendered
    When the component mounts
    Then fetch KBs from GET /api/kb and render the list
    When a user creates a new KB via the modal
    Then call POST /api/kb and update the sidebar on success
    When a user edits a KB's name or description
    Then call PATCH /api/kb/:id and update the sidebar entry
    When a user deletes a KB from the dropdown
    Then call DELETE /api/kb/:id and remove it from the sidebar

  @integration
  Scenario: Data hooks for sidebar
    Then create React query hooks in lib/query/kb.ts:
      | hook               | description                        |

