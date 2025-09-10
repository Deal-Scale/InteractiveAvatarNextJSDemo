import { NextResponse } from "next/server";

// Simple health check for Heygen integration.
// Returns 204 if HEYGEN_API_KEY is present, else 500 JSON error.
export async function GET() {
	const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
	if (!HEYGEN_API_KEY) {
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}
	return new Response(null, { status: 204 });
}
