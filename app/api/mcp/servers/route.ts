import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), ".cursor", "mcp.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    const servers = json?.mcpServers ?? {};
    const list = Object.entries(servers).map(([id, v]: [string, any]) => ({
      id,
      description: v?.description ?? id,
    }));
    return NextResponse.json({ servers: list }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to read MCP servers" },
      { status: 500 },
    );
  }
}
