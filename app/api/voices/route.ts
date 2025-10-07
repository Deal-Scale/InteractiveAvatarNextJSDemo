import { NextResponse } from "next/server";

const HEYGEN_BASE =
	process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET() {
	if (!HEYGEN_API_KEY) {
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}

	try {
		const res = await fetch(`${HEYGEN_BASE}/v2/voices`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": HEYGEN_API_KEY,
			},
			// don't cache so we always see latest
			cache: "no-store",
		});

		const data = await res.json();

		if (!res.ok) {
			return NextResponse.json(
				{ error: data?.message || "Failed to fetch voices" },
				{ status: res.status },
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
