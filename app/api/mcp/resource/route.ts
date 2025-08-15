import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/services/mcpClient"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { uri } = await req.json()
    if (!uri || typeof uri !== "string") {
      return NextResponse.json({ error: "Missing 'uri'" }, { status: 400 })
    }
    const result = await mcpClient.readResource(uri)
    return NextResponse.json(result)
  } catch (error) {
    console.error("/api/mcp/resource error", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
