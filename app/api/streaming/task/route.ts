import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{
			error:
				"LiveAvatar embed mode does not support the legacy HeyGen streaming.task route. Use the embedded LiveAvatar UI, or migrate this action to LiveAvatar Web SDK session events.",
		},
		{ status: 501 },
	);
}
