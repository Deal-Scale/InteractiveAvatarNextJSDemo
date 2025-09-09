# Pollinations Vision Examples (cURL)

## Function Calling (Tools) cURL Examples

## Define tools and let the model call them

```bash
curl http://localhost:3000/api/pollinations/text/chat-completion \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "What is the weather like in Boston?"}],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_current_weather",
          "description": "Get the current weather in a given location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {"type": "string", "description": "City and state"},
              "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
            },
            "required": ["location"]
          }
        }
      }
    ],
    "tool_choice": "auto"
  }'
```

## Execute tool call and send response

```bash
# After receiving `tool_calls` in the response, execute the function(s) locally and send a second request with a `tool` role message including the `tool_call_id`.

curl http://localhost:3000/api/pollinations/text/chat-completion \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Describe this image"},
          {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,REPLACE_WITH_CONTENTS_OF_photo.b64"}}
        ]
      }
    ]
  }'
```
