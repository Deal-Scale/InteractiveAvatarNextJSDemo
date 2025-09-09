# Pollinations Text-to-Speech (TTS) Proxy

Route: `app/api/pollinations/text/tts/route.ts`

Local endpoint: `GET /api/pollinations/text/tts?prompt=...&voice=alloy`

Upstream proxied endpoint:
`https://text.pollinations.ai/{encodedPrompt}?model=openai-audio&voice={voice}`

## Features

- Returns audio as `audio/mpeg` stream (MP3)
- Edge runtime for low latency
- Minimal query interface: `prompt` (required), `voice` (optional; default `alloy`)

## Parameters

- `prompt` (required): Text to synthesize. Must be URL-encodable.
- `voice` (optional): e.g., `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`.

## Example (cURL)

```bash
curl -o hello.mp3 "http://localhost:3000/api/pollinations/text/tts?prompt=Hello%20world&voice=nova"
```

## Example (TypeScript)

```ts
async function speak(text: string, voice = "alloy") {
  const url = `/api/pollinations/text/tts?` + new URLSearchParams({ prompt: text, voice }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.onended = () => URL.revokeObjectURL(audioUrl);
  await audio.play();
}
```

## Notes

- Prefer short prompts due to URL length limits (GET).
- For longer text, consider chunking input or implementing a POST-based synthesis flow (if supported upstream).
- Add auth/rate-limits at this proxy if needed.
