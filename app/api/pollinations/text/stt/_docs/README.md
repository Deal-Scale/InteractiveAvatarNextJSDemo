# Pollinations Speech-to-Text (STT) Proxy

Route: `app/api/pollinations/text/stt/route.ts`

Local endpoint: `POST /api/pollinations/text/stt`

Upstream proxied endpoint:
`https://text.pollinations.ai/openai` with `model: "openai-audio"`

## Features

- OpenAI-compatible body with inline base64 audio via `input_audio`
- Returns standard OpenAI chat completion JSON with the transcription in `choices[0].message.content`
- Edge runtime for responsiveness

## Request Body (example)

```json
{
  "model": "openai-audio",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Transcribe this:" },
        {
          "type": "input_audio",
          "input_audio": { "data": "<base64>", "format": "wav" }
        }
      ]
    }
  ]
}
```

Supported audio formats (commonly): `wav`, `mp3`. Ensure your base64 is correct for the given format.

## Example (cURL)

```bash
curl http://localhost:3000/api/pollinations/text/stt \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-audio",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Transcribe this:"},
          {"type": "input_audio", "input_audio": {"data": "<base64>", "format": "wav"}}
        ]
      }
    ]
  }'
```

## Example (TypeScript)

```ts
async function transcribe(base64: string, fmt: "wav" | "mp3" = "wav") {
  const body = {
    model: "openai-audio",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Transcribe this:" },
          { type: "input_audio", input_audio: { data: base64, format: fmt } },
        ],
      },
    ],
  };
  const res = await fetch("/api/pollinations/text/stt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json?.choices?.[0]?.message?.content as string | undefined;
}
```

## Notes

- The proxy enforces `model: "openai-audio"` server-side.
- Validate/limit payload size if you plan to accept large audio.
- Add auth/rate-limits as appropriate.

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
