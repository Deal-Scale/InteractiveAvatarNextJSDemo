import { NextResponse } from "next/server";
import {
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
} from "@/lib/server/liveavatar";

export async function GET() {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const res = await fetch(`${LIVEAVATAR_BASE}/v1/users/credits`, {
			method: "GET",
			headers: liveAvatarHeaders(),
			cache: "no-store",
		});
		const data = await parseLiveAvatarResponse(res);

		if (!res.ok) {
			return NextResponse.json(
				{
					error: `LiveAvatar health failed: ${res.status}`,
					upstream: data,
				},
				{ status: 502 },
			);
		}

		return NextResponse.json(
			{ provider: "liveavatar", status: "healthy", upstream: data },
			{ status: 200 },
		);
	} catch (e) {
		return NextResponse.json({ error: (e as Error).message }, { status: 502 });
	}
}
