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

  Scenario: Configure TanStack Query for optimal data fetching
    Given the frontend uses TanStack Query for all API data interactions
    When I define query hooks colocated with components and configure caching strategies
    Then data fetching should be efficient and avoid unnecessary network requests
    And background refetching should keep UI data fresh without blocking rendering
    And query invalidation should ensure data consistency after mutations

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

  # Implementation Plan: Add a Vite + React + TanStack Router frontend to this repository

  Scenario: Create the Vite app skeleton in a new frontend directory
    Given I am at repo root `InteractiveAvatarNextJSDemo/`
    When I create a new directory `frontend/`
    Then I should have a place to host a Vite-based React app separate from the existing Next.js app

  Scenario: Initialize package.json and install dependencies with pnpm
    Given I am in `frontend/`
    When I run `pnpm init -y`
    And I run `pnpm add react react-dom @tanstack/react-router @tanstack/router-devtools @tanstack/react-query`
    And I run `pnpm add -D vite typescript @types/react @types/react-dom @vitejs/plugin-react`
    Then `frontend/package.json` should include the following scripts:
      """
      {
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        }
      }
      """

  Scenario: Add Vite config with React plugin and base settings
    Given I am in `frontend/`
    When I create `frontend/vite.config.ts` with the following content:
      """
      import { defineConfig } from 'vite'
      import react from '@vitejs/plugin-react'

      export default defineConfig({
        plugins: [react()],
      })
      """
    Then Vite will be configured for React and TSX support

  Scenario: Add TypeScript config
    Given I am in `frontend/`
    When I create `frontend/tsconfig.json` with the following content:
      """
      {
        "compilerOptions": {
          "target": "ES2020",
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "jsx": "react-jsx",
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "strict": true,
          "baseUrl": ".",
          "paths": {},
          "types": ["vite/client"]
        },
        "include": ["src"]
      }
      """
    Then TypeScript will be configured for the Vite app

  Scenario: Create entry HTML and React mount point
    Given I am in `frontend/`
    When I create `frontend/index.html` with the following content:
      """
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Interactive Avatar Vite App</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>
      """
    Then the app will have a root mount element

  Scenario: Set up TanStack Router with file-based routes
    Given I create the directories `frontend/src/` and `frontend/src/routes/`
    When I create `frontend/src/main.tsx` with the following content:
      """
      import React from 'react'
      import ReactDOM from 'react-dom/client'
      import { RouterProvider, createRouter } from '@tanstack/react-router'
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
      import { routeTree } from './routeTree.gen'

      const router = createRouter({ routeTree })
      declare module '@tanstack/react-router' { interface Register { router: typeof router } }
      const queryClient = new QueryClient()

      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </React.StrictMode>,
      )
      """
    And I create `frontend/src/routes/__root.tsx` with the following content:
      """
      import * as React from 'react'
      import { Outlet, createRootRoute } from '@tanstack/react-router'

      export const Route = createRootRoute({
        component: () => (
          <div>
            <h1>Interactive Avatar (Vite + TanStack Router)</h1>
            <Outlet />
          </div>
        ),
      })
      """
    And I create `frontend/src/routes/index.tsx` with the following content:
      """
      import * as React from 'react'
      import { createFileRoute, Link } from '@tanstack/react-router'

      export const Route = createFileRoute('/')({
        component: Index,
      })

      function Index() {
        return (
          <div>
            <p>Home route</p>
            <Link to="/about">Go to About</Link>
          </div>
        )
      }
      """
    And I create `frontend/src/routes/about.tsx` with the following content:
      """
      import * as React from 'react'
      import { createFileRoute, Link } from '@tanstack/react-router'

      export const Route = createFileRoute('/about')({
        component: About,
      })

      function About() {
        return (
          <div>
            <p>About route</p>
            <Link to="/">Back home</Link>
          </div>
        )
      }
      """
    Then the router should provide a root layout and two routes with links

  Scenario: Add route generation script for file-based routing
    Given I am in `frontend/`
    When I add the following dev dependency `pnpm add -D @tanstack/router-vite-plugin`
    And I update `frontend/vite.config.ts` to the following content:
      """
      import { defineConfig } from 'vite'
      import react from '@vitejs/plugin-react'
      import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

      export default defineConfig({
        plugins: [react(), TanStackRouterVite()],
      })
      """
    And I update `frontend/package.json` to include this section:
      """
      {
        "tanstack": {
          "routesDir": "src/routes"
        }
      }
      """
    Then the plugin should generate `src/routeTree.gen.ts` automatically

  Scenario: Run the Vite app
    Given I am in `frontend/`
    When I run `pnpm dev`
    Then the app should be available at `http://localhost:5173`
    And client-side navigation should work between `/` and `/about`

  Scenario: Optional — Integrate API calls with TanStack Query
    Given I add a simple fetch to a backend endpoint in `frontend/src/routes/index.tsx`
    When I import `useQuery` from `@tanstack/react-query` and call it inside `Index()`
    Then I should see live data rendered and cached according to QueryClient defaults
