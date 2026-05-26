# VIPER in Modern React Frontend (Production-Ready)

## 0. README
This document describes how to implement the VIPER (View, Interactor, Presenter, Entity, Router) pattern in a production-grade React frontend using your preferred stack. It includes a technology mapping table, directory structure, best practices, and update instructions.

- **Last updated:** 2025-05-05
- **Maintainer:** Ty the Programmer
- **Stack:** React (TypeScript), Tailwind CSS, Next Router, Zustand, Shadcn, Framer Motion, Spline, Cloudinary, Playwright/Jest, Vercel

---

## 1. Overview
VIPER (View, Interactor, Presenter, Entity, Router) is a highly modular frontend architecture pattern. It separates UI, business logic, and navigation for large-scale, testable React apps.

- **View:** UI rendering and styling
- **Interactor:** Business logic, async operations
- **Presenter:** UI logic, event handling, data formatting
- **Entity:** State/data models
- **Router:** Navigation and routing

---

## 2. Technology Stack Table
| Role        | Technology/Tool         | Purpose/Notes                 |
|-------------|------------------------|-------------------------------|
| View        | React, Shadcn, Tailwind CSS | UI rendering, styling        |
| Interactor  | Custom Hooks/Services  | Business logic, async ops     |
| Presenter   | Custom Hooks/Context   | UI logic, event handling      |
| Entity      | Zustand, React Query   | State, data models            |
| Router      | Next Router            | Navigation                    |
| Animation   | Framer Motion          | UI animations                 |
| Media       | Cloudinary, Spline     | Asset management, 3D          |
| Testing     | Playwright, Jest       | E2E/unit testing              |
| CI/CD       | Vercel                 | Deployment                    |

---

## 3. Directory Structure Example
```text
frontend/
  components/    # Views (UI)
  interactors/   # Business logic/services
  presenters/    # UI logic/context
  state/         # Entities (Zustand stores, React Query)
  pages/         # Routing (Next.js)
  styles/        # Tailwind configs
  assets/        # Images, 3D, media
  tests/         # Playwright/Jest
  utils/         # Shared utilities
```

---

## 4. Mapping Stack to VIPER Roles
- **View:** React components, Shadcn UI, Tailwind CSS for UI
- **Interactor:** Custom hooks/services for business logic
- **Presenter:** Custom hooks/context for UI logic
- **Entity:** Zustand stores, React Query for state/data
- **Router:** Next Router for navigation

---

## 5. Best Practices
- Use strict TypeScript for all files; validate data with Zod if needed
- Keep business logic out of UI components (prefer hooks/services)
- Use React Query for async data and caching
- Memoize expensive logic with useMemo, React.memo
- Modularize state using Zustand slices
- Use Tailwind and Shadcn for consistent, accessible UI
- Write Playwright/Jest tests for all critical flows
- Use dynamic imports and code splitting for performance
- Store global/shared data in state manager or query cache
- Document all architectural decisions and keep this file updated

---

## 6. Update Instructions
- Update this file if the stack, directory structure, or pattern usage changes
- Add a datestamp and your name for traceability
- Review references and keep them current

---

## 7. References
- [React Docs](https://react.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query](https://tanstack.com/query/v4/)
- [Next.js Routing](https://nextjs.org/docs/routing/introduction)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Cloudinary](https://cloudinary.com/)
- [Spline](https://spline.design/)
- [Playwright](https://playwright.dev/)
- [Jest](https://jestjs.io/)
- [Vercel](https://vercel.com/)

---

<!-- ! All technologies/tools explicitly mapped. todo: Update if stack changes. ! This doc is production-ready as of 2025-05-05. Maintainer: Ty the Programmer -->
