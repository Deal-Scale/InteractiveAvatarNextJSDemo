# Audio Sample Rate Debug Log

Date: 2025-08-15

## Summary
- Browser logs show two AudioContexts being created:
  - 48 kHz context (app)
  - 16 kHz context (SDK)
- `createMediaStreamSource` occurs inside the 16 kHz context, causing a cross-context rate mismatch when nodes from 48 kHz context interact.
- Early patch now forces AudioContext sampleRate globally using localStorage override, defaulting to 16 kHz if unset.

## Key Logs (User Provided)
- `[AudioDebugEarly] injecting sampleRate into AudioContext options 48000` (before change)
- `[AudioDebugEarly] AudioContext created { sampleRate: 48000, state: "suspended" }`
- `[AudioDebugEarly] AudioContext created { sampleRate: 16000, state: "suspended" }`
- `[AudioDebugEarly] createMediaStreamSource: context SR= 16000 ...`
- Error: `Connecting AudioNodes from AudioContexts with different sample-rate is currently not supported.`

## Current Code Instrumentation
- `app/layout.tsx` early inline script:
  - Patches `navigator.mediaDevices.getUserMedia` to strip `sampleRate`/`channelCount` and disable EC/NS/AGC.
  - Wraps `AudioContext`/`webkitAudioContext` constructors to enforce a uniform sampleRate via localStorage override.
  - Logs: context creation SR, `getUserMedia` constraints, track settings, and `createMediaStreamSource` SR.
- `components/AudioDebugShim.tsx` duplicates diagnostics post-hydration for redundancy.

## Forcing Uniform Sample Rate
- The early script reads `localStorage.force_sr`. If absent, it now defaults to `16000`.
- To explicitly set:
  ```js
  localStorage.setItem('force_sr', '16000');
  location.reload();
  ```
- To clear override (rely on default):
  ```js
  localStorage.removeItem('force_sr');
  location.reload();
  ```

## What to Test Next
1. Hard reload with cache disabled.
2. Ensure `localStorage.force_sr` is `"16000"` (or unset, which now defaults to 16000).
3. Start voice chat and capture these lines:
   - `[AudioDebugEarly] AudioContext created ... sampleRate: 16000`
   - `[AudioDebugEarly] createMediaStreamSource: context SR= 16000 ...`
   - Any remaining errors.

## Expected Outcome
- All contexts at 16 kHz. No cross-context mismatch. Voice chat should start without the `createMediaStreamSource` error.

## Contingencies
- If still failing, try forcing `48000` across the board:
  ```js
  localStorage.setItem('force_sr', '48000');
  location.reload();
  ```
- Verify Windows input/output device default formats match (prefer 48 kHz) and OS enhancements disabled.
- Consider updating `@heygen/streaming-avatar` to the latest version.

## Notes
- Track settings may show `sampleRate: undefined`; this is normal in some browsers. Rely on context SR logs.
- EC/NS/AGC are disabled to avoid telephony downsampling to 16 kHz unless explicitly needed.
