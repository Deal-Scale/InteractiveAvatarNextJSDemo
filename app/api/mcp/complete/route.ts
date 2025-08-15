import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/services/mcpClient"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ref, argument, context } = body ?? {}

    if (!ref || typeof ref !== "object") {
      return NextResponse.json({ error: "Missing 'ref'" }, { status: 400 })
    }
    if (!argument || typeof argument?.name !== "string" || typeof argument?.value !== "string") {
      return NextResponse.json({ error: "Invalid 'argument'" }, { status: 400 })
    }

    const result = await mcpClient.complete({
      ref,
      argument,
      context: context?.arguments ? { arguments: context.arguments } : undefined,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("/api/mcp/complete error", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
