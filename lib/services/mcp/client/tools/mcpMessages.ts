// MCP Messages utility: call FastAPI backend to retrieve a message timestamp.
// Provides both direct fetch API and event-based trigger for app listeners.

export interface MCPMessageTimestampOptions {
  baseUrl?: string; // override base URL; defaults to NEXT_PUBLIC_API_BASE_URL
  signal?: AbortSignal;
}

export interface MCPMessageTimestampResult {
  messageId: string;
  timestamp: string; // ISO string from backend
}

const MSG_GET_TS_EVENT = "app:messages:getTimestamp";
const MSG_GOT_TS_EVENT = "app:messages:gotTimestamp";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

/**
 * Fetch timestamp for a given messageId from FastAPI.
 * Assumes endpoint: GET {baseUrl}/messages/{messageId}/timestamp returning { timestamp: string }
 */
export async function getMessageTimestamp(
  messageId: string,
  options: MCPMessageTimestampOptions = {},
): Promise<MCPMessageTimestampResult> {
  const base = options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  if (!base) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL or baseUrl override");
  }
  const url = `${base.replace(/\/$/, "")}/messages/${encodeURIComponent(messageId)}/timestamp`;
  const res = await fetch(url, { method: "GET", signal: options.signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch timestamp (${res.status})`);
  }
  const data = (await res.json()) as { timestamp: string };
  const result: MCPMessageTimestampResult = { messageId, timestamp: data.timestamp };
  return result;
}

/**
 * Fire-and-forget event for app-side listeners to perform the fetch and respond via MSG_GOT_TS_EVENT.
 */
export function requestMessageTimestamp(messageId: string): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(MSG_GET_TS_EVENT, { detail: { messageId } }));
}

// Optional global
declare global {
  interface Window {
    mcpMessages?: {
      getTimestamp: (messageId: string, options?: MCPMessageTimestampOptions) => Promise<MCPMessageTimestampResult>;
      requestTimestamp: (messageId: string) => void;
    };
  }
}

if (hasWindow()) {
  try {
    window.mcpMessages = {
      getTimestamp: getMessageTimestamp,
      requestTimestamp: requestMessageTimestamp,
    };
  } catch {}
}
