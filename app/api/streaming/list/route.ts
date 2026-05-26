import { NextResponse } from "next/server";
import {
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
} from "@/lib/server/liveavatar";

type LiveAvatarSessionEntry = {
	id?: string;
	session_id?: string;
	created_at?: string | number;
	updated_at?: string | number;
	duration?: number;
	source?: string;
	mode?: string;
	is_sandbox?: boolean;
	credits_consumed?: number;
	status?: string;
	avatar_id?: string;
	context_id?: string;
	embed_id?: string;
};

function toUnixSeconds(value: string | number | undefined, fallback: number) {
	if (typeof value === "number") {
		return value > 10_000_000_000 ? Math.floor(value / 1000) : value;
	}
	if (typeof value === "string") {
		const parsed = Date.parse(value);

		if (Number.isFinite(parsed)) return Math.floor(parsed / 1000);
	}
	return fallback;
}

function getResults(data: unknown): LiveAvatarSessionEntry[] {
	if (!data || typeof data !== "object") return [];
	const body = data as {
		data?: { results?: LiveAvatarSessionEntry[] } | LiveAvatarSessionEntry[];
		results?: LiveAvatarSessionEntry[];
	};

	if (Array.isArray(body.data)) return body.data;
	if (Array.isArray(body.data?.results)) return body.data.results;
	if (Array.isArray(body.results)) return body.results;
	return [];
}

function mockLiveAvatarActiveSessions(): LiveAvatarSessionEntry[] {
	const now = Date.now();

	return [
		{
			id: "9cf76a50-4e9a-4db7-a197-d534d57a5a2c",
			created_at: new Date(now - 3 * 60 * 1000).toISOString(),
			updated_at: new Date(now - 15 * 1000).toISOString(),
			duration: 165,
			source: "EMBED",
			mode: "FULL",
			is_sandbox: true,
			credits_consumed: 1,
			status: "connected",
		},
		{
			id: "6a15b3ce-f2ad-45dd-b0f1-f88f2b2ce311",
			created_at: new Date(now - 14 * 60 * 1000).toISOString(),
			updated_at: new Date(now - 45 * 1000).toISOString(),
			duration: 795,
			source: "API",
			mode: "FULL",
			is_sandbox: true,
			credits_consumed: 4,
			status: "active",
		},
		{
			id: "e2f2d5a9-8a12-4fc3-b698-84a14bff9561",
			created_at: new Date(now - 38 * 60 * 1000).toISOString(),
			updated_at: new Date(now - 4 * 60 * 1000).toISOString(),
			duration: 2040,
			source: "DEMO",
			mode: "CUSTOM",
			is_sandbox: true,
			credits_consumed: 8,
			status: "connecting",
		},
	];
}

function normalizeActiveSessions(
	entries: LiveAvatarSessionEntry[],
	source: "liveavatar" | "mock",
) {
	const fallbackNow = Math.floor(Date.now() / 1000);

	return {
		sessions: entries.map((entry, index) => ({
			session_id:
				entry.session_id || entry.id || `mock-liveavatar-${index + 1}`,
			status: entry.status || "active",
			created_at: toUnixSeconds(entry.created_at, fallbackNow),
			updated_at: toUnixSeconds(entry.updated_at, fallbackNow),
			duration: entry.duration,
			source: entry.source,
			mode: entry.mode,
			is_sandbox: entry.is_sandbox,
			credits_consumed: entry.credits_consumed,
			avatar_id: entry.avatar_id,
			context_id: entry.context_id,
			embed_id: entry.embed_id,
		})),
		source,
	};
}

function shouldUseMockSessions(req: Request) {
	const incoming = new URL(req.url);

	return (
		incoming.searchParams.get("mock") === "1" ||
		process.env.LIVEAVATAR_MOCK_SESSIONS === "1" ||
		process.env.NODE_ENV !== "production"
	);
}

export async function GET(req: Request) {
	if (!LIVEAVATAR_API_KEY) {
		if (shouldUseMockSessions(req)) {
			return NextResponse.json(
				normalizeActiveSessions(mockLiveAvatarActiveSessions(), "mock"),
				{ status: 200 },
			);
		}
		return missingLiveAvatarKeyResponse();
	}

	try {
		const incoming = new URL(req.url);
		const url = new URL(`${LIVEAVATAR_BASE}/v1/sessions`);
		url.searchParams.set("type", incoming.searchParams.get("type") || "active");

		for (const key of [
			"page",
			"page_size",
			"avatar_id",
			"embed_id",
			"context_id",
		]) {
			const value = incoming.searchParams.get(key);
			if (value) url.searchParams.set(key, value);
		}

		const res = await fetch(url, {
			method: "GET",
			headers: liveAvatarHeaders(),
			cache: "no-store",
		});
		const data = await parseLiveAvatarResponse(res);

		if (!res.ok) {
			if (shouldUseMockSessions(req)) {
				return NextResponse.json(
					normalizeActiveSessions(mockLiveAvatarActiveSessions(), "mock"),
					{ status: 200 },
				);
			}
			return NextResponse.json(
				{
					error: getLiveAvatarErrorMessage(
						data,
						"Failed to fetch LiveAvatar sessions",
					),
					upstream: data,
				},
				{ status: res.status },
			);
		}

		const entries = getResults(data);
		const response =
			entries.length > 0 || !shouldUseMockSessions(req)
				? normalizeActiveSessions(entries, "liveavatar")
				: normalizeActiveSessions(mockLiveAvatarActiveSessions(), "mock");

		return NextResponse.json(response, { status: 200 });
	} catch (err: unknown) {
		if (shouldUseMockSessions(req)) {
			return NextResponse.json(
				normalizeActiveSessions(mockLiveAvatarActiveSessions(), "mock"),
				{ status: 200 },
			);
		}
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
