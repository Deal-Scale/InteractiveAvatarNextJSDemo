import { NextResponse } from "next/server";

const HEYGEN_BASE =
	process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET(req: Request) {
	if (!HEYGEN_API_KEY) {
		return NextResponse.json(
			{ error: "Missing HEYGEN_API_KEY" },
			{ status: 500 },
		);
	}

	try {
		const { searchParams } = new URL(req.url);
		const page = searchParams.get("page");
		const page_size = searchParams.get("page_size");
		const date_from = searchParams.get("date_from");
		const date_to = searchParams.get("date_to");
		const status = searchParams.get("status");
		const token = searchParams.get("token");

		const url = new URL(`${HEYGEN_BASE}/v2/streaming.list`);
		if (page) url.searchParams.set("page", page);
		if (page_size) url.searchParams.set("page_size", page_size);
		if (date_from) url.searchParams.set("date_from", date_from);
		if (date_to) url.searchParams.set("date_to", date_to);
		if (status) url.searchParams.set("status", status);
		if (token) url.searchParams.set("token", token);

		const res = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${HEYGEN_API_KEY}`,
			},
			cache: "no-store",
		});

		const data = await res.json();
		if (!res.ok) {
			return NextResponse.json(
				{ error: data?.message || "Failed to fetch session history" },
				{ status: res.status },
			);
		}
		return NextResponse.json(data, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
