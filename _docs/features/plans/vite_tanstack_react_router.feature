Feature: Optimal Project Setup and Routing for FastAPI + React (Vite) + TanStack Router

  As a developer,
  I want to set up a modern, production-ready full-stack application
  leveraging FastAPI, Vite, React, TanStack Router, and an optimized DevOps/Observability stack,
  so that I can quickly build, test, observe, and deploy robust, scalable web applications.

  Background:
    Given I have reviewed the USAGE.md for service orchestration and environment configuration
    And all required service credentials and endpoints are available
    And Docker, Docker Compose, and Node.js are installed on my machine

  Scenario: Initialize the backend with FastAPI and supporting microservices
    Given I clone the project repository
    When I run "docker compose up -d" from the project root
    Then FastAPI should be running and accessible at the configured API endpoint
    And PostgreSQL, Redis (Upstash), and Apache Pulsar services should be started and healthy
    And FastAPI instrumentation endpoints (/health, /metrics) are reachable

  Scenario: Set up the frontend with Vite, React, TypeScript, Chakra UI, and TanStack Router
    Given the backend API is running
    When I run "cd frontend" and execute "pnpm install" or "npm install"
    And I start the frontend with "pnpm dev" or "npm run dev"
    Then the React app should launch at the configured port
    And the UI should load using Chakra UI components with dark mode support
    And navigation should be handled by TanStack Router with code-splitting and data preloading
    And the frontend should communicate with the FastAPI backend via the generated client

  Scenario: Configure TanStack Router for optimal routing and data loading
    Given a set of nested routes and dynamic segments defined for the app
    When I implement route definitions leveraging TanStack Router's route loader and actions
    Then data fetching should be colocated with routes for optimal performance and hydration
    And route-based code splitting should reduce initial bundle size
    And navigation should not cause full page reloads

  Scenario: Enable Observability and Monitoring
    Given Prometheus and Grafana Cloud are configured via Docker Compose
    When I access the /metrics endpoint on FastAPI
    Then Prometheus should scrape application and business metrics successfully
    And Grafana dashboards should visualize collected metrics
    And OpenTelemetry traces should be generated and exported to Tempo
    And logs should be structured in JSON and available in Loki

  Scenario: Test the stack with E2E and load testing
    Given Playwright tests are defined in the frontend
    When I run "pnpm test:e2e" or "npm run test:e2e"
    Then all user flows should be validated against the running backend
    And coverage reports should be generated
    When I run Locust against the backend endpoints
    Then load patterns should be simulated, and rate limiting tested via Redis

  Scenario: Secure and deploy the application
    Given JWT authentication and password hashing are enabled in FastAPI
    And Traefik is configured as a reverse proxy with automatic HTTPS certificates
    When I deploy the stack using Docker Compose in production mode
    Then the application should be accessible via the public URL with HTTPS enforced
    And CI/CD pipelines should build, test, and deploy the stack automatically via GitHub Actions
    And all observability tools should remain functional post-deployment

  Scenario: Developer workflow and extensibility
    Given new features or services need to be added
    When I follow the established patterns in the monorepo (e.g., microservice, frontend route)
    Then I can add, test, and observe new functionality with minimal configuration
    And documentation and code generation utilities should facilitate onboarding and maintenance
