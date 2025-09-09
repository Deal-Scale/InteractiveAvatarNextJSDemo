# Pollinations Vision (Image Input) Proxy

Route: `app/api/pollinations/text/vision/route.ts`

Local endpoint: `POST /api/pollinations/text/vision`

Upstream proxied endpoint:
`https://text.pollinations.ai/openai` (OpenAI-compatible)

## Features

- OpenAI-compatible body that can include image URLs or base64 data via `image_url`
- Returns standard OpenAI chat completion JSON with analysis in `choices[0].message.content`
- Edge runtime for responsiveness

## Request Body (examples)

URL-based image:

```json
{
  "model": "openai",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Describe this image:" },
        { "type": "image_url", "image_url": { "url": "https://example.com/cat.jpg" } }
      ]
    }
  ],
  "max_tokens": 300
}
```

Base64 inline image:

```json
{
  "model": "openai",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "What is in this image?" },
        { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,BASE64..." } }
      ]
    }
  ]
}
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
