import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { NextResponse } from "next/server";
import {
	getLiveAvatarAuthErrorMessage,
	getLiveAvatarErrorMessage,
	LIVEAVATAR_API_KEY,
	LIVEAVATAR_BASE,
	liveAvatarHeaders,
	missingLiveAvatarKeyResponse,
	parseLiveAvatarResponse,
	toLiveAvatarEmbedRequest,
} from "@/lib/server/liveavatar";

export async function POST(req: Request) {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const body = (await req.json()) as StartAvatarRequest;
		const payload = toLiveAvatarEmbedRequest(body);

		const res = await fetch(`${LIVEAVATAR_BASE}/v2/embeddings`, {
			method: "POST",
			headers: liveAvatarHeaders(),
			body: JSON.stringify(payload),
			cache: "no-store",
		});
		const data = await parseLiveAvatarResponse(res);

		if (!res.ok) {
			const isAuthError = res.status === 401 || res.status === 403;

			return NextResponse.json(
				{
					error: isAuthError
						? getLiveAvatarAuthErrorMessage(data)
						: getLiveAvatarErrorMessage(
								data,
								"Failed to create LiveAvatar embed",
							),
					upstream: data,
				},
				{ status: res.status },
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
