# Pollinations STT cURL Examples

## Basic (base64 WAV)

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

## Notes

- Supported formats commonly `wav`, `mp3`.
- Ensure the base64 matches the format you specify.
    "stream": true
  }'
```
