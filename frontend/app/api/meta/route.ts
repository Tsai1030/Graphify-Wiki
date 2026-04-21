import { NextResponse } from "next/server";

import { getGraphSnapshot } from "@/lib/graph-data";

export async function GET() {
  const snapshot = getGraphSnapshot();

  const communityEntries = Object.entries(
    snapshot.nodes.reduce<Record<string, number>>((acc, node) => {
      const key = String(node.community ?? "unknown");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([community, count]) => ({
      community,
      count,
      label:
        community === "unknown"
          ? "未分類"
          : snapshot.labels[Number(community)] ?? `Community ${community}`
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    summary: snapshot.runSummary,
    communities: communityEntries.slice(0, 16),
    reportExcerpt: snapshot.report.slice(0, 1800)
  });
}
