import { NextResponse } from "next/server";
import {
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
} from "@/lib/server/liveavatar";

export async function GET(req: Request) {
	if (!LIVEAVATAR_API_KEY) {
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

		return NextResponse.json(data, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
