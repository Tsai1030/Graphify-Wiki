import { NextResponse } from "next/server";

import { getNodeDetails } from "@/lib/retrieval";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const node = getNodeDetails(decodeURIComponent(params.id));

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  return NextResponse.json({ node });
}
