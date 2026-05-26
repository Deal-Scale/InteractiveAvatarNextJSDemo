import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{
			error:
				"LiveAvatar embed mode does not support the legacy HeyGen streaming.interrupt route. Use LiveAvatar session events with the Web SDK for direct interruption controls.",
		},
		{ status: 501 },
	);
}
