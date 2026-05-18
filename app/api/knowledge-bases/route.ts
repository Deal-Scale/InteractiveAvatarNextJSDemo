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

function normalizeContext(item: unknown) {
	const context = item as Record<string, unknown>;
	const id =
		context.context_id ||
		context.contextId ||
		context.id ||
		context.knowledge_base_id ||
		context.knowledgeBaseId;

	return {
		...context,
		id: String(id || ""),
		context_id: String(id || ""),
		name:
			context.name ||
			context.title ||
			context.display_name ||
			context.displayName ||
			String(id || ""),
	};
}

export async function GET() {
	if (!LIVEAVATAR_API_KEY) {
		return missingLiveAvatarKeyResponse();
	}

	try {
		const res = await fetch(`${LIVEAVATAR_BASE}/v1/contexts`, {
			method: "GET",
			headers: liveAvatarHeaders(),
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
								"Failed to fetch LiveAvatar contexts",
							),
					upstream: data,
				},
				{ status: res.status },
			);
		}

		const contexts = normalizeLiveAvatarList(data)
			.map(normalizeContext)
			.filter((context) => context.context_id);

		return NextResponse.json(
			{
				...((data && typeof data === "object" ? data : {}) as Record<
					string,
					unknown
				>),
				data: contexts,
			},
			{ status: 200 },
		);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
