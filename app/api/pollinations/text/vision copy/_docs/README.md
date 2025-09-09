# Pollinations Function Calling (Tools) Proxy

Route: `app/api/pollinations/text/vision copy/route.ts` (proxy)

Recommended API route for function calling: `POST /api/pollinations/text/chat-completion`
(OpenAI-compatible and supports `tools` and `tool_calls`.)

## Features

- Define tools (functions) in the `tools` array
- Models may return `tool_calls` inside `choices[0].message.tool_calls`
- Your app executes the function(s) locally and sends results back as a `tool` message with `tool_call_id`
- Two-step round trip mirrors OpenAI Function Calling

## Request Body (first call)

```json
{
  "model": "openai",
  "messages": [
    {"role": "user", "content": "What is the weather in Tokyo?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"], "default": "celsius"}
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

If `tool_calls` are present in the response, execute them and send a second request including a `tool` role message:

```json
{
  "role": "tool",
  "tool_call_id": "<id from tool_calls>",
  "name": "get_current_weather",
  "content": "{\"location\":\"Tokyo\",\"temperature\":\"15\",\"unit\":\"celsius\"}"
}
```

## Examples

- cURL: `../_examples/curl.md`
- TypeScript: `../_examples/typescript.ts`

## Notes

- Use `chat-completion` route for function calling; this proxy simply forwards to `https://text.pollinations.ai/openai`.
- Add authentication and rate limiting in your proxy as needed.
- If you introduce API keys or referrer-based controls, add them on the server side here before forwarding to Pollinations.
