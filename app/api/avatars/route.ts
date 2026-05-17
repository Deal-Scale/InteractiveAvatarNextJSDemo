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

function normalizeAvatar(item: unknown) {
	const avatar = item as Record<string, unknown>;
	const id =
		avatar.avatar_id ||
		avatar.id ||
		avatar.avatarId ||
		avatar.live_avatar_id ||
		avatar.liveAvatarId;

	return {
		...avatar,
		avatar_id: String(id || ""),
		pose_name:
			avatar.pose_name ||
			avatar.name ||
			avatar.display_name ||
			avatar.title ||
			String(id || ""),
		normal_preview:
			avatar.normal_preview || avatar.preview_url || avatar.thumbnail_url,
		default_voice:
			avatar.default_voice || avatar.voice_id || avatar.default_voice_id,
	};
}

export async function GET() {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const [userRes, publicRes] = await Promise.all([
			fetch(`${LIVEAVATAR_BASE}/v1/avatars`, {
				method: "GET",
				headers: liveAvatarHeaders(),
				cache: "no-store",
			}),
			fetch(`${LIVEAVATAR_BASE}/v1/avatars/public`, {
				method: "GET",
				headers: liveAvatarHeaders(),
				cache: "no-store",
			}),
		]);

		const userData = await parseLiveAvatarResponse(userRes);
		const publicData = await parseLiveAvatarResponse(publicRes);

		if (!userRes.ok && !publicRes.ok) {
			return NextResponse.json(
				{
					error: getLiveAvatarErrorMessage(
						userData,
						"Failed to fetch LiveAvatar avatars",
					),
					upstream: { user: userData, public: publicData },
				},
				{ status: userRes.status },
			);
		}

		const avatars = [
			...(userRes.ok ? normalizeLiveAvatarList(userData) : []),
			...(publicRes.ok ? normalizeLiveAvatarList(publicData) : []),
		]
			.map(normalizeAvatar)
			.filter((avatar) => avatar.avatar_id);
		const seen = new Set<string>();
		const deduped = avatars.filter((avatar) => {
			if (seen.has(avatar.avatar_id)) return false;
			seen.add(avatar.avatar_id);
			return true;
		});

		return NextResponse.json({ data: deduped }, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
