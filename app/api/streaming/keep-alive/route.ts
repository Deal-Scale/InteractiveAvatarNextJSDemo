import { NextResponse } from "next/server";
import {
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
} from "@/lib/server/liveavatar";

export async function POST(req: Request) {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const body = await req.json().catch(() => ({}));
		const res = await fetch(`${LIVEAVATAR_BASE}/v1/sessions/keep-alive`, {
			method: "POST",
			headers: liveAvatarHeaders(),
			body: JSON.stringify(body ?? {}),
		});
		const data = await parseLiveAvatarResponse(res);

		if (!res.ok) {
			return NextResponse.json(
				{
					error: getLiveAvatarErrorMessage(
						data,
						"Failed to keep LiveAvatar session alive",
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
