import fs from "fs";

import { NextRequest, NextResponse } from "next/server";

import { inferMimeType, resolveProjectPath } from "@/lib/graph-data";

const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"]);

export async function GET(request: NextRequest) {
  const relativePath = request.nextUrl.searchParams.get("path")?.trim();
  if (!relativePath) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  const absolutePath = resolveProjectPath(relativePath);
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const extension = absolutePath.slice(absolutePath.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "Unsupported asset type" }, { status: 400 });
  }

  const file = fs.readFileSync(absolutePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": inferMimeType(relativePath),
      "Cache-Control": "public, max-age=3600"
    }
  });
}
