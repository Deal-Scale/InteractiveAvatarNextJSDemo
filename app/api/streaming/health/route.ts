import { NextResponse } from "next/server";

const HEYGEN_BASE =
	process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

// Strong health check for Heygen:
// 1) Require HEYGEN_API_KEY
// 2) Perform an authenticated request to /v1/streaming.list
export async function GET() {
	const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
	if (!HEYGEN_API_KEY) {
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}

	try {
		const res = await fetch(`${HEYGEN_BASE}/v1/streaming.list`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${HEYGEN_API_KEY}`,
			},
			cache: "no-store",
		});

		if (res.ok) {
			return new Response(null, { status: 204 });
		}

		const text = await res.text().catch(() => "");
		return NextResponse.json(
			{
				error: `Heygen health failed: ${res.status}`,
				body: text.slice(0, 300),
			},
			{ status: 502 },
		);
	} catch (e) {
		return NextResponse.json({ error: (e as Error).message }, { status: 502 });
	}
}
