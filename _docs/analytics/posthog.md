# PostHog (posthog-js) Integration for React/Next.js

This project integrates PostHog on the client with context provider, autocapture, optional session recording, and ready-to-use hooks and APIs.

Implemented features:

- PostHog initialization via environment variables
- React context via `PostHogProvider` so hooks work across the app
- Autocapture (pageviews, clicks, inputs) configurable
- Optional session recording toggle
- Compatible with Next.js App Router (client provider under `app/providers.tsx`)


## Files

- `components/analytics/PostHogProviderBridge.tsx`
  - Initializes `posthog-js` with env options and wraps children with `PostHogProvider`
- `app/providers.tsx`
  - Uses `PostHogProviderBridge` as a top-level provider alongside React Query providers


## Configuration (env)

Add to `.env` or `.env.local`:

```
# Master toggle
NEXT_PUBLIC_ENABLE_POSTHOG=true

# Keys/host (find in PostHog project settings)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Optional
NEXT_PUBLIC_POSTHOG_CAPTURE_PAGEVIEW=true
NEXT_PUBLIC_POSTHOG_DEBUG=false
NEXT_PUBLIC_POSTHOG_SESSION_RECORDING=true
```

Notes:
- If `NEXT_PUBLIC_ENABLE_POSTHOG` is not `true` or `NEXT_PUBLIC_POSTHOG_KEY` is missing, PostHog will not initialize.
- Session recording passes an empty options object when enabled (per posthog-js types).


## Usage

Autocapture is enabled by default. To use PostHog APIs (identify, capture, groups, feature flags, etc.), access the client via the React hook:

```tsx
import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

export function Example() {
  const posthog = usePostHog()

  useEffect(() => {
    // Always use optional chaining to avoid calls before init
    posthog?.identify('user_123', { email: 'a@example.com' })
    posthog?.group('company', 'acme_inc')
  }, [posthog])

  return (
    <button onClick={() => posthog?.capture('cta_click', { placement: 'hero' })}>
      Click me
    </button>
  )
}
```

### Feature flags (hooks)

```tsx
import { useFeatureFlagEnabled, useFeatureFlagVariantKey, useFeatureFlagPayload } from 'posthog-js/react'

export function Flagged() {
  const enabled = useFeatureFlagEnabled('welcome-flag')
  const variant = useFeatureFlagVariantKey('welcome-flag')
  const payload = useFeatureFlagPayload('welcome-flag')

  if (!enabled) return <div>No welcome</div>
  return <div>{payload?.welcomeMessage ?? (variant === 'a' ? 'Welcome A' : 'Welcome')}</div>
}
```

### Feature flags (component)

```tsx
import { PostHogFeature } from 'posthog-js/react'

export function FlaggedBlock() {
  return (
    <PostHogFeature flag="welcome-flag" match={true}>
      <div>Hello from feature</div>
    </PostHogFeature>
  )
}
```


## Verification

- With envs set and dev server running, open the app and check:
  - Network requests to your PostHog host (e.g., `https://us.i.posthog.com/e/`)
  - `window.posthog` exists in console
  - Hook calls with `posthog?.capture()` send events

## Notes

- Provider intentionally renders children even if PostHog fails to init, to avoid blocking the app.
- Analytics errors are non-fatal and logged only in development.
