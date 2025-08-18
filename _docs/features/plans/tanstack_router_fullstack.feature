@router @caching @frontend @microservices @observability @ci @playwright
Feature: TanStack Router integration without backend for best performance and caching, within a full-stack template
  As a developer
  I want a React + TanStack Router app that performs optimally without requiring a live backend for navigation and caching
  So that the frontend delivers instant UX while the broader system provides production-ready microservices and observability

  # Read me first
  # - Refer to USAGE.md for how to set up and start the different microservices and the main app
  # - These scenarios assume the frontend can run with mocked data (e.g., MSW) when backend is not available
  # - The broader stack (FastAPI, PostgreSQL, Redis, Pulsar, Prometheus, Grafana, OpenTelemetry, Tempo, Loki) is addressed via smoke tests

  Background:
    Given the app is built with Vite, React, TypeScript, Chakra UI, and TanStack Router
    And TanStack Query is configured with sensible defaults for caching, retries, and staleTime
    And route modules implement code-splitting and data prefetch where appropriate
    And dark mode is enabled with Chakra UI color mode configuration
    And Playwright is configured for E2E tests
    And the app supports running with mocked APIs (no backend) using Mock Service Worker
    And environment variables are loaded from .env per USAGE.md

  @no_backend @navigation @prefetch
  Scenario: Client-side navigation is instant and does not require backend
    Given the backend is offline or disabled
    And MSW provides deterministic mock responses for required endpoints
    When the user opens the app at "/"
    Then the landing route renders within 200ms of JS hydration
    And no network request to the real backend is made
    When the user hovers the "/dashboard" link
    Then the route module and data are prefetched in the background
    And subsequent navigation to "/dashboard" completes in under 150ms

  @caching @query @offline_first
  Scenario Outline: Query cache usage avoids redundant fetching and supports fast transitions
    Given the user has visited "<route>" once with successful data load
    And the TanStack Query cache holds the data for "<queryKey>"
    When the user navigates away and then back to "<route>"
    Then the view renders from cache immediately
    And no network call occurs until the data is stale per configured staleTime
    Examples:
      | route        | queryKey                 |
      | /dashboard   | ["stats","summary"]     |
      | /bookmarks   | ["bookmarks","list"]   |

  @error_states @resilience
  Scenario: Graceful error boundaries and retry behavior without backend
    Given the backend is offline
    And a route attempts a fetch that is not mocked by MSW
    When the request fails
    Then a user-friendly error boundary is displayed with retry option
    And retry respects the configured retry delay and max retries

  @code_splitting @progressive_data
  Scenario: Route-level code splitting and progressive data rendering
    Given a large route component is split by TanStack Router lazy loading
    And critical UI shell renders immediately
    When the user navigates to the route
    Then the shell displays skeleton loaders
    And the chunk for the route is loaded asynchronously
    And data renders progressively as queries resolve

  @a11y @dark_mode
  Scenario: Accessible navigation and persistent dark mode
    Given Chakra UI color mode is system-aware and persisted in local storage
    When the user toggles dark mode
    Then the preference is persisted across routes and reloads
    And focus is visible and keyboard navigation works across links and buttons

  # Full-stack smoke tests (system-level) — run when backend is enabled per USAGE.md
  @backend @smoke @fastapi
  Scenario: FastAPI health and OpenAPI are available
    Given the FastAPI service is running
    When I GET "/healthz"
    Then the response status is 200
    And the JSON includes {"status":"ok"}
    When I GET "/openapi.json"
    Then the response status is 200

  @backend @sql @sqlmodel @postgres
  Scenario: Database migrations and basic CRUD
    Given PostgreSQL is running and reachable
    And migrations have been applied
    When I create a new entity via the API
    Then it is persisted and retrievable by ID

  @redis @caching @rate_limit
  Scenario: Redis caching and rate limiting are enforced
    Given Redis (Upstash) is configured and reachable
    When a client sends 10 requests in 1 second to a rate-limited endpoint
    Then rate limits are applied per policy
    And a cached response is served when appropriate

  @pulsar @messaging
  Scenario: Apache Pulsar producer/consumer smoke test
    Given Pulsar is reachable with valid auth
    When a message is produced to a test topic
    Then a consumer receives the message within 2 seconds

  @observability @prometheus @grafana
  Scenario: Prometheus metrics exposed and visible in Grafana
    Given Prometheus scrapes the FastAPI /metrics endpoint
    When the app handles a request
    Then request duration and count metrics increase
    And Grafana dashboard shows updated metrics

  @tracing @opentelemetry @tempo
  Scenario: Distributed tracing spans are emitted and stored in Tempo
    Given OpenTelemetry SDK is configured with OTLP exporter
    When a request flows through FastAPI and external service calls
    Then spans are created with attributes (route, status_code, user_id when available)
    And the trace is visible in Tempo with end-to-end timing

  @logging @loki
  Scenario: Structured JSON logs are shipped to Loki
    Given logging is configured in JSON format with correlation IDs
    When the app handles a request that errors
    Then the error is logged with trace_id and span_id
    And the log is queryable in Grafana Loki

  @playwright @e2e
  Scenario: Basic E2E smoke test without backend
    Given the frontend is served locally with mocked APIs
    When Playwright navigates to the home page
    Then the page title contains "Interactive Avatar"
    And navigation to "/bookmarks" succeeds with content visible

  @load @locust
  Scenario: Load test profile executes against staging
    Given Locust is configured with user scenarios per USAGE.md
    When 200 users ramp up over 2 minutes
    Then p95 latency for the home route remains under 300ms with CDN caching enabled

  @security @jwt @auth
  Scenario: JWT auth flow with email-based password recovery
    Given a test user exists
    When the user logs in and accesses a protected route
    Then the request includes a valid JWT
    And access is granted
    When the user requests password recovery
    Then an email is sent with a secure token

  @docker @traefik @compose
  Scenario: Docker Compose runs services behind Traefik with HTTPS
    Given docker-compose is started per USAGE.md
    And Traefik is configured for automatic HTTPS certificates
    When the stack is healthy
    Then the frontend, API, Redis, and observability endpoints are reachable behind Traefik

  @ci @cd @github_actions @render
  Scenario: CI/CD pipelines build, test, and deploy
    Given GitHub Actions workflows are configured
    When a commit is pushed to main
    Then lint, unit, and Playwright tests run and pass
    And Docker images are built and pushed
    And deployment to Render.com completes successfully
