MCP Client Tools — Quick Usage

These client-side utilities let agents or non-React code control UI via CustomEvents or an optional `window` API. Import from `lib/services/mcp/client/tools/*`.

Tip: Prefer the direct `window.*` API when you need sync return values (e.g., toasts ids). Otherwise, the event API is fine for fire-and-forget.

1) Theme (`mcpTheme.ts`)

```ts
import { setThemeMode, setThemeEmotion, setTheme } from "@/lib/services/mcp/client/tools/mcpTheme";

setThemeMode("dark");
setThemeEmotion("happy");
setTheme({ mode: "system", emotion: "neutral" });

// Or via window
window.mcpTheme?.setMode("light");
```

2) Toasts (`mcpToast.ts`)

```ts
import { toast } from "@/lib/services/mcp/client/tools/mcpToast";

toast.publish({ title: "Saved", variant: "success", duration: 2500 });

// Global for id-based flows
const id = window.mcpToast?.publish?.({ title: "Uploading", variant: "loading", persist: true });
if (id) window.mcpToast?.update(id, { title: "Done", variant: "success", duration: 1500 });
```

3) Sounds (`mcpSound.ts`)

```ts
import { playSound, stopAllSounds } from "@/lib/services/mcp/client/tools/mcpSound";

playSound({ name: "success", volume: 0.8 });
playSound({ url: "https://example.com/ping.mp3" });
stopAllSounds();

// Or window.mcpSound?.play({ name: "error" })
```

4) Modal (`mcpModal.ts`)

```ts
import { openModal, closeModal } from "@/lib/services/mcp/client/tools/mcpModal";

openModal({ id: "confirm1", title: "Confirm", content: "Proceed?", size: "md" });
closeModal("confirm1");
```

5) Animations (`mcpAnimations.ts`)

```ts
import { triggerAnimation, stopAnimation } from "@/lib/services/mcp/client/tools/mcpAnimations";

triggerAnimation({ name: "pulse", target: "sidebar", intensity: 0.6 });
stopAnimation("pulse", "sidebar");
```

6) Audio Input (`mcpAudio.ts`)

```ts
import { requestMic, releaseMic } from "@/lib/services/mcp/client/tools/mcpAudio";

requestMic({ constraints: { noiseSuppression: true } });
releaseMic();
```

7) Webcam Input (`mcpWebcam.ts`)

```ts
import { requestWebcam, releaseWebcam } from "@/lib/services/mcp/client/tools/mcpWebcam";

requestWebcam({ constraints: { width: 1280, height: 720 } });
releaseWebcam();
```

8) Messages — FastAPI Timestamp (`mcpMessages.ts`)

```ts
import { getMessageTimestamp, requestMessageTimestamp } from "@/lib/services/mcp/client/tools/mcpMessages";

// Direct fetch (returns promise)
const res = await getMessageTimestamp("message-123");
console.log(res.timestamp);

// Event-based (app listener will emit a corresponding event back)
requestMessageTimestamp("message-123");
```

Backend endpoint assumed: `GET {BASE}/messages/{messageId}/timestamp -> { timestamp: string }`

Base URL is read from `process.env.NEXT_PUBLIC_API_BASE_URL`. You can override per call via `{ baseUrl }`.
