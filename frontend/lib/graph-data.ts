import fs from "fs";
import path from "path";

export type GraphNode = {
  id: string;
  label: string;
  file_type?: string;
  source_file?: string;
  source_location?: string | null;
  summary?: string;
  community?: number | null;
  norm_label?: string;
};

export type GraphLink = {
  source: string;
  target: string;
  relation?: string;
  confidence?: string;
  confidence_score?: number;
  source_file?: string;
  source_location?: string | null;
  weight?: number;
  _src?: string;
  _tgt?: string;
};

export type GraphSnapshot = {
  nodes: GraphNode[];
  links: GraphLink[];
  hyperedges: Array<{
    id: string;
    label: string;
    nodes: string[];
    relation: string;
    confidence: string;
    confidence_score?: number;
    source_file?: string;
  }>;
  labels: Record<number, string>;
  report: string;
  runSummary: {
    documents: number;
    images_detected: number;
    nodes: number;
    edges: number;
    communities: number;
    model: string;
    token_usage: { input: number; output: number };
  } | null;
};

export type Neighbor = {
  id: string;
  label: string;
  relation: string;
  confidence: string;
  sourceFile: string;
};

export type ImageAsset = {
  path: string;
  url: string;
  label: string;
  mimeType: string;
};

export type MarkdownTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

const ROOT = path.resolve(process.cwd(), "..");
const GRAPH_ROOT = path.join(ROOT, "graphify-out");

