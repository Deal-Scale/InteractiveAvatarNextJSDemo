# Deploy to Cloudflare Pages (Next.js 15 + next-on-pages)

This project is pre-configured to deploy to Cloudflare Pages using `@cloudflare/next-on-pages`.

## Prerequisites

- Cloudflare account
- `wrangler` CLI installed: `npm i -g wrangler`
- Node 20+, pnpm 9+

## Scripts

- `pnpm cf:build` — Builds Next.js and prepares the Cloudflare Pages output with next-on-pages
- `pnpm cf:preview` — Serves a local preview using next-on-pages

These are defined in `package.json`.

## Local Preview

```
pnpm install
pnpm cf:build
pnpm cf:preview
```

Open http://localhost:3000

## Cloudflare Pages (Dashboard)

1. Create a new Pages project and connect this repository.
2. Build settings:
   - Build command: `pnpm cf:build`
   - Output directory: `.vercel/output/static`
   - Functions directory: `.vercel/output/functions`
3. Environment variables:
   - Add all required `NEXT_PUBLIC_*` and server-side env vars used by your app
4. Save and deploy.

## Cloudflare Pages (wrangler CLI)

After `pnpm cf:build`, you can deploy with wrangler:

```
# From project root
wrangler pages deploy .vercel/output/static \
  --project-name <your-pages-project> \
  --branch main
```

If your project is not created yet:

```
wrangler pages project create <your-pages-project> \
  --production-branch main
```

## Config File

`wrangler.toml` is included at the project root:

```
name = "interactive-avatar-nextjs"
compatibility_date = "2024-11-01"

[pages]
build_output_dir = ".vercel/output/static"
```

No additional configuration is needed; `@cloudflare/next-on-pages` will generate `.vercel/output/` contents.

## Notes

- Ensure your environment variables are set in Cloudflare Pages for production.
- If you use edge features, `next-on-pages` will map them automatically.
- For SSR routes, Pages Functions will be created under `.vercel/output/functions`.
