import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/services/mcpClient"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { name, args } = await req.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing 'name'" }, { status: 400 })
    }
    const result = await mcpClient.getPrompt(name, args ?? {})
    return NextResponse.json(result)
  } catch (error) {
    console.error("/api/mcp/prompt error", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
