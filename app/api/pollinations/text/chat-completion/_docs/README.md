# Pollinations Chat Completion API (OpenAI Compatible)

Route: `app/api/pollinations/text/chat-completion/route.ts`

This route proxies to `https://text.pollinations.ai/openai` and supports the OpenAI Chat Completions-style request/response format.

## Features

- JSON responses for standard chat completions
- Streaming responses via Server-Sent Events (SSE)
- Supports optional parameters like `seed`, `temperature`, `top_p`, `presence_penalty`, `frequency_penalty`
- Optional `response_format` / `jsonMode` for JSON-constrained output
- Optional `tools` and `tool_choice`

## Request Shape

See `./_requests.ts` for Typescript types. Minimal example body:

```json
{
  "model": "openai",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Say hello in one sentence." }
  ]
}
```

To enable streaming:

```json
{
  "model": "openai",
  "messages": [
    { "role": "user", "content": "Write a short poem about the sea." }
  ],
  "stream": true
}
```

## Response Shape

- Non-streaming: JSON body containing `choices[0].message.content`, see `./_responses.ts` for interfaces.
- Streaming (SSE): Each data line contains JSON with `choices[0].delta.content` accumulating until `[DONE]`.

## Examples

- cURL examples: `../_examples/curl.md`
- TypeScript usage: `../_examples/typescript.ts`

## Testing

Vitest tests under `../_tests/pollinations.route.test.ts` cover:
- Invalid request handling (400)
- Non-streaming success and error bubbling
- Streaming pass-through

Run tests:

```bash
pnpm test
```

or

```bash
pnpm vitest run
```

## Notes

- The route is configured with `export const runtime = "edge"` for lower-latency streaming in Next.js.
- For production, consider adding authentication and rate limiting.
- If you introduce API keys or referrer-based controls, add them on the server side here before forwarding to Pollinations.