let cachedSnapshot: GraphSnapshot | null = null;
const EMPTY_SNAPSHOT: GraphSnapshot = {
  nodes: [],
  links: [],
  hyperedges: [],
  labels: {},
  report: "",
  runSummary: null
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function readText(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  for (const encoding of ["utf-8", "utf-8-sig", "utf16le"]) {
    try {
      return buffer.toString(encoding as BufferEncoding);
    } catch {}
  }
  return buffer.toString("utf-8");
}

export function getProjectRoot() {
  return ROOT;
}

function normalizeRelativePath(relativePath: string) {
  return relativePath.replace(/\\/g, "/").replace(/^\.\/+/, "").trim();
}

export function resolveProjectPath(relativePath: string) {
  if (!relativePath) return null;
  const normalized = normalizeRelativePath(relativePath);
  const absolute = path.resolve(ROOT, normalized);
  const relative = path.relative(ROOT, absolute);

  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return absolute;
}

export function getAssetUrl(relativePath: string) {
  return `/api/asset?path=${encodeURIComponent(normalizeRelativePath(relativePath))}`;
}

export function inferMimeType(relativePath: string) {
  const ext = path.extname(relativePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

export function getGraphSnapshot(): GraphSnapshot {
  if (cachedSnapshot) return cachedSnapshot;

  const graphPath = path.join(GRAPH_ROOT, "graph.json");
  if (!fs.existsSync(graphPath)) {
    cachedSnapshot = { ...EMPTY_SNAPSHOT };
    return cachedSnapshot;
  }

  const graph = readJson<{
    nodes: GraphNode[];
    links: GraphLink[];
    hyperedges?: GraphSnapshot["hyperedges"];
  }>(graphPath);

  const labelsRawPath = path.join(GRAPH_ROOT, ".graphify_labels.json");
  const labelsRaw = fs.existsSync(labelsRawPath) ? readJson<Record<string, string>>(labelsRawPath) : {};
  const labels = Object.fromEntries(
    Object.entries(labelsRaw).map(([key, value]) => [Number(key), value])
  ) as Record<number, string>;

  const reportPath = path.join(GRAPH_ROOT, "GRAPH_REPORT.md");
  const report = fs.existsSync(reportPath) ? readText(reportPath) : "";

  const runSummaryPath = path.join(GRAPH_ROOT, "RUN_SUMMARY.json");
  const runSummary = fs.existsSync(runSummaryPath) ? readJson<GraphSnapshot["runSummary"]>(runSummaryPath) : null;

  cachedSnapshot = {
    nodes: graph.nodes ?? [],
    links: graph.links ?? [],
    hyperedges: graph.hyperedges ?? [],
    labels,
    report,
    runSummary
  };

  return cachedSnapshot;
}

export function getNodeMap() {
  const snapshot = getGraphSnapshot();
  return new Map(snapshot.nodes.map((node) => [node.id, node]));
}

export function getNeighbors(nodeId: string, limit = 12): Neighbor[] {
  const snapshot = getGraphSnapshot();
  const nodeMap = getNodeMap();

  const neighbors = snapshot.links
    .filter((link) => link.source === nodeId || link.target === nodeId)
    .map((link) => {
      const otherId = link.source === nodeId ? link.target : link.source;
      const otherNode = nodeMap.get(otherId);
      return {
        id: otherId,
        label: otherNode?.label ?? otherId,
        relation: link.relation ?? "related_to",
        confidence: link.confidence ?? "EXTRACTED",
        sourceFile: link.source_file ?? otherNode?.source_file ?? ""
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "zh-Hant"))
    .slice(0, limit);

  return neighbors;
}

export function getNodeById(nodeId: string) {
  return getNodeMap().get(nodeId) ?? null;
}

export function getMarkdownContent(relativePath: string) {
  if (!relativePath) return "";
  const absolute = resolveProjectPath(relativePath);
  if (!absolute || !fs.existsSync(absolute)) return "";
  const ext = path.extname(absolute).toLowerCase();
  if (![".md", ".txt"].includes(ext)) return "";
  return readText(absolute).replace(/\n{3,}/g, "\n\n");
}

export function getMarkdownSnippet(relativePath: string, maxChars = 1400) {
  const text = getMarkdownContent(relativePath);
  if (!text) return "";
  return text.slice(0, maxChars);
}

function cleanAssetPath(rawPath: string) {
  return rawPath
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s+["'][^"']*["']$/, "")
    .trim();
}

function isImagePath(relativePath: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(relativePath);
}

export function extractImageAssets(markdown: string, fallbackLabel = ""): ImageAsset[] {
  if (!markdown.trim()) return [];

  const seen = new Set<string>();
  const assets: ImageAsset[] = [];
  const patterns = [
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    /圖片路徑[:：]?\s*`([^`]+)`/g,
    /`([^`\n]+\.(?:png|jpe?g|gif|webp|bmp|svg))`/gi
  ];

  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const rawPath = cleanAssetPath(match[2] ?? match[1] ?? "");
      if (!rawPath || !isImagePath(rawPath)) continue;

      const absolute = resolveProjectPath(rawPath);
      if (!absolute || !fs.existsSync(absolute)) continue;

      const normalized = normalizeRelativePath(rawPath);
      if (seen.has(normalized)) continue;
      seen.add(normalized);

      assets.push({
        path: normalized,
        url: getAssetUrl(normalized),
        label: (match[1] && match[2] ? match[1].trim() : "") || path.basename(normalized) || fallbackLabel || "Image",
        mimeType: inferMimeType(normalized)
      });
    }
  }

  return assets;
}

function splitMarkdownRow(line: string) {
  let trimmed = line.trim();
  if (!trimmed.startsWith("|")) return [];
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  trimmed = trimmed.slice(1);
  return trimmed.split("|").map((cell) => cell.trim());
}

function isSeparatorCell(cell: string) {
  return /^:?-{2,}:?$/.test(cell.replace(/\s+/g, ""));
}

function isTableLine(line: string) {
  return /^\s*\|.*\|\s*$/.test(line);
}

export function extractMarkdownTables(markdown: string): MarkdownTable[] {
  if (!markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const tables: MarkdownTable[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (!isTableLine(lines[index])) continue;

    const block: string[] = [];
    let cursor = index;
    while (cursor < lines.length && isTableLine(lines[cursor])) {
      block.push(lines[cursor]);
      cursor += 1;
    }

    if (block.length >= 2) {
      const headers = splitMarkdownRow(block[0]);
      const separator = splitMarkdownRow(block[1]);

      if (headers.length >= 1 && separator.length === headers.length && separator.every(isSeparatorCell)) {
        const rows = block
          .slice(2)
          .map(splitMarkdownRow)
          .filter((row) => row.length === headers.length && row.some(Boolean));

        const titleLine = [...lines.slice(0, index)]
          .reverse()
          .find((line) => {
            const trimmed = line.trim();
            return Boolean(trimmed) && !isTableLine(trimmed);
          });

        tables.push({
          title: titleLine?.replace(/^#{1,6}\s*/, "").trim() || `表格 ${tables.length + 1}`,
          headers,
          rows
        });
      }
    }

    index = cursor - 1;
  }

  return tables;
}

export function getImageAsset(relativePath: string, label = ""): ImageAsset | null {
  if (!relativePath) return null;
  const normalized = normalizeRelativePath(relativePath);
  if (!isImagePath(normalized)) return null;
  const absolute = resolveProjectPath(normalized);
  if (!absolute || !fs.existsSync(absolute)) return null;

  return {
    path: normalized,
    url: getAssetUrl(normalized),
    label: label || path.basename(normalized),
    mimeType: inferMimeType(normalized)
  };
}
