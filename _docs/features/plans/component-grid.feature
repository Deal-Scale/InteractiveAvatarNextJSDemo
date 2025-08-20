Feature: Reusable Component Grid with lazy loading, pagination, search, and category filters
  The UI should provide a reusable grid that renders arbitrary React components as items.
  It must support client-side search, category filtering, and server-backed pagination with
  lazy loading (infinite scroll) and a paginated mode. It should be performant and accessible.

  # Implementation Targets (planning)
  # - Grid component: components/ui/ComponentGrid.tsx
  # - Item renderer (provided by consumer): React.ComponentType<GridItemProps>
  # - Hooks: components/ui/hooks/useGridData.ts (fetch, paging, search, filters)
  # - Types: types/component-grid.ts
  # - Tests: components/ui/__tests__/ComponentGrid.spec.tsx

  Background:
    Given a dataset endpoint that supports query parameters: page, page_size, search, category
    And the grid is configured with a page size of 24
    And categories include: "All", "Audio", "Video", "Image", "Docs"
    And the consumer passes a custom React item component that accepts { item, index, onSelect }

  Scenario: Render grid items using a custom React component
    Given the grid receives a list of 24 items for page 1
    And a custom React item component is provided
    When the grid renders
    Then each item cell uses the provided component to render its content
    And aria roles and labels are present for screen readers

  Scenario: Client-side search input filters visible items and triggers server fetch
    Given the search box is empty
    When I type "sales" into the search box
    Then the grid clears current items and shows a loading state
    And it fetches page 1 with search="sales" and page_size=24
    And after the response, the first 24 matching items render

  Scenario: Category filter updates the query and resets pagination
    Given the current category is "All"
    When I select the category "Video"
    Then the grid resets to page 1
    And it fetches with category="Video" and page_size=24
    And only items of category "Video" render

  Scenario: Infinite scroll lazy loading (append on intersection)
    Given infinite scroll mode is enabled
    And page 1 of 24 items is displayed
    When the sentinel element intersects viewport bottom
    Then the grid fetches page 2
    And appends items 25-48 smoothly without resetting scroll

  Scenario: Classic pagination (next/prev buttons)
    Given pagination mode is enabled
    And I am on page 1
    When I click "Next"
    Then the grid fetches page 2 and replaces the items
    And the page indicator updates to 2

  Scenario: Combined search + category filter with infinite scroll
    Given the search term is "guide" and category is "Docs"
    And page 1 is displayed
    When the sentinel intersects
    Then the grid fetches page 2 with search="guide" and category="Docs"
    And appends the new results preserving the active filters

  Scenario: Empty state
    Given the search term is "__no_match__"
    When the query resolves with zero results
    Then the grid shows an empty state with a helpful message
    And suggests clearing filters or changing the search term

  Scenario: Loading and skeleton states
    Given a request is in-flight
    Then the grid displays skeleton placeholders sized to the layout columns
    And the skeletons are announced to AT as loading region with aria-busy

  Scenario: Error state with retry
    Given the server returns a 500 error
    Then the grid shows an inline error state with a Retry button
    When I click Retry
    Then the grid re-attempts the last query parameters

  Scenario: Accessibility of controls
    Given the search input, category filter, and pagination controls are rendered
    Then they have proper labels and keyboard navigation
    And focus is preserved after results update

  Scenario: Performance budget for large datasets
    Given the dataset may exceed 10,000 items
    Then the grid uses virtualization for visible rows only
    And avoids re-rendering unchanged items by memoizing item components

  Scenario: API contract for component props (documentation)
    Given the consumer passes a React component for item cells
    Then the grid provides props: { item, index, onSelect, selected, className }
    And the consumer may pass an onItemClick handler to the grid
    And the grid exposes imperative handle for scrollToIndex in virtualization mode

  Scenario: Preserving state when navigating away and back
    Given I scroll to page 3 and select category "Image"
    When I navigate away and return to the grid view
    Then the grid restores search, category, page and scroll offset from URL or store

  Scenario: URL sync for sharable state
    Given I change search to "demo" and select category "Audio"
    Then the URL updates with query params search=demo&category=Audio&page=1
    And loading state is derived from the URL-synced state on initial load

  # --- Additional Scenarios: Multi-select filters, Debounce, SSR, Caching ---

  Scenario: Multi-select category filters (OR semantics)
    Given available categories include "Audio", "Video", "Image"
    And no category is selected
    When I select categories "Audio" and "Video"
    Then the grid resets to page 1
    And it fetches with categories=["Audio","Video"] and page_size=24
    And items whose category is either "Audio" or "Video" render

  Scenario: Tag filters (AND semantics)
    Given items contain tags and the filter mode is AND
    When I select tags "HD" and "Tutorial"
    Then the grid fetches with tags=["HD","Tutorial"]
    And only items containing both tags render

  Scenario: Clear all filters
    Given I have search term "demo" and selected categories ["Audio","Video"]
    When I click "Clear all"
    Then search becomes empty and categories become []
    And the grid fetches page 1 with default parameters

  Scenario: Debounced search reduces network requests
    Given debounce is set to 250ms
    When I type "interac"
    And within 200ms I continue typing to "interactive"
    Then only one server fetch is performed with search="interactive"

  Scenario: Caching and keepPreviousData for smooth pagination
    Given I move from page 1 to page 2 and back to page 1
    Then page 1 renders instantly from cache without a loading flash
    And a background refetch updates page 1 if needed

  Scenario: Infinite scroll caching with page boundaries
    Given infinite scroll mode is enabled
    And I have loaded pages 1 and 2
    When I scroll back up
    Then pages 1 and 2 remain available from cache without refetching

  Scenario: Server-side rendering initial grid data
    Given I open app/components/page
    Then the server fetches page 1 and returns initial items as props
    And the client hydrates with initialData and resumes fetching on interaction

  # Implementation Targets (extended planning)
  # - components/ui/ComponentGrid.tsx (Client): grid layout, virtualization, a11y
  # - components/ui/ComponentGridControls.tsx (Client): search, multi-select filters, clear-all
  # - components/ui/hooks/useGridData.ts (Client): pagination, infinite, debounce, caching
  # - lib/server/componentGrid.ts (Server): build query, fetch with cache tags/revalidate
  # - app/components/page.tsx (Server): SSR page providing initialData to client grid
  # - types/component-grid.ts: item and query param types
  # - components/ui/__tests__/ComponentGrid.spec.tsx: render/behavior tests
