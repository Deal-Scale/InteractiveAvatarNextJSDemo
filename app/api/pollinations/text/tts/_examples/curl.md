

## TTS cURL Examples

### Basic (save to file)

```bash
curl -o hello_audio.mp3 "http://localhost:3000/api/pollinations/text/tts?prompt=Hello%20world&voice=nova"
```

### Different voice

```bash
curl -o welcome_audio.mp3 "http://localhost:3000/api/pollinations/text/tts?prompt=Welcome%20to%20Pollinations&voice=fable"
```

### Notes

- The endpoint responds with `audio/mpeg` on success.
- Ensure `prompt` is URL-encoded. For long text, consider chunking.
- `voice` defaults to `alloy` if omitted.
