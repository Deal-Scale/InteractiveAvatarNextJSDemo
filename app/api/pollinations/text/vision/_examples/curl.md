# Pollinations Vision Examples (cURL)

## Vision cURL Examples

## Analyze image by URL

```bash
curl http://localhost:3000/api/pollinations/text/vision \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is in this image?"},
          {"type": "image_url", "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"}}
        ]
      }
    ],
    "max_tokens": 300
  }'
```

## Analyze local image (base64 inline)

```bash
# Encode a local image to base64 first (Linux/macOS):
# base64 -i ./photo.jpg > photo.b64

curl http://localhost:3000/api/pollinations/text/vision \
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
