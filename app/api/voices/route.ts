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

const ELEVENLABS_API_KEY =
	process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

const normalizeElevenLabsVoices = (data: unknown) => {
	const list = Array.isArray((data as { voices?: unknown })?.voices)
		? (data as { voices: unknown[] }).voices
		: [];

	return list.map((voice) => {
		const record = voice as Record<string, unknown>;
		return {
			id: record.voice_id ?? record.id,
			voiceId: record.voice_id ?? record.id,
			name: record.name,
			preview_url: record.preview_url,
		};
	});
};

export async function GET(req: Request) {
	const provider =
		new URL(req.url).searchParams.get("provider") ?? "liveavatar";

	if (provider === "elevenlabs") {
		try {
			const res = await fetch("https://api.elevenlabs.io/v1/voices", {
				method: "GET",
				headers: ELEVENLABS_API_KEY
					? { "xi-api-key": ELEVENLABS_API_KEY }
					: undefined,
				cache: "no-store",
			});
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				return NextResponse.json(
					{
						data: [],
						warning: "Failed to fetch ElevenLabs voices",
						upstream: data,
					},
					{ status: 200 },
				);
			}

			return NextResponse.json(
				{ data: normalizeElevenLabsVoices(data) },
				{ status: 200 },
			);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unknown error";
			return NextResponse.json({ data: [], warning: message }, { status: 200 });
		}
	}

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
