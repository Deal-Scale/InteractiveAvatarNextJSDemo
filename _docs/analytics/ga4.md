# Google Analytics 4 (react-ga4) Integration

This project integrates GA4 via `react-ga4` with a simple toggle and automatic pageview tracking in the Next.js App Router.

Implemented features:

- Initialization with one or more GA4 Measurement IDs
- Automatic pageview tracking on route changes
- Manual pageview helper
- Custom event helper
- Environment-based enable/disable and localhost gating


## Files

- `components/analytics/GA4Tracker.tsx`
  - Client component that initializes GA and sends pageviews on navigation
- `lib/analytics/ga.ts`
  - Thin wrapper exposing `initGA`, `sendPageview`, `gaEvent`, `gaSet`
- `app/layout.tsx`
  - Renders `<GA4Tracker />` so analytics is active on every page when enabled


## Configuration

Add to `.env` or `.env.local`:

```
# Master toggle
NEXT_PUBLIC_ENABLE_GA4=true

# Comma-separated list of GA4 measurement IDs
NEXT_PUBLIC_GA4_MEASUREMENT_IDS=G-XXXXXXX,G-YYYYYYY

# Only track localhost if explicitly allowed
NEXT_PUBLIC_GA4_ALLOW_LOCALHOST=false
```

Notes:
- If `NEXT_PUBLIC_ENABLE_GA4` is not `true`, GA4 is not initialized.
- If no IDs are provided, GA4 is not initialized.
- If running on `localhost` and `NEXT_PUBLIC_GA4_ALLOW_LOCALHOST` is not `true`, GA4 is not initialized.


## Automatic pageviews

`GA4Tracker` sends:
- An initial pageview on mount
- A pageview whenever the App Router path or search params change


## Manual usage

Send a manual pageview:

```ts
import { sendPageview } from "@/lib/analytics/ga";

sendPageview("/custom-path?x=1", "Custom Title");
```

Send a custom event:

```ts
import { gaEvent } from "@/lib/analytics/ga";

gaEvent({
  category: "engagement",
  action: "cta_click",
  label: "hero",
  value: 1,
});
```

Set fields:

```ts
import { gaSet } from "@/lib/analytics/ga";

gaSet({ user_id: "123" });
```


## Coexistence with other analytics

This project also includes Plausible (`components/analytics/PlausibleTracker.tsx`). Both can run side-by-side.

- Control GA4 via `NEXT_PUBLIC_ENABLE_GA4`.
- Control Plausible via its own envs (`NEXT_PUBLIC_PLAUSIBLE_*`).
