import { NextResponse } from "next/server";

const HEYGEN_BASE =
	process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(req: Request) {
	console.log("[DEBUG] Starting streaming session creation");
	console.log("[DEBUG] HEYGEN_API_KEY present:", !!HEYGEN_API_KEY);

	if (!HEYGEN_API_KEY) {
		console.error("[DEBUG] Missing HEYGEN_API_KEY");
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}

	try {
		const body = await req.json();
		console.log("[DEBUG] Request body:", JSON.stringify(body, null, 2));

		// Try direct API key authentication first (as per Heygen docs)
		console.log("[DEBUG] Attempting direct API key authentication");
		const res = await fetch(`${HEYGEN_BASE}/v1/streaming.new`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": HEYGEN_API_KEY,
			},
			body: JSON.stringify(body ?? {}),
		});

		console.log("[DEBUG] Direct auth response status:", res.status);
		console.log(
			"[DEBUG] Direct auth response headers:",
			Object.fromEntries(res.headers.entries()),
		);

		const data = await res.json();
		console.log(
			"[DEBUG] Direct auth response data:",
			JSON.stringify(data, null, 2),
		);

		if (!res.ok) {
			console.error("[DEBUG] Direct auth failed, trying token-based auth");

			// If direct auth fails, try the token-based approach
			try {
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

				if (tokenResponse.ok) {
					const tokenData = await tokenResponse.json();
					const accessToken = tokenData.data?.token;
					console.log("[DEBUG] Got access token:", !!accessToken);

					if (accessToken) {
						const sessionRes = await fetch(`${HEYGEN_BASE}/v1/streaming.new`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${accessToken}`,
							},
							body: JSON.stringify(body ?? {}),
						});

						console.log(
							"[DEBUG] Token-based session response status:",
							sessionRes.status,
						);
						const sessionData = await sessionRes.json();
						console.log(
							"[DEBUG] Token-based session response:",
							JSON.stringify(sessionData, null, 2),
						);

						if (sessionRes.ok) {
							console.log("[DEBUG] Token-based auth succeeded");
							return NextResponse.json(sessionData, { status: 200 });
						}
					}
				}
			} catch (tokenError) {
				console.error("[DEBUG] Token-based auth also failed:", tokenError);
			}

			return NextResponse.json(
				{ error: data?.message || "Failed to start session" },
				{ status: res.status },
			);
		}

		console.log("[DEBUG] Direct auth succeeded");
		return NextResponse.json(data, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[DEBUG] Exception in streaming/new:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
