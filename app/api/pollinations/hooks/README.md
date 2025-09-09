# Pollinations React Hooks (Examples)

Install:

```bash
npm install @pollinations/react
```

Available hooks (from `@pollinations/react`):

- `usePollinationsImage(prompt, options)`
- `usePollinationsText(prompt, options)`
- `usePollinationsChat(initialMessages, options)`

Docs: https://github.com/pollinations/pollinations/blob/master/pollinations-react/README.md
Playground: https://react-hooks.pollinations.ai/

## usePollinationsImage

Generates an image URL from a prompt.

```tsx
import React from "react";
import { usePollinationsImage } from "@pollinations/react";

export function ImageExample() {
  const url = usePollinationsImage("A cozy cabin in the woods at dusk", {
    width: 768,
    height: 512,
    model: "turbo",
    seed: 42,
    nologo: true,
    enhance: false,
  });

  return (
    <div>
      {url ? (
        <img src={url} alt="Generated" style={{ maxWidth: 400 }} />
      ) : (
        <p>Generating image…</p>
      )}
    </div>
  );
}
```

## usePollinationsText

Generates text from a prompt.

```tsx
import React from "react";
import { usePollinationsText } from "@pollinations/react";

export function TextExample() {
  const text = usePollinationsText("Write a short haiku about Pollinations.AI", {
    seed: 7,
    model: "openai",
    systemPrompt: "You are a poetic AI assistant.",
  });

  return <div>{text ?? "Loading…"}</div>;
}
```

## usePollinationsChat

Manages a conversational flow using the OpenAI-compatible endpoint.

```tsx
import React, { useState } from "react";
import { usePollinationsChat } from "@pollinations/react";

export function ChatExample() {
  const [input, setInput] = useState("");
  const { sendUserMessage, messages } = usePollinationsChat([
    { role: "system", content: "You are a helpful assistant" },
  ], {
    seed: 42,
    jsonMode: false,
    model: "openai",
  });

  const onSend = () => {
    if (!input.trim()) return;
    sendUserMessage({ role: "user", content: input });
    setInput("");
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.role}:</strong> {String(m.content)}
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={onSend}>Send</button>
    </div>
  );
}
```
