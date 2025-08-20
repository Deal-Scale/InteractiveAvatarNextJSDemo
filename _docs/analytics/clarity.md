# Microsoft Clarity Integration (Next.js App Router)

This project integrates Microsoft Clarity via Next.js `next/script` for non‑blocking, client‑side analytics.

Implemented in: `app/layout.tsx`

```tsx
// app/layout.tsx (excerpt)
{/* Microsoft Clarity */}
<Script id="ms-clarity" strategy="afterInteractive">{`
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "REPLACE_ME");
`}</Script>
```

Replace `REPLACE_ME` with your Clarity project ID (e.g., `sttpn4xwgd`).


## Configuration

- Project ID: Copy from Clarity dashboard → Settings → Installation → Project ID.
- Placement: In `app/layout.tsx` so it loads on all pages after hydration (`strategy="afterInteractive"`).
- No additional env vars required. If you prefer envs, create an inline string from `process.env.NEXT_PUBLIC_CLARITY_ID`.

Example (optional env usage):
```tsx
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
// then interpolate CLARITY_ID in the snippet
```


## Verify installation

- Open DevTools → Network → check for a request like `https://www.clarity.ms/tag/<PROJECT_ID>`.
- In Console, `typeof window.clarity === 'function'` should be `true`.
- Navigate around the site; sessions should appear in Clarity after a short delay.


## SPA considerations

- The snippet works for SPA routing (Next.js App Router). Clarity tracks route changes automatically; no extra code needed.
- If you lazy‑mount heavy pages, Clarity still runs because it is attached at the root layout.


## Privacy and compliance

- Clarity provides session replay. Mask or exclude sensitive elements:
  - Add `data-clarity-mask="true"` to mask an element’s text content.
  - Add `data-clarity-unmask="true"` to unmask within a masked parent where appropriate.
  - Add `data-clarity-region="hide"` to hide an element entirely from recordings.
- If you have a consent banner, only load Clarity after consent. One approach is to conditionally render the `<Script>` component after consent state is granted.


## Disable in certain environments

- You can guard rendering based on environment variables, for example:
```tsx
{process.env.NEXT_PUBLIC_ENABLE_CLARITY === 'true' && (
  <Script id="ms-clarity" strategy="afterInteractive">{`/* snippet */`}</Script>
)}
```


## Troubleshooting

- If you don’t see network requests:
  - Ensure the Project ID is correct and not `REPLACE_ME`.
  - Confirm the `<Script>` is rendered (add a temporary console.log before it).
  - Ad blockers may block requests; try an incognito window without blockers.
- If session replays don’t show:
  - Wait a few minutes; Clarity can be delayed.
  - Check browser privacy settings and tracking protection.


## QA checklist

- [ ] `app/layout.tsx` contains the Clarity script with the correct Project ID.
- [ ] Network tab shows `clarity.ms/tag/<PROJECT_ID>` after page load.
- [ ] `window.clarity` exists and is callable in console.
- [ ] Sensitive fields (passwords, IDs) are masked or hidden where needed.
- [ ] Optional: controlled by an environment flag in non‑prod.
