import { NextResponse } from "next/server";
import {
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	normalizeLiveAvatarList,
	parseLiveAvatarResponse,
} from "@/lib/server/liveavatar";

export async function GET() {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const res = await fetch(`${LIVEAVATAR_BASE}/v1/voices`, {
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
						"Failed to fetch LiveAvatar voices",
					),
					upstream: data,
				},
				{ status: res.status },
			);
		}

		return NextResponse.json(
			{
				...((data && typeof data === "object" ? data : {}) as Record<
					string,
					unknown
				>),
				data: normalizeLiveAvatarList(data),
			},
			{ status: 200 },
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
