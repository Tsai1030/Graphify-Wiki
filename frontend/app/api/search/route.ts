import { NextRequest, NextResponse } from "next/server";

import { retrieveNodes } from "@/lib/retrieval";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 10);

  if (!query) {
    return NextResponse.json({ query, results: [] });
  }

  const results = retrieveNodes(query, limit);
  return NextResponse.json({ query, results });
}
