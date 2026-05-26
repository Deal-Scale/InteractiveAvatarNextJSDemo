import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY =
	process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

export async function GET() {
	if (!ELEVENLABS_API_KEY) {
		return NextResponse.json(
			{ error: "Missing ELEVENLABS_API_KEY" },
			{ status: 500 },
		);
	}

	return new Response(null, { status: 204 });
}
