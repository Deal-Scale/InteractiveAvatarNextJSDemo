import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ensure uploads directory exists under public/uploads
async function ensureUploadsDir(root: string) {
  try {
    await fs.mkdir(root, { recursive: true });
  } catch {}
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided under 'files'" },
        { status: 400 },
      );
    }

    const uploadsRoot = path.join(process.cwd(), "public", "uploads");
    await ensureUploadsDir(uploadsRoot);

    const results: Array<{
      id: string;
      name: string;
      url: string;
      thumbnailUrl?: string;
      mimeType?: string;
    }> = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const id = randomUUID();
      const name = f.name || `file-${id}`;
      const arrayBuffer = await f.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${id}-${safeName}`;
      const absPath = path.join(uploadsRoot, fileName);
      await fs.writeFile(absPath, uint8);

      results.push({
        id,
        name,
        url: `/uploads/${fileName}`,
        mimeType: f.type || undefined,
      });
    }

    return NextResponse.json({ assets: results }, { status: 200 });
  } catch (err) {
    console.error("[assets/upload] error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
