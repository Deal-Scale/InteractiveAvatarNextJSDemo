import { NextResponse } from "next/server"
import { mcpClient } from "@/lib/services/mcpClient"

export const runtime = "nodejs"

export async function POST(
  _req: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    const body = await _req.json().catch(() => ({}))
    const args = (body?.args ?? {}) as Record<string, unknown>
    const result = await mcpClient.callTool(name, args)
    return NextResponse.json(result)
  } catch (error) {
    console.error("/api/mcp/tool/[name] error", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
