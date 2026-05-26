import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { NextResponse } from "next/server";
import {
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
	toLiveAvatarSessionRequest,
} from "@/lib/server/liveavatar";

/**
 * POST /api/get-access-token
 *
 * Creates and returns a LiveAvatar session token.
 * The legacy HeyGen `/v1/streaming.create_token` endpoint is sunset.
 */
export async function POST(req: Request) {
	console.log("[DEBUG] get-access-token: Starting LiveAvatar token creation");
	console.log("[DEBUG] LIVEAVATAR_API_KEY present:", !!LIVEAVATAR_API_KEY);

	if (!LIVEAVATAR_API_KEY) {
		console.error("[DEBUG] Missing LIVEAVATAR_API_KEY environment variable");
		return missingLiveAvatarKeyResponse();
	}

	try {
		const body = (await req
			.json()
			.catch(() => null)) as StartAvatarRequest | null;
		const payload = body ? toLiveAvatarSessionRequest(body) : undefined;

		const tokenResponse = await fetch(`${LIVEAVATAR_BASE}/v1/sessions/token`, {
			method: "POST",
			headers: liveAvatarHeaders(),
			body: payload ? JSON.stringify(payload) : undefined,
			cache: "no-store",
		});

		console.log("[DEBUG] Token request status:", tokenResponse.status);
		const tokenData = await parseLiveAvatarResponse(tokenResponse);

		if (!tokenResponse.ok) {
			console.error("[DEBUG] LiveAvatar token creation failed:", tokenData);
			return NextResponse.json(
				{
					error: getLiveAvatarErrorMessage(
						tokenData,
						"Failed to create LiveAvatar session token",
					),
					upstream: tokenData,
				},
				{ status: tokenResponse.status },
			);
		}

		const accessToken =
			typeof tokenData === "object" && tokenData
				? (tokenData as { data?: { session_token?: string; token?: string } })
						.data?.session_token ||
					(tokenData as { data?: { session_token?: string; token?: string } })
						.data?.token
				: undefined;

		console.log("[DEBUG] LiveAvatar session token created:", !!accessToken);

		if (!accessToken) {
			console.error("[DEBUG] No token in response:", tokenData);
			return NextResponse.json(
				{ error: "No session_token returned from LiveAvatar API" },
				{ status: 500 },
			);
		}

		return new NextResponse(accessToken, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[DEBUG] Exception in get-access-token:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
