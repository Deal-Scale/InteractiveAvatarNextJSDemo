# Plausible Analytics Tracker Integration

This project integrates Plausible using the `plausible-tracker` NPM package.

Implemented features:

- Auto SPA page view tracking via History API overrides
- Outbound link click tracking (including dynamically added links)
- Manual pageview tracking API
- Custom events/goals tracking API with optional props, callback and overrides
- Hash-based routing support (configurable)
- Cleanup of all listeners on unmount
- TypeScript-first, tree-shakeable


## Files

- `components/analytics/PlausibleTracker.tsx`
  - Client component that initializes Plausible on the client
  - Enables auto page views and outbound link tracking
  - Cleans up on unmount
- `lib/analytics/plausible.ts`
  - Thin wrapper exposing `init`, `trackPageview`, `trackEvent`,
    `enableAutoPageviews`, `enableAutoOutboundTracking`
- `app/layout.tsx`
  - Renders `<PlausibleTracker />` so analytics is active on every page


## Configuration

Environment variables (optional):

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — your Plausible domain (e.g. example.com). Defaults to `window.location.hostname`.
- `NEXT_PUBLIC_PLAUSIBLE_TRACK_LOCALHOST` — set to `true` to track localhost.
- `NEXT_PUBLIC_PLAUSIBLE_API_HOST` — override API host if self-hosting.
- `NEXT_PUBLIC_PLAUSIBLE_HASH_MODE` — set to `true` to enable hash-based routing tracking.

These are read by `PlausibleTracker` during initialization.


## Auto pageviews

Auto tracking is enabled globally by `PlausibleTracker`:

```tsx
// app/layout.tsx
<main>
  <PlausibleTracker />
  {children}
</main>
```

Under the hood:

```ts
// components/analytics/PlausibleTracker.tsx
initPlausible({ domain, trackLocalhost, hashMode, apiHost })
const cleanupAutoPageviews = enableAutoPageviews()
```

To disable, remove `<PlausibleTracker />` from the layout.


## Outbound link click tracking

Automatically enabled by `PlausibleTracker`:

```ts
const cleanupOutbound = enableAutoOutboundTracking()
```

This attaches listeners to `<a>` elements and uses a `MutationObserver` to include dynamically-added links.


## Manual pageview tracking

Use `trackPageview` from the shared module to record a pageview explicitly:

```ts
import { trackPageview } from "@/lib/analytics/plausible"

// Default behavior
trackPageview()

// With overrides
trackPageview({ url: "https://my-app.com/my-url", trackLocalhost: false }, {
  callback: () => console.log("pageview sent")
})
```

Supported options mirror `plausible-tracker` docs (`url`, `referrer`, `deviceWidth`, etc.).


## Custom events and goals

Use `trackEvent` to send custom goals with optional props and overrides:

```ts
import { trackEvent } from "@/lib/analytics/plausible"

// Simple goal
trackEvent("signup")

// With props and callback
trackEvent(
  "download",
  { props: { method: "HTTP" }, callback: () => console.log("done") },
  { trackLocalhost: true }
)
```


## Cleanup

`PlausibleTracker` cleans up all listeners when unmounted:

```ts
const cleanupAutoPageviews = enableAutoPageviews()
const cleanupOutbound = enableAutoOutboundTracking()

return () => {
  cleanupAutoPageviews?.()
  cleanupOutbound?.()
}
```

If you use these functions manually elsewhere, store and call the cleanup functions similarly.


## Hash routing support

If your app uses URL hashes to represent pages, enable hash mode via env:

```
NEXT_PUBLIC_PLAUSIBLE_HASH_MODE=true
```

This delegates `hashchange` handling to Plausible’s internal listener.


## Example: tracking a CTA click

```tsx
import { trackEvent } from "@/lib/analytics/plausible"

export function CTAButton() {
  return (
    <button
      onClick={() => trackEvent("cta_click", { props: { placement: "hero" } })}
      className="btn btn-primary"
    >
      Get Started
    </button>
  )
}
```


## Notes

- Analytics errors are non-fatal and will not break the app in development.
- Requests are sent to `https://plausible.io` by default unless `NEXT_PUBLIC_PLAUSIBLE_API_HOST` is set.
- To opt-out locally, set `localStorage.plausible_ignore = "true"`.
