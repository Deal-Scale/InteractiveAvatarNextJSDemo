Feature: Add Knowledge Base via sidebar button and tabbed modal
  As a user managing my Knowledge Bases
  I want a consistent sidebar button to add a new KB
  So that I can create from Text or connect a tool and sync via API

  Background:
    Given the app sidebar is visible
    And the Knowledge Base section exists in the sidebar

  @ui @sidebar
  Scenario: Sidebar shows an "Add Knowledge Base" action
    When I view the Knowledge Base section in the sidebar
    Then I see an "Add Knowledge Base" button styled consistently with other sidebar action buttons
    And the button has an accessible name and tooltip

  @ui @modal
  Scenario: Clicking the button opens a tabbed modal
    Given I click the "Add Knowledge Base" button
    Then a modal opens with title "Add Knowledge Base"
    And the modal has two tabs: "Text/Markdown" and "Tool Connection"
    And the first tab is selected by default

  @ui @markdown
  Scenario: Create KB from Text/Markdown
    Given I am on the "Text/Markdown" tab
    Then I can enter a KB name (required)
    And I can optionally add a description
    And I can paste or type Text/Markdown content
    When I click "Create"
    Then the app validates required fields
    And on success the KB is created and appears in the sidebar list
    And the modal closes

  @ui @tools @grid
  Scenario: Connect a Tool as a Knowledge Base source
    Given I am on the "Tool Connection" tab
    Then I see a grid of available connectors using the component grid hook
    And each connector shows name, icon, and short description
    And I see example connectors: "GitHub Repo", "Notion", "Google Drive", "Web Crawler", and "Custom API"
    When I select a connector
    Then I see a configuration panel for API key/secret, scopes, and sync options
    And I can test the connection
    When the connection test succeeds and I click "Connect"
    Then the KB source is saved
    And an initial sync job is scheduled via API
    And the KB appears in the sidebar with a status badge (e.g., "Syncing")

  @api @sync
  Scenario: Schedule initial sync and show status
    Given I have connected a tool-based KB
    When the backend schedules an initial sync
    Then the UI shows a status badge in the sidebar (one of: "Pending", "Syncing")
    And upon success the status badge updates to "Synced"
    And upon failure the status badge shows "Failed" with a retry action

  @validation @errors
  Scenario: Validation and error handling
    Given I submit without a name on Text/Markdown
    Then I see an inline error message for the name field
    When I test a tool connection with invalid credentials
    Then I see an error toast and the field is marked invalid

  @a11y @keyboard
  Scenario: Accessibility and keyboard navigation
    Given the modal is open
    Then keyboard focus is trapped within the modal
    And I can switch tabs using keyboard shortcuts
    And the modal has appropriate ARIA roles and labels

  @cancel
  Scenario: Cancel without saving
    Given the modal is open
    When I press Escape or click Cancel
    Then the modal closes without creating a KB

  @persistence
  Scenario: Persist draft between tabs during a single open session
    Given I have entered data in one tab
    When I switch to the other tab
    Then my previously entered data remains until I close the modal or click Reset

  @implementation
  Scenario: Files and code locations to implement this feature
    Then update or create the following files with the specified anchors and changes
      | file                                                                 | where/anchor                                                                                                  | change summary                                                                                           |
      | components/Sidebar/KnowledgebaseSection.tsx                         | After opening state line: "{!collapsedKnowledge && (" and inside the first <div className="px-2 pb-2">     | Add an actions row containing a right-aligned "Add Knowledge Base" button that opens the modal.          |
      | components/Sidebar/KnowledgebaseSection.tsx                         | Within the file header imports                                                                                | Ensure Dialog/Tabs/Button imports from our UI kit if used by local trigger wrapper.                      |
      | components/KnowledgeBase/AddKnowledgeBaseModal.tsx (new)            | New file                                                                                                      | Tabbed modal with two tabs: Text/Markdown (no preview), Tool Connection (component grid of connectors).  |
      | components/KnowledgeBase/connectors.ts (new)                        | New file                                                                                                      | Export an array for connectors: GitHub Repo, Notion, Google Drive, Web Crawler, Custom API.              |
      | lib/services/kb.ts (new)                                            | New file                                                                                                      | Service functions: createTextKB, testConnector, connectKBSource, fetchKBs, scheduleInitialSync.          |
      | mocks/handlers.ts                                                   | Add HTTP handlers                                                       | Mock endpoints: POST /api/kb, POST /api/kb/test-connection, POST /api/kb/connect, GET /api/kb, POST /api/kb/:id/sync |
      | lib/query/mutations.ts                                              | Add mutations                                                           | useCreateKB, useTestConnection, useConnectKB, useScheduleSync; wire to services.                         |
      | components/Sidebar/KnowledgebaseSection.tsx                         | In item rendering row (no preview change)                                                                     | Show status badge for API KBs: Pending/Syncing/Synced/Failed with Retry action in dropdown.              |

  @code-anchors
  Scenario: Exact code anchors for KnowledgebaseSection.tsx edits
    Then insert the following near the specified lines
      | anchor (exact or regex)                                                       | action                                                                                                     |
      | regex:^\s*!collapsedKnowledge && \($                                         | Inside the block's first child container, add an actions row above the tree list.                          |
      | regex:^\s*<div className=\"px-2 pb-2\">$                                   | Directly below this line, insert: <div className="flex items-center justify-end px-1 pb-2"><button className="..." data-testid="kb-add-btn">Add Knowledge Base</button></div> |
      | regex:^\s*export default function KnowledgebaseSection\(                      | Ensure component accepts onOpenAddKB?: () => void and call it in the button onClick handler.               |
      | regex:^\s*import .* from \"@/components/ui/.*\"                            | If needed, import Button from our UI kit and use it for the Add button; otherwise style a native button.   |

  @line-anchors
  Scenario: Current line numbers for KnowledgebaseSection.tsx (for guidance only)
    Then use these approximate line numbers as of this commit
      | file                                             | line | note                                                                                 |
      | components/Sidebar/KnowledgebaseSection.tsx     | 55   | Start of the conditional: {!collapsedKnowledge && (                                   |
      | components/Sidebar/KnowledgebaseSection.tsx     | 56   | Opening container div: <div className="px-2 pb-2">                                   |
      | components/Sidebar/KnowledgebaseSection.tsx     | 57   | Ternary: tree.length === 0 ? ... Begin empty-state vs tree                            |
      | components/Sidebar/KnowledgebaseSection.tsx     | 62   | <Tree className="text-xs"> begins; actions row must be inserted before this          |
      | components/Sidebar/KnowledgebaseSection.tsx     | 67-93| Item row including dropdown actions (status badge can render at the end of this row)   |
      | components/Sidebar/KnowledgebaseSection.tsx     | 19-28| Props definition; add optional onOpenAddKB?: () => void                               |
      | components/Sidebar/KnowledgebaseSection.tsx     | 44-53| Section header/collapse toggle; do not modify                                         |
    And remember that line numbers may drift after edits; anchors above are canonical.

  @new-components
  Scenario: New component file structure
    Then create the following files
      | path                                                       |
      | components/KnowledgeBase/AddKnowledgeBaseModal.tsx         |
      | components/KnowledgeBase/connectors.ts                     |

  @status-badges
  Scenario: Sidebar status badges for API Knowledge Bases
    Given a KB item has sourceType = "api"
    Then render a right-aligned status badge next to its name
      And supported statuses include: "Pending", "Syncing", "Synced", "Failed"
      And if "Failed", show a "Retry" action in the item dropdown
