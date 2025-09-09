# Pollinations Chat Completion Examples (cURL)

## Basic JSON (non-streaming)

```bash
curl http://localhost:3000/api/pollinations/text/chat-completion \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "seed": 42
  }'
```

## Streaming (SSE)

```bash
curl -N http://localhost:3000/api/pollinations/text/chat-completion \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [
      {"role": "user", "content": "Write a short poem about the sea."}
    ],
    "stream": true
  }'
```
