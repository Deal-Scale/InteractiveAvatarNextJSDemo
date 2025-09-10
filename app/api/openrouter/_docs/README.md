# OpenRouter Proxy API

This package exposes a catch-all proxy at `/api/openrouter/*` that forwards to `https://openrouter.ai/api/v1/*`, matching OpenRouter's official API reference.

## Quick Start

Set environment variables:

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_REFERER=https://your-app.example.com
OPENROUTER_APP_TITLE=Your App Name

CORS_ALLOW_ORIGINS="https://your-app.example.com,http://localhost:3000"
CORS_ALLOW_CREDENTIALS=true
```

## Supported Calls (via proxy)

- POST `/api/openrouter/chat/completions`
- GET `/api/openrouter/models`
- GET `/api/openrouter/models/{model}/endpoints`
- GET `/api/openrouter/providers`
- GET `/api/openrouter/credits`
- GET `/api/openrouter/activity`
- API Keys: GET/POST/PATCH/DELETE `/api/openrouter/keys` and `/api/openrouter/keys/{id}`

Any path under `/api/openrouter/*` is forwarded to `/api/v1/*` with method, query, headers, and body preserved.

## Headers

The proxy forwards:

- `Authorization`: incoming header takes priority; otherwise uses `OPENROUTER_API_KEY`
- `HTTP-Referer`: incoming or `OPENROUTER_REFERER`
- `X-Title`: incoming or `OPENROUTER_APP_TITLE`

## Examples

See:

- `app/api/openrouter/_examples/curl.md`
- `app/api/openrouter/_examples/typescript.ts`

## CORS

Configurable via `CORS_ALLOW_ORIGINS` and `CORS_ALLOW_CREDENTIALS`. An `OPTIONS` handler is implemented and response headers include `Vary: Origin` when appropriate.

## Notes

- Streaming (SSE) is supported; the proxy mirrors `content-type` and streams upstream responses.
- This proxy intentionally does not add business logic—requests are passed through to OpenRouter.