import { NextResponse } from "next/server";

const HEYGEN_BASE =
	process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * POST /api/get-access-token
 *
 * Creates and returns a HeyGen streaming access token.
 * This token is used by the frontend SDK to initialize the streaming avatar.
 */
export async function POST() {
	console.log("[DEBUG] get-access-token: Starting token creation");
	console.log("[DEBUG] HEYGEN_API_KEY present:", !!HEYGEN_API_KEY);

	if (!HEYGEN_API_KEY) {
		console.error("[DEBUG] Missing HEYGEN_API_KEY environment variable");
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}

	try {
		// Call HeyGen API to create a streaming token
		const tokenResponse = await fetch(
			`${HEYGEN_BASE}/v1/streaming.create_token`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": HEYGEN_API_KEY,
				},
			},
		);

		console.log("[DEBUG] Token request status:", tokenResponse.status);

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.json().catch(() => ({}));
			console.error("[DEBUG] Token creation failed:", errorData);
			return NextResponse.json(
				{ error: errorData?.message || "Failed to create access token" },
				{ status: tokenResponse.status },
			);
		}

		const tokenData = await tokenResponse.json();
		const accessToken = tokenData.data?.token;

		console.log("[DEBUG] Access token created:", !!accessToken);

		if (!accessToken) {
			console.error("[DEBUG] No token in response:", tokenData);
			return NextResponse.json(
				{ error: "No token returned from HeyGen API" },
				{ status: 500 },
			);
		}

		// Return the token as plain text (as expected by the frontend)
		return new NextResponse(accessToken, {
			status: 200,
			headers: {
				"Content-Type": "text/plain",
			},
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[DEBUG] Exception in get-access-token:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
