# curl examples for OpenRouter proxy

## Chat completions (non-streaming)

```bash
curl -sS -X POST \
  http://localhost:3000/api/openrouter/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/auto",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Chat completions (SSE streaming)

```bash
curl -N -X POST \
  http://localhost:3000/api/openrouter/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "openrouter/auto",
    "messages": [
      {"role": "user", "content": "Stream, please."}
    ],
    "stream": true
  }'
```

## List models

```bash
curl -sS http://localhost:3000/api/openrouter/models
```

## API Keys (list)

```bash
curl -sS -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  http://localhost:3000/api/openrouter/keys
```