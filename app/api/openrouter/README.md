# OpenRouter Proxy Usage Guide

## 1. Setup

### Environment Variables

```env
# .env.local
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_REFERER=https://your-app.com
OPENROUTER_APP_TITLE=Your App
CORS_ALLOW_ORIGINS="http://localhost:3000,https://your-app.com"
CORS_ALLOW_CREDENTIALS=true
```

### Installation

```bash
pnpm install @openrouter/ai-sdk-provider  # Recommended client SDK
```

---

## 2. Next.js API Usage

All endpoints are available at `/api/openrouter/*`. Example:

```ts
// app/page.tsx
import { OpenRouter } from "@openrouter/ai-sdk-provider";

export default function Page() {
  const handleChat = async () => {
    const res = await fetch('/api/openrouter/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: 'Hello!' }]
      })
    });
    const data = await res.json();
    console.log(data.choices[0].message.content);
  };
}
```

---

## 3. React Hook Example

```tsx
// hooks/useOpenRouter.ts
import { useState } from "react";

export function useOpenRouter() {
  const [response, setResponse] = useState("");

  const chat = async (input: string) => {
    const res = await fetch("/api/openrouter/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: input }]
      })
    });
    const data = await res.json();
    setResponse(data.choices[0].message.content);
  };

  return { response, chat };
}

// Component usage
function Chat() {
  const { response, chat } = useOpenRouter();
  const [input, setInput] = useState("");

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => chat(input)}>Send</button>
      <div>{response}</div>
    </div>
  );
}
```

---

## 4. Streaming Responses

```tsx
async function streamChat() {
  const res = await fetch('/api/openrouter/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream' 
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: 'Stream this!' }],
      stream: true
    })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
    // Process SSE events
    console.log(result);
  }
}
```

---

## 5. Error Handling

```ts
try {
  const res = await fetch('/api/openrouter/chat/completions', {/* ... */});
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`OpenRouter error: ${error.code} - ${error.message}`);
  }
  // Handle success
} catch (e) {
  console.error("API call failed:", e);
}
```

---

## 6. Best Practices

- **Client-side SDK:** Use `@openrouter/ai-sdk-provider` for typed responses.
- **Caching:** Cache frequent model lists.

  ```ts
  // Next.js route handler example
  export const revalidate = 3600; // 1 hour
  ```

- **Security:** Never expose API keys in client components.
- **Rate Limiting:** Implement Redis rate limiting in production.
- **Streaming:** Use React's `useEffect` to handle SSE chunks.

---

## 7. Examples

See the `../_examples` directory for:

- curl commands
- TypeScript implementations
- Error handling patterns

---

## 8. Troubleshooting

- **401 Errors:** Verify `OPENROUTER_API_KEY`
- **CORS Issues:** Check `CORS_ALLOW_ORIGINS` matches your domain
- **Streaming Failures:** Ensure `Accept: text/event-stream` header is sent