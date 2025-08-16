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
    const res = await fetch(`${HEYGEN_BASE}/v1/streaming/voice.list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HEYGEN_API_KEY}`,
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
