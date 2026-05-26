# Anthropic Messages API Integration Guide

This guide explains how InteractiveAvatarNextJSDemo integrates Anthropic's Claude API across authentication, core messaging, multimodal support, tooling, error handling, and observability. Pair this document with the recorded fixtures in `mocks/anthropic/` and the automated Vitest suite under `app/api/anthropic/tests/`.

## 1. Authentication & Environment Setup

1. Request access to Anthropic and generate an API key from the [Anthropic Console](https://console.anthropic.com/).
2. Store the key as `ANTHROPIC_API_KEY` in your `.env.local` and deployment secrets. Never hardcode secrets in the repo.
3. Specify the Claude API version and optional beta flags via environment variables:

```bash
ANTHROPIC_API_KEY=sk-live-...
ANTHROPIC_VERSION=2023-06-01
ANTHROPIC_BETA=computer-use-2025
```

4. The backend client attaches mandatory headers for every request:

| Header              | Source                    | Notes                                         |
| ------------------- | ------------------------- | --------------------------------------------- |
| `x-api-key`         | `ANTHROPIC_API_KEY`       | Required for all calls.                       |
| `anthropic-version` | `ANTHROPIC_VERSION`       | Defaults to `2023-06-01` if unset.            |
| `anthropic-beta`    | `ANTHROPIC_BETA`          | Optional, used for tool/computer-use previews.|
| `idempotency-key`   | Request level (optional)  | Pass via API helper when retries are needed.  |

5. Local tooling:
   - Enable verbose HTTP logging with `DEBUG=anthropic`.
   - Use `mocks/browser.ts` with MSW to replay fixtures.
   - Inspect requests using tools like `curl -v` or `mitmproxy` (ensure sanitized logs).

## 2. Backend Client Overview

The reusable client at `app/api/anthropic/client.ts` validates payloads with Zod, merges default headers, enforces timeouts, and supports both synchronous and streaming calls.

```ts
import { AnthropicClient } from "@/app/api/anthropic/client";

const client = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  version: process.env.ANTHROPIC_VERSION,
  beta: process.env.ANTHROPIC_BETA,
  timeoutMs: 45_000,
});

const response = await client.createMessage({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 256,
  messages: [
    { role: "user", content: [{ type: "text", text: "Summarize the roadmap." }] },
  ],
});
```

Streaming responses process Server-Sent Events (SSE) and emit typed chunks:

```ts
await client.streamMessage(requestBody, {
  async onChunk(chunk) {
    if (chunk.type === "content_block_delta") {
      console.log(chunk.delta?.text);
    }
  },
});
```

## 3. Quickstarts

### TypeScript (Node Fetch)

```ts
const res = await fetch("/api/anthropic/messages", {
  method: "POST",
  body: JSON.stringify(requestBody),
  headers: { "content-type": "application/json" },
});
const data = await res.json();
```

### Python (requests)

```python
import os
import requests

url = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": os.environ["ANTHROPIC_API_KEY"],
    "anthropic-version": os.environ.get("ANTHROPIC_VERSION", "2023-06-01"),
}
resp = requests.post(url, headers=headers, json=request_body, timeout=45)
resp.raise_for_status()
print(resp.json())
```

### curl

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: ${ANTHROPIC_VERSION:-2023-06-01}" \
  -H "content-type: application/json" \
  -d @mocks/anthropic/messages-basic-request.json
```

## 4. Core Messages & Streaming Semantics

- Required request fields: `model`, `max_tokens`, and `messages` (see `messageRequestSchema`).
- Responses provide token usage and `stop_reason` metadata (validated via `messageResponseSchema`).
- Streaming events follow the sequence captured in `mocks/anthropic/messages-streaming-chunks.json`:
  1. `message_start`
  2. `content_block_start`
  3. Multiple `content_block_delta`
  4. `message_delta`
  5. `message_stop`
- The Vitest suite asserts round-trip behaviour across synchronous, streaming, tool-use, and error scenarios.

## 5. Tool Use & Function Calling

- Define tools with JSON Schema objects; example request stored in `mocks/anthropic/tool-use-request.json`.
- When Claude decides to call a tool, the response contains a `tool_use` block (see `tool-use-response.json`).
- After executing the tool, send a follow-up message with `role: "tool"` and a `tool_result` content block referencing the `tool_use_id`.
- Validate tool payloads on both frontend (Zod) and backend (Pydantic/JSON Schema) to avoid malformed calls.

## 6. Vision & Multimodal Inputs

- Provide images either by URL or base64 data. The Zod schema enforces that one of `source.data` or `source.url` is present.
- Respect Anthropic's size limits (5MB per image, max 20 images per request at time of writing).
- Mix text and images by interleaving content blocks; the backend client simply forwards the array order.

## 7. Prompt Engineering & Control

- Use the `system` prompt to anchor behaviour (policy docs stored in Notion).
- Track conversation state in the calling service; the Messages API does not persist history automatically.
- For reproducible responses, set `temperature = 0` and omit stochastic controls such as `top_p` and `top_k`.
- For sensitive flows, pre-filter user inputs and redact PII before forwarding to Claude.

## 8. Files & Beta Features

- File/batch APIs are currently gated; coordinate with Anthropic support before enabling.
- To opt into beta features, set `ANTHROPIC_BETA` and document the rollout plan (e.g., `interleaved-thinking-2025-05-14`).
- Monitor beta deprecations monthly; record decisions in the architecture journal.

## 9. Error Handling & Observability

- Distinguish retryable vs fatal errors using the structured `AnthropicAPIError` (status code, type, retryable flag).
- Apply exponential backoff with jitter for `429` and `5xx` responses; respect rate limit headers.
- Capture telemetry:
  - Request/response durations (e.g., via OpenTelemetry spans).
  - Token usage (`response.usage`) to power cost dashboards.
  - `idempotency-key` values for tracing.
- Logging guidelines: redact prompts, store response IDs, and attach `metadata.conversation_id` for correlation.

## 10. Rate Limits & Quotas

- Read rate limit headers: `anthropic-ratelimit-requests-remaining`, `anthropic-ratelimit-tokens-remaining`, and reset timestamps.
- Configure alerts in Grafana when remaining tokens drop below 10% of quota.
- Implement load shedding in the proxy layer by short-circuiting low-priority requests when limits tighten.

## 11. SDK & Client Abstractions

- The repo favours direct HTTPS calls via `fetch`, but you can wrap the official `@anthropic-ai/sdk` when advanced helpers are required.
- Shared adapters should:
  - Accept a normalized `{ model, mode, quality }` shape from the frontend.
  - Forward requests through the backend to centralize secrets.
  - Use the MSW fixtures for contract tests to avoid live API costs.

## 12. Compliance & Governance

- Ensure Claude use adheres to Anthropic's acceptable use policy; escalate questionable prompts to the security team.
- Rotate API keys quarterly and revoke unused credentials immediately.
- Document data retention periods and purge schedules for stored prompts/responses.

## 13. Keeping Documentation Fresh

- Track official changelog updates at `https://docs.anthropic.com/changelog`.
- Re-run the Vitest suite (`pnpm vitest run app/api/anthropic/tests/anthropic-client.test.ts`) after adding new fixtures.
- Update the onboarding checklist when new models or beta headers are adopted.
