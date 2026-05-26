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

export async function POST(req: Request) {
	console.log("[DEBUG] Starting LiveAvatar session token creation");
	console.log("[DEBUG] LIVEAVATAR_API_KEY present:", !!LIVEAVATAR_API_KEY);

	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const body = (await req.json()) as StartAvatarRequest;
		const payload = toLiveAvatarSessionRequest(body);
		const tokenRes = await fetch(`${LIVEAVATAR_BASE}/v1/sessions/token`, {
			method: "POST",
			headers: liveAvatarHeaders(),
			body: JSON.stringify(payload),
			cache: "no-store",
		});
		const tokenData = await parseLiveAvatarResponse(tokenRes);

		if (!tokenRes.ok) {
			return NextResponse.json(
				{
					error: getLiveAvatarErrorMessage(
						tokenData,
						"Failed to create LiveAvatar session token",
					),
					upstream: tokenData,
				},
				{ status: tokenRes.status },
			);
		}

		return NextResponse.json(tokenData, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[DEBUG] Exception in streaming/new:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
