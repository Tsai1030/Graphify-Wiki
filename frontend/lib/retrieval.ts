import path from "path";

import {
  extractImageAssets,
  extractMarkdownTables,
  getImageAsset,
  getMarkdownContent,
  getMarkdownSnippet,
  getNeighbors,
  getNodeById,
  getGraphSnapshot,
  type GraphNode
} from "@/lib/graph-data";

export type RetrievedNode = {
  id: string;
  label: string;
  score: number;
  community: number | null;
  communityLabel: string;
  sourceFile: string;
  summary: string;
  neighbors: ReturnType<typeof getNeighbors>;
};

export type RetrievedImage = {
  path: string;
  url: string;
  label: string;
  mimeType: string;
  nodeId: string;
  nodeLabel: string;
};

function tokenize(text: string) {
  const lowered = text.toLowerCase();
  const ascii = lowered.match(/[a-z0-9_]+/g) ?? [];
  const chineseRuns = text.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  const bigrams = chineseRuns.flatMap((run) =>
    run.length <= 2 ? [run] : Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2))
  );
  const single = text.match(/[\u4e00-\u9fff]/g) ?? [];
  return [...ascii, ...chineseRuns, ...bigrams, ...single];
}

function buildSearchText(node: GraphNode) {
  return [node.id, node.label, node.source_file, node.summary, node.norm_label].filter(Boolean).join(" ").toLowerCase();
}

function scoreNode(query: string, queryTokens: string[], node: GraphNode, degree: number) {
  const haystack = buildSearchText(node);
  let score = 0;

  if (node.label?.toLowerCase().includes(query.toLowerCase())) score += 14;
  if (node.source_file?.toLowerCase().includes(query.toLowerCase())) score += 7;
  if (node.summary?.toLowerCase().includes(query.toLowerCase())) score += 5;

  for (const token of queryTokens) {
    if (!token) continue;
    const matches = haystack.split(token).length - 1;
    if (!matches) continue;
    score += Math.min(matches, 3) * (token.length >= 2 ? 3 : 0.8);
  }

  if (queryTokens.some((token) => token.length >= 2 && node.label?.includes(token))) score += 4;
  score += Math.min(degree, 40) * 0.05;
  return score;
}

export function retrieveNodes(question: string, limit = 8): RetrievedNode[] {
  const snapshot = getGraphSnapshot();
  const queryTokens = tokenize(question);

  const ranked = snapshot.nodes
    .map((node) => {
      const degree = snapshot.links.filter((link) => link.source === node.id || link.target === node.id).length;
      const score = scoreNode(question, queryTokens, node, degree);
      return { node, degree, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.degree - a.degree || a.node.label.localeCompare(b.node.label, "zh-Hant"))
    .slice(0, limit);

  return ranked.map(({ node, score }) => ({
    id: node.id,
    label: node.label,
    score,
    community: typeof node.community === "number" ? node.community : null,
    communityLabel:
      typeof node.community === "number"
        ? snapshot.labels[node.community] ?? `Community ${node.community}`
        : "未分類",
    sourceFile: node.source_file ?? "",
    summary: node.summary ?? "",
    neighbors: getNeighbors(node.id, 8)
  }));
}

export function buildChatContext(question: string, retrieved: RetrievedNode[]) {
  const snapshot = getGraphSnapshot();
  const sources = new Set<string>();
  const sections: string[] = [];

  sections.push("## Graph Report Summary");
  sections.push(snapshot.report.slice(0, 2200));

  for (const node of retrieved) {
    sections.push(
      [
        `## Node`,
        `Label: ${node.label}`,
        `ID: ${node.id}`,
        `Community: ${node.communityLabel}`,
        `Source: ${node.sourceFile || "-"}`,
        `Summary: ${node.summary || "-"}`,
        `Connections:`,
        ...node.neighbors.map(
          (neighbor) =>
            `- ${node.label} --${neighbor.relation}/${neighbor.confidence}--> ${neighbor.label}`
        )
      ].join("\n")
    );

    if (node.sourceFile) {
      sources.add(node.sourceFile);
      const snippet = getMarkdownSnippet(node.sourceFile);
      if (snippet) {
        sections.push(`## Source Snippet: ${node.sourceFile}\n${snippet}`);
      }
    }
  }

  return {
    question,
    context: sections.join("\n\n"),
    sourceFiles: Array.from(sources)
  };
}

export function getNodeDetails(nodeId: string) {
  const snapshot = getGraphSnapshot();
  const node = getNodeById(nodeId);
  if (!node) return null;

  const markdown = node.source_file ? getMarkdownContent(node.source_file) : "";
  const imageMap = new Map<string, ReturnType<typeof getImageAsset>>();

  if (markdown) {
    for (const asset of extractImageAssets(markdown, node.label)) {
      imageMap.set(asset.path, asset);
    }
  }

  if (node.source_file) {
    const fileExt = path.extname(node.source_file).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].includes(fileExt)) {
      const asset = getImageAsset(node.source_file, node.label);
      if (asset) {
        imageMap.set(asset.path, asset);
      }
    }
  }

  return {
    ...node,
    communityLabel:
      typeof node.community === "number"
        ? snapshot.labels[node.community] ?? `Community ${node.community}`
        : "未分類",
    neighbors: getNeighbors(nodeId, 16),
    snippet: node.source_file ? getMarkdownSnippet(node.source_file, 1800) : "",
    images: Array.from(imageMap.values()).filter(Boolean).slice(0, 12),
    tables: markdown ? extractMarkdownTables(markdown).slice(0, 6) : []
  };
}

export function getRetrievedImages(retrieved: RetrievedNode[], limit = 4): RetrievedImage[] {
  const seen = new Set<string>();
  const images: RetrievedImage[] = [];

  for (const node of retrieved.slice(0, 4)) {
    const details = getNodeDetails(node.id);
    if (!details?.images?.length) continue;

    for (const image of details.images.filter(
      (item): item is NonNullable<(typeof details.images)[number]> => Boolean(item)
    )) {
      if (seen.has(image.path)) continue;
      seen.add(image.path);
      images.push({
        ...image,
        nodeId: node.id,
        nodeLabel: node.label
      });
      if (images.length >= limit) {
        return images;
      }
    }
  }

  return images;
}
