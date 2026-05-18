import { NextResponse } from "next/server";
import {
	getLiveAvatarAuthErrorMessage,
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
		const [userRes, publicRes] = await Promise.all([
			fetch(`${LIVEAVATAR_BASE}/v1/voices`, {
				method: "GET",
				headers: liveAvatarHeaders(),
				cache: "no-store",
			}),
			fetch(`${LIVEAVATAR_BASE}/v1/voices/public`, {
				method: "GET",
				cache: "no-store",
			}),
		]);
		const userData = await parseLiveAvatarResponse(userRes);
		const publicData = await parseLiveAvatarResponse(publicRes);

		if (!userRes.ok && !publicRes.ok) {
			const isAuthError =
				userRes.status === 401 ||
				userRes.status === 403 ||
				publicRes.status === 401 ||
				publicRes.status === 403;

			return NextResponse.json(
				{
					error: isAuthError
						? getLiveAvatarAuthErrorMessage(userData)
						: getLiveAvatarErrorMessage(
								userData,
								"Failed to fetch LiveAvatar voices",
							),
					upstream: { user: userData, public: publicData },
				},
				{ status: userRes.status },
			);
		}

		return NextResponse.json(
			{
				data: [
					...(userRes.ok ? normalizeLiveAvatarList(userData) : []),
					...(publicRes.ok ? normalizeLiveAvatarList(publicData) : []),
				],
			},
			{ status: 200 },
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
