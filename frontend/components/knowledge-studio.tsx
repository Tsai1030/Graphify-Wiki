"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Compass,
  FileSearch,
  Layers3,
  LoaderCircle,
  MessageSquare,
  Network,
  Orbit,
  PanelRightOpen,
  Search,
  SendHorizonal,
  Sparkles,
  Waypoints
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────── */

type KnowledgeStudioMode = "landing" | "home";

type Neighbor = {
  id: string;
  label: string;
  relation: string;
  confidence: string;
  sourceFile: string;
};

type RetrievedNode = {
  id: string;
  label: string;
  score: number;
  community: number | null;
  communityLabel: string;
  sourceFile: string;
  summary: string;
  neighbors: Neighbor[];
};

type ChatImage = {
  path: string;
  url: string;
  label: string;
  mimeType: string;
  nodeId: string;
  nodeLabel: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  retrieved?: RetrievedNode[];
  sourceFiles?: string[];
  images?: ChatImage[];
};

type MetaPayload = {
  summary: {
    documents: number;
    images_detected: number;
    nodes: number;
    edges: number;
    communities: number;
    model: string;
    token_usage: { input: number; output: number };
  } | null;
  communities: Array<{ community: string; count: number; label: string }>;
  reportExcerpt: string;
  hasGraphData: boolean;
};

type ImageAsset = {
  path: string;
  url: string;
  label: string;
  mimeType: string;
};

type MarkdownTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

type NodePayload = {
  node: {
    id: string;
    label: string;
    source_file?: string;
    summary?: string;
    communityLabel: string;
    snippet: string;
    images: ImageAsset[];
    tables: MarkdownTable[];
    neighbors: Neighbor[];
  };
};

type SceneMode = "atelier" | "index" | "nocturne";
type DensityMode = "airy" | "tight";

/* ─── Static data ────────────────────────────────────────────── */

const starterQuestions = [
  "Map the biggest community and tell me which source files anchor it.",
  "Show me the strongest relationships around the currently selected node.",
  "What evidence is missing if I ask this graph about process risk?",
  "Summarize the graph report and tell me where to inspect next."
];

const storyModes: Array<{ id: SceneMode; name: string; eyebrow: string; note: string }> = [
  {
    id: "atelier",
    name: "Atelier",
    eyebrow: "Paper desk",
    note: "Warm editorial surfaces — stacked notes, studio rhythm, cream and ink."
  },
  {
    id: "index",
    name: "Index",
    eyebrow: "Archive wall",
    note: "Cool catalog framing — precise grid, neutral spacing, archival clarity."
  },
  {
    id: "nocturne",
    name: "Nocturne",
    eyebrow: "Command center",
    note: "Deep navy canvas — illuminated evidence, tactical stage, night-shift focus."
  }
];

const workingPrinciples = [
  {
    id: "01",
    title: "Ask with ambiguity",
    description:
      "The canvas accepts fuzzy language first, then narrows the graph with explicit evidence as you follow retrieved nodes."
  },
  {
    id: "02",
    title: "Trace the claim",
    description:
      "Every answer pulls you into connected nodes, source files, images, and tabular fragments without breaking your reading flow."
  },
  {
    id: "03",
    title: "Switch the lens",
    description:
      "Three scene modes let the same workspace feel editorial, archival, or nocturnal — same graph, different cognitive mode."
  }
];

const densityOptions: Array<{ value: DensityMode; label: string }> = [
  { value: "airy", label: "Airy" },
  { value: "tight", label: "Tight" }
];

/* ─── Small components ───────────────────────────────────────── */

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pill">
      <span className="eyebrow">{label}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function SectionLead({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="section-display mt-5 font-[var(--font-display)] font-semibold text-foreground">{title}</h2>
      <p className="mt-6 max-w-2xl text-[17px] leading-[1.8] text-foreground/70">{body}</p>
    </div>
  );
}

/* ─── Landing preview mockup ──────────────────────────────────── */

function LandingPreview({ meta, scene }: { meta: MetaPayload | null; scene: SceneMode }) {
  const label = scene === "atelier" ? "Atelier Preview" : scene === "index" ? "Index Preview" : "Nocturne Preview";
  return (
    <div className="stack-card reveal" style={{ animationDelay: "0.1s" }}>
      <div className="browser-chrome">
        <div className="browser-bar">
          <div className="flex gap-2">
            <div className="browser-dot" />
            <div className="browser-dot" />
            <div className="browser-dot" />
          </div>
          <div className="surface-field min-w-0 flex-1 truncate rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
        </div>

        <div className="relative overflow-hidden p-4 sm:p-5">
          <div className="grid-texture absolute inset-0 opacity-60" />
          <div className="relative grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)]">
            {/* Left rail preview */}
            <div className="panel-note rounded-[20px] p-4">
              <div className="eyebrow mb-4">Atlas Rail</div>
              <div className="space-y-2">
                <MetricPill label="Documents" value={String(meta?.summary?.documents ?? 0)} />
                <MetricPill label="Nodes" value={String(meta?.summary?.nodes ?? 0)} />
                <MetricPill label="Images" value={String(meta?.summary?.images_detected ?? 0)} />
              </div>
              <div className="surface-muted mt-4 rounded-[16px] p-3">
                <div className="eyebrow mb-3">Communities</div>
                <div className="space-y-2">
                  {(meta?.communities.slice(0, 3) ?? []).map((c) => (
                    <div key={c.community} className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-foreground">{c.label}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">{c.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center stage preview */}
            <div className="space-y-3">
              <div className="panel-ink rounded-[24px] p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/50">Conversation</div>
                    <div className="text-lg font-semibold tracking-tight text-white">Ask broadly, inspect precisely.</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{meta?.summary?.model ?? "gpt-4o-mini"}</Badge>
                </div>
                <div className="mt-4 ml-auto max-w-[80%] rounded-[20px] bg-background/90 px-4 py-3 text-xs leading-6 text-foreground">
                  Which source files anchor the densest community?
                </div>
                <div className="mt-3 max-w-[88%] rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3">
                  <p className="text-xs leading-6 text-white/72">
                    The assistant stays compact while evidence remains one click away.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {["Focus", "Search", "Report"].map((label) => (
                  <div key={label} className="panel-note rounded-[16px] p-3">
                    <div className="eyebrow mb-2">{label}</div>
                    <div className="text-xs font-medium text-foreground/80">{
                      label === "Focus" ? "Selected node" : label === "Search" ? "Label retrieval" : "Run excerpt"
                    }</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Chat message ────────────────────────────────────────────── */

function TranscriptMessage({
  message,
  onInspect
}: {
  message: ChatMessage;
  onInspect: (nodeId: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[88%] rounded-[24px] bg-background/[0.90] px-5 py-4 text-sm leading-7 text-foreground shadow-[0_14px_36px_oklch(0.08_0.02_258/0.14)]">
        {message.content}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] rounded-[26px] border border-white/[0.10] bg-white/[0.06] px-5 py-5 shadow-[0_16px_44px_oklch(0.04_0.014_258/0.20)]">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          <Bot />
          Atlas
        </Badge>
        {message.retrieved?.length ? <Badge variant="outline">{message.retrieved.length} nodes</Badge> : null}
        {message.sourceFiles?.length ? <Badge variant="outline">{message.sourceFiles.length} files</Badge> : null}
      </div>

      <div className="whitespace-pre-wrap break-words text-sm leading-7 text-white/82">
        {message.content}
      </div>

      {message.images?.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {message.images.slice(0, 4).map((img) => (
            <button
              key={img.path}
              type="button"
              onClick={() => onInspect(img.nodeId)}
              className="overflow-hidden rounded-[18px] border border-white/12 bg-background/90 text-left text-foreground transition hover:-translate-y-0.5 hover:border-white/22"
            >
              <div className="aspect-[4/3] bg-muted">
                <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
              </div>
              <div className="px-4 py-3">
                <div className="line-clamp-2 text-sm font-medium">{img.label}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{img.nodeLabel}</div>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {message.retrieved?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {message.retrieved.slice(0, 5).map((node) => (
            <Button
              key={`${message.content}-${node.id}`}
              variant="outline"
              size="sm"
              onClick={() => onInspect(node.id)}
              className="rounded-full border-white/16 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
            >
              <Network data-icon="inline-start" />
              <span className="max-w-[200px] truncate">{node.label}</span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ─── Node notebook ───────────────────────────────────────────── */

function NodeNotebook({
  node,
  loading,
  error,
  onInspect
}: {
  node: NodePayload["node"] | null;
  loading: boolean;
  error: string;
  onInspect: (nodeId: string) => void;
}) {
  if (error) {
    return (
      <div className="panel-paper rounded-[22px] p-5 text-sm leading-7 text-foreground">
        <div className="mb-2 flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4" />
          Node inspection failed
        </div>
        <div className="text-foreground/65">{error}</div>
      </div>
    );
  }

  if (loading && !node) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 rounded-[16px]" />
        <Skeleton className="h-36 rounded-[22px]" />
        <Skeleton className="h-28 rounded-[22px]" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="panel-paper rounded-[22px] p-6 text-sm leading-7 text-muted-foreground">
        Select a node from chat, search, or the evidence list to open a richer notebook view.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Node header */}
      <div className="panel-paper rounded-[24px] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow mb-3">Selected Node</div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">{node.label}</h3>
          </div>
          <Badge variant={loading ? "secondary" : "outline"}>{loading ? "Syncing" : "Live"}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{node.communityLabel}</Badge>
          <Badge variant="outline">{node.images.length} images</Badge>
          <Badge variant="outline">{node.tables.length} tables</Badge>
          <Badge variant="outline">{node.neighbors.length} links</Badge>
        </div>
        {node.summary ? (
          <p className="mt-4 text-sm leading-7 text-foreground/70">{node.summary}</p>
        ) : null}
        {node.source_file ? (
          <div className="surface-field mt-4 rounded-[14px] px-4 py-3 font-[var(--font-mono)] text-[11px] leading-6 text-muted-foreground break-all">
            {node.source_file}
          </div>
        ) : null}
      </div>

      {/* Images */}
      {node.images.length ? (
        <div className="panel-paper rounded-[24px] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="eyebrow">Image Evidence</div>
            <Badge variant="outline">{node.images.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {node.images.slice(0, 4).map((img) => (
              <a
                key={img.path}
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className="surface-muted surface-muted-hover overflow-hidden rounded-[18px]"
              >
                <div className="aspect-[4/3] bg-muted">
                  <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                </div>
                <div className="border-t border-foreground/8 px-4 py-3">
                  <div className="line-clamp-2 text-sm font-medium text-foreground">{img.label}</div>
                  <div className="mt-1 font-[var(--font-mono)] text-[11px] text-muted-foreground break-all">{img.path}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* Tables */}
      {node.tables.length ? (
        <div className="panel-paper rounded-[24px] p-5">
          <div className="eyebrow mb-4">Tabular Fragments</div>
          <div className="space-y-4">
            {node.tables.slice(0, 2).map((table) => (
              <div key={`${node.id}-${table.title}`} className="surface-muted overflow-hidden rounded-[16px]">
                <div className="border-b border-foreground/8 px-4 py-3 text-sm font-medium text-foreground">{table.title}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-secondary/60">
                      <tr>
                        {table.headers.map((h) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2 font-medium text-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={`${table.title}-${ri}`} className="border-t border-foreground/8">
                          {row.map((cell, ci) => (
                            <td key={`${table.title}-${ri}-${ci}`} className="max-w-[300px] px-3 py-2 align-top text-foreground/70">
                              {cell || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Snippet */}
      {node.snippet ? (
        <div className="panel-paper rounded-[24px] p-5">
          <div className="eyebrow mb-4">Source Snippet</div>
          <div className="code-surface rounded-[18px] px-4 py-4 font-[var(--font-mono)] text-xs leading-6">
            <div className="max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words pr-2">{node.snippet}</div>
          </div>
        </div>
      ) : null}

      {/* Neighbors */}
      {node.neighbors.length ? (
        <div className="panel-paper rounded-[24px] p-5">
          <div className="eyebrow mb-4">Connected Evidence</div>
          <div className="space-y-2">
            {node.neighbors.slice(0, 10).map((neighbor, idx) => (
              <button
                key={`${node.id}-${neighbor.id}`}
                type="button"
                onClick={() => onInspect(neighbor.id)}
                className={cn(
                  "timeline-item surface-muted surface-muted-hover relative w-full rounded-[16px] px-4 py-3 text-left",
                  idx === Math.min(node.neighbors.length, 10) - 1 ? "last-item" : ""
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{neighbor.label}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {neighbor.relation} / {neighbor.confidence}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Inspector workbench ─────────────────────────────────────── */

function InspectorWorkbench({
  meta, latestAssistant, searchText, setSearchText, searchPending,
  searchResults, searchError, selectedNode, nodePending, nodeError,
  onInspect, tab, setTab
}: {
  meta: MetaPayload | null;
  latestAssistant: ChatMessage | undefined;
  searchText: string;
  setSearchText: (v: string) => void;
  searchPending: boolean;
  searchResults: RetrievedNode[];
  searchError: string;
  selectedNode: NodePayload["node"] | null;
  nodePending: boolean;
  nodeError: string;
  onInspect: (nodeId: string) => void;
  tab: string;
  setTab: (v: string) => void;
}) {
  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col">
      {/* Inspector header */}
      <div className="border-b border-foreground/8 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow mb-2">Evidence Notebook</div>
            <div className="text-2xl font-semibold tracking-tight text-foreground">Inspector</div>
          </div>
          <Badge variant="outline">Live</Badge>
        </div>
        <TabsList variant="line" className="mt-5 grid w-full grid-cols-3 border-b border-foreground/8 px-0">
          <TabsTrigger value="focus">
            <Network data-icon="inline-start" />
            Focus
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search data-icon="inline-start" />
            Search
          </TabsTrigger>
          <TabsTrigger value="report">
            <FileSearch data-icon="inline-start" />
            Report
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Focus tab */}
      <TabsContent value="focus" className="min-h-0 flex-1 px-5 py-5">
        <ScrollArea className="h-full">
          <NodeNotebook node={selectedNode} loading={nodePending} error={nodeError} onInspect={onInspect} />
        </ScrollArea>
      </TabsContent>

      {/* Search tab */}
      <TabsContent value="search" className="min-h-0 flex-1 px-5 py-5">
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="panel-paper rounded-[22px] p-4">
            <div className="eyebrow mb-3">Graph Search</div>
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search labels, files, and summaries"
              className="surface-field rounded-[14px]"
            />
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 pr-1">
              {searchPending ? (
                <>
                  <Skeleton className="h-24 rounded-[22px]" />
                  <Skeleton className="h-24 rounded-[22px]" />
                </>
              ) : null}
              {searchError ? (
                <div className="panel-paper rounded-[22px] p-5 text-sm leading-7 text-foreground">{searchError}</div>
              ) : null}
              {!searchPending && !searchError && !searchResults.length ? (
                <div className="panel-paper rounded-[22px] p-5 text-sm leading-7 text-muted-foreground">
                  Start typing to search your graph.
                </div>
              ) : null}
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onInspect(result.id)}
                  className="panel-paper block w-full rounded-[22px] p-5 text-left transition hover:-translate-y-0.5 hover:border-foreground/18"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{result.label}</div>
                      <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{result.communityLabel}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0">{result.score.toFixed(1)}</Badge>
                  </div>
                  {result.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-foreground/68">{result.summary}</p>
                  ) : null}
                  {result.sourceFile ? (
                    <div className="mt-3 font-[var(--font-mono)] text-[11px] text-muted-foreground break-all">{result.sourceFile}</div>
                  ) : null}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Report tab */}
      <TabsContent value="report" className="min-h-0 flex-1 px-5 py-5">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <div className="panel-paper rounded-[24px] p-5">
              <div className="eyebrow mb-4">Run Summary</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <MetricPill label="Communities" value={String(meta?.summary?.communities ?? 0)} />
                <MetricPill label="Edges" value={String(meta?.summary?.edges ?? 0)} />
                <MetricPill label="In Tokens" value={String(meta?.summary?.token_usage.input ?? 0)} />
                <MetricPill label="Out Tokens" value={String(meta?.summary?.token_usage.output ?? 0)} />
              </div>
            </div>

            <div className="panel-paper rounded-[24px] p-5">
              <div className="eyebrow mb-4">Report Excerpt</div>
              <div className="code-surface rounded-[18px] px-4 py-4 font-[var(--font-mono)] text-xs leading-6">
                <div className="whitespace-pre-wrap break-words">
                  {meta?.reportExcerpt ||
                    "No graph report yet. Build your local graph into graphify-out/ to unlock report context."}
                </div>
              </div>
            </div>

            {latestAssistant?.sourceFiles?.length ? (
              <div className="panel-paper rounded-[24px] p-5">
                <div className="eyebrow mb-4">Latest Files</div>
                <div className="space-y-2">
                  {latestAssistant.sourceFiles.map((file) => (
                    <div
                      key={file}
                      className="surface-field rounded-[14px] px-4 py-3 font-[var(--font-mono)] text-[11px] text-muted-foreground break-all"
                    >
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}

/* ─── Tweaks dock ─────────────────────────────────────────────── */

function TweaksDock({
  open, setOpen, scene, setScene, density, setDensity, motion, setMotion
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  scene: SceneMode;
  setScene: (v: SceneMode) => void;
  density: DensityMode;
  setDensity: (v: DensityMode) => void;
  motion: boolean;
  setMotion: (v: boolean) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="panel-paper mb-3 w-[300px] rounded-[28px] p-5 shadow-[0_28px_72px_oklch(0.14_0.02_258/0.18)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow mb-1">Tweaks</div>
              <div className="text-lg font-semibold text-foreground">Presentation mode</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="rounded-full">
              Close
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            {/* Scene selector */}
            <div>
              <div className="eyebrow mb-3">Scene</div>
              <div className="grid gap-2">
                {storyModes.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setScene(opt.id)}
                    data-active={scene === opt.id}
                    className="scene-card rounded-[18px] px-4 py-3 text-left"
                  >
                    <div className="text-sm font-semibold">{opt.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{opt.eyebrow}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <div className="eyebrow mb-3">Density</div>
              <div className="flex gap-2">
                {densityOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={density === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDensity(opt.value)}
                    className="rounded-full"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Motion */}
            <div className="surface-muted rounded-[18px] px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-foreground">Ambient motion</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Blob drift and panel reveal.</div>
                </div>
                <Button
                  variant={motion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMotion(!motion)}
                  className="rounded-full"
                >
                  {motion ? "On" : "Off"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Button size="lg" onClick={() => setOpen(!open)} className="rounded-full shadow-[0_20px_52px_oklch(0.14_0.02_258/0.18)]">
        <Sparkles data-icon="inline-start" />
        Tweaks
      </Button>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export function KnowledgeStudio({ mode }: { mode: KnowledgeStudioMode }) {
  const isHome = mode === "home";
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [metaError, setMetaError] = useState("");

  const [question, setQuestion] = useState("");
  const [chatPending, setChatPending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "The workspace is ready. Ask about your graph, inspect the evidence, and use the notebook rail to move through related material.",
      retrieved: [],
      sourceFiles: [],
      images: []
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<NodePayload["node"] | null>(null);
  const [nodePending, setNodePending] = useState(false);
  const [nodeError, setNodeError] = useState("");

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState("focus");

  const [searchText, setSearchText] = useState("");
  const deferredSearch = useDeferredValue(searchText);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<RetrievedNode[]>([]);

  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [scene, setScene] = useState<SceneMode>(isHome ? "nocturne" : "atelier");
  const [density, setDensity] = useState<DensityMode>(isHome ? "tight" : "airy");
  const [motion, setMotion] = useState(true);

  const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const pad = density === "tight" ? "px-4 py-4" : "px-6 py-6";

  const syncScroll = useEffectEvent(() => {
    const vp = transcriptRef.current?.closest('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
    if (!vp) return;
    vp.scrollTop = vp.scrollHeight;
  });

  useEffect(() => { syncScroll(); }, [messages, syncScroll]);

  useEffect(() => {
    const ctrl = new AbortController();
    async function loadMeta() {
      try {
        setMetaError("");
        const res = await fetch("/api/meta", { signal: ctrl.signal });
        const data = (await res.json()) as MetaPayload;
        if (!res.ok) throw new Error("Unable to load graph metadata.");
        setMeta(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMetaError(err instanceof Error ? err.message : "Unable to load graph metadata.");
      }
    }
    void loadMeta();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const query = deferredSearch.trim();
    if (!query) { setSearchResults([]); setSearchError(""); return; }
    const ctrl = new AbortController();
    async function runSearch() {
      try {
        setSearchPending(true);
        setSearchError("");
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: RetrievedNode[] };
        if (!res.ok) throw new Error("Search failed.");
        startTransition(() => setSearchResults(data.results ?? []));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSearchError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setSearchPending(false);
      }
    }
    void runSearch();
    return () => ctrl.abort();
  }, [deferredSearch]);

  async function inspectNode(nodeId: string, revealInspector = false) {
    try {
      setNodePending(true);
      setNodeError("");
      setInspectorTab("focus");
      if (revealInspector) setInspectorOpen(true);
      const res = await fetch(`/api/node/${encodeURIComponent(nodeId)}`);
      const data = (await res.json()) as NodePayload | { error: string };
      if (!res.ok || !("node" in data)) throw new Error("Unable to load that node.");
      startTransition(() => setSelectedNode(data.node));
    } catch (err) {
      setNodeError(err instanceof Error ? err.message : "Unable to load that node.");
    } finally {
      setNodePending(false);
    }
  }

  async function ask(rawQ?: string) {
    const q = (rawQ ?? question).trim();
    if (!q || chatPending) return;
    const history = messages.slice(-6).map(({ role, content }) => ({ role, content }));
    setQuestion("");
    setChatPending(true);
    setChatError("");
    setMessages((cur) => [...cur, { role: "user", content: q }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history })
      });
      const data = (await res.json()) as {
        answer?: string; error?: string;
        retrieved?: RetrievedNode[]; sourceFiles?: string[]; images?: ChatImage[];
      };
      if (!res.ok) throw new Error(data.error || "Chat request failed.");
      const msg: ChatMessage = {
        role: "assistant",
        content: data.answer || "No answer was returned.",
        retrieved: data.retrieved ?? [],
        sourceFiles: data.sourceFiles ?? [],
        images: data.images ?? []
      };
      setMessages((cur) => [...cur, msg]);
      if (msg.retrieved?.[0]) void inspectNode(msg.retrieved[0].id);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Chat request failed.");
    } finally {
      setChatPending(false);
    }
  }

  /* ─── Home mode ─────────────────────────────────────────────── */

  if (isHome) {
    return (
      <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <main
          data-scene={scene}
          data-density={density}
          data-motion={motion ? "on" : "off"}
          className="relative min-h-screen overflow-hidden"
        >
          {/* Background */}
          <div
            className={cn(
              "scene-bg",
              scene === "atelier" ? "scene-bg-atelier" : scene === "index" ? "scene-bg-index" : "scene-bg-nocturne"
            )}
          />
          <div className="blob blob-teal absolute left-[-6rem] top-[8rem] -z-10" />
          <div className="blob blob-gold absolute right-[-6rem] top-[22rem] -z-10" />

          <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-4 p-3 sm:p-4 lg:p-5">
            {/* Header */}
            <header className="panel-rail rounded-[26px] px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(0.14_0.02_258/0.18)]">
                    <Waypoints className="size-[18px]" />
                  </div>
                  <div>
                    <div className="font-[var(--font-display)] text-base font-semibold tracking-tight text-foreground">Graphify Atlas</div>
                    <div className="text-xs text-muted-foreground">Chat-first graph exploration workspace.</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "surface-button rounded-full px-5 text-foreground")}>
                    Back to Landing
                  </Link>
                  <Button size="sm" onClick={() => setInspectorOpen(true)} className="rounded-full px-5 xl:hidden">
                    <PanelRightOpen data-icon="inline-start" />
                    Inspector
                  </Button>
                </div>
              </div>
            </header>

            {/* Three-column layout */}
            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[250px_minmax(0,1fr)_380px]">
              {/* Left rail */}
              <aside className="hidden min-h-0 xl:flex xl:flex-col xl:gap-3">
                <div className="panel-paper rounded-[24px] p-5">
                  <div className="flex items-center gap-2">
                    <Compass className="size-3.5 text-muted-foreground" />
                    <div className="eyebrow">Workspace Guide</div>
                  </div>
                  <div className="mt-3 text-lg font-semibold tracking-tight text-foreground">Start with a question, not a filter.</div>
                  <p className="mt-3 text-sm leading-7 text-foreground/68">
                    Use this rail for quick prompts and context. The center stage is for conversation.
                  </p>
                </div>

                <div className="panel-paper rounded-[24px] p-5">
                  <div className="eyebrow mb-4">Quick Prompts</div>
                  <div className="space-y-2">
                    {starterQuestions.map((q) => (
                      <button
                        key={`rail-${q}`}
                        type="button"
                        onClick={() => void ask(q)}
                        className="surface-muted surface-muted-hover w-full rounded-[14px] px-4 py-3 text-left text-[13px] leading-6 text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-paper rounded-[24px] p-5">
                  <div className="eyebrow mb-4">Graph Snapshot</div>
                  <div className="space-y-2">
                    <MetricPill label="Documents" value={String(meta?.summary?.documents ?? 0)} />
                    <MetricPill label="Nodes" value={String(meta?.summary?.nodes ?? 0)} />
                    <MetricPill label="Edges" value={String(meta?.summary?.edges ?? 0)} />
                  </div>
                </div>

                <div className="panel-paper min-h-0 flex-1 rounded-[24px] p-5">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-3.5 text-muted-foreground" />
                    <div className="eyebrow">Active Communities</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(meta?.communities.slice(0, 5) ?? []).map((c) => (
                      <div key={`${c.community}-${c.label}`} className="surface-muted rounded-[14px] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 truncate text-sm font-medium text-foreground">{c.label}</div>
                          <Badge variant="outline" className="shrink-0">{c.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Center: chat stage */}
              <section className="min-h-0">
                <div className="panel-ink flex min-h-[calc(100svh-7.5rem)] flex-col rounded-[32px] text-white">
                  {/* Chat header */}
                  <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="size-3.5 text-white/50" />
                          <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">Chat Workspace</span>
                        </div>
                        <div className="mt-2.5 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-white">
                          Ask, read, refine, repeat.
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{meta?.summary?.model ?? "gpt-4o-mini"}</Badge>
                        <Badge variant="outline">{messages.length} messages</Badge>
                        <Badge variant="outline">{latestAssistant?.retrieved?.length ?? 0} nodes</Badge>
                      </div>
                    </div>

                    {/* Mobile prompt chips */}
                    <div className="mt-4 flex flex-wrap gap-2 xl:hidden">
                      {starterQuestions.slice(0, 3).map((q) => (
                        <button
                          key={`mobile-${q}`}
                          type="button"
                          onClick={() => void ask(q)}
                          className="prompt-chip prompt-chip-dark"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Status strip */}
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.05] px-4 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">Current Focus</div>
                        <div className="mt-2 text-sm leading-6 text-white/76">
                          {selectedNode?.label ?? latestAssistant?.retrieved?.[0]?.label ?? "No node selected yet. Ask a broad question to begin."}
                        </div>
                      </div>
                      <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.05] px-4 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">Workspace Status</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{scene}</Badge>
                          <Badge variant="outline">{density}</Badge>
                          <Badge variant="outline">{chatPending ? "Thinking…" : "Ready"}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="min-h-0 flex-1">
                    <ScrollArea className="h-full">
                      <div ref={transcriptRef} className="mx-auto flex max-w-4xl flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
                        {messages.map((msg, i) => (
                          <TranscriptMessage
                            key={`${msg.role}-${i}`}
                            message={msg}
                            onInspect={(nodeId) => void inspectNode(nodeId, true)}
                          />
                        ))}
                        {chatPending ? (
                          <div className="max-w-[92%] rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-4">
                            <div className="flex items-center gap-3 text-sm text-white/65">
                              <LoaderCircle className="size-4 animate-spin" />
                              Reading graph evidence and drafting a compact answer.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Compose area */}
                  <div className="border-t border-white/[0.08] px-5 py-5 sm:px-6">
                    {chatError ? (
                      <div className="mb-4 rounded-[18px] border border-white/10 bg-white/[0.07] p-4 text-sm leading-7 text-white/82">
                        {chatError}
                      </div>
                    ) : null}
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px]">
                      <div className="rounded-[24px] border border-white/[0.10] bg-white/[0.07] p-3">
                        <Textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(); }
                          }}
                          placeholder="Ask about a community, source file, relationship, or missing evidence."
                          className="min-h-[120px] resize-none border-none bg-transparent px-2 py-2 text-[15px] text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => void ask()} disabled={chatPending || !question.trim()} size="lg" className="rounded-[20px]">
                          Send
                          <SendHorizonal data-icon="inline-end" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setQuestion(starterQuestions[0])}
                          disabled={chatPending}
                          className="rounded-[20px] border-white/14 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
                        >
                          Use Prompt
                        </Button>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => setInspectorOpen(true)}
                          className="rounded-[20px] text-white hover:bg-white/[0.08] hover:text-white xl:hidden"
                        >
                          Inspector
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right rail: inspector */}
              <aside className="hidden min-h-0 xl:block">
                <div className="panel-paper flex h-[calc(100svh-7.5rem)] flex-col overflow-hidden rounded-[32px]">
                  <InspectorWorkbench
                    meta={meta}
                    latestAssistant={latestAssistant}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    searchPending={searchPending}
                    searchResults={searchResults}
                    searchError={searchError}
                    selectedNode={selectedNode}
                    nodePending={nodePending}
                    nodeError={nodeError}
                    onInspect={(nodeId) => void inspectNode(nodeId)}
                    tab={inspectorTab}
                    setTab={setInspectorTab}
                  />
                </div>
              </aside>
            </div>
          </div>

          <TweaksDock
            open={tweaksOpen} setOpen={setTweaksOpen}
            scene={scene} setScene={setScene}
            density={density} setDensity={setDensity}
            motion={motion} setMotion={setMotion}
          />

          <DialogContent
            showCloseButton={false}
            className="h-[94vh] w-[min(98vw,1800px)] max-w-none overflow-hidden rounded-[32px] border border-foreground/10 bg-background/95 p-0 shadow-[0_40px_100px_oklch(0.08_0.016_258/0.28)]"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>Evidence Inspector</DialogTitle>
              <DialogDescription>Inspect nodes, search the graph, and review report context.</DialogDescription>
            </DialogHeader>
            <div className="h-full min-h-0">
              <InspectorWorkbench
                meta={meta} latestAssistant={latestAssistant}
                searchText={searchText} setSearchText={setSearchText}
                searchPending={searchPending} searchResults={searchResults}
                searchError={searchError} selectedNode={selectedNode}
                nodePending={nodePending} nodeError={nodeError}
                onInspect={(nodeId) => void inspectNode(nodeId)}
                tab={inspectorTab} setTab={setInspectorTab}
              />
            </div>
          </DialogContent>
        </main>
      </Dialog>
    );
  }

  /* ─── Landing mode ──────────────────────────────────────────── */

  return (
    <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
      <main
        data-scene={scene}
        data-density={density}
        data-motion={motion ? "on" : "off"}
        className="relative overflow-hidden"
      >
        {/* Background */}
        <div
          className={cn(
            "scene-bg",
            scene === "atelier" ? "scene-bg-atelier" : scene === "index" ? "scene-bg-index" : "scene-bg-nocturne"
          )}
        />
        <div className="blob blob-teal absolute left-[-6rem] top-[10rem] -z-10" />
        <div className="blob blob-gold absolute right-[-5rem] top-[28rem] -z-10" />

        {/* ── Nav ── */}
        <section className="shell pt-6 sm:pt-8">
          <nav className="panel-rail reveal rounded-[26px] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(0.14_0.02_258/0.18)]">
                  <Waypoints className="size-[18px]" />
                </div>
                <div>
                  <div className="font-[var(--font-display)] text-base font-semibold tracking-tight text-foreground">Graphify Atlas</div>
                  <div className="text-xs text-muted-foreground">A graph workspace redesigned as a visual research desk.</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="#workspace" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "surface-button rounded-full px-5 text-foreground")}>
                  Preview Workbench
                </a>
                <Link href="/home" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}>
                  Open Workspace
                </Link>
              </div>
            </div>
          </nav>
        </section>

        {/* ── Hero ── */}
        <section className="shell pb-20 pt-12 sm:pt-16">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1.1fr)] xl:items-center">
            {/* Left: copy */}
            <div className="reveal">
              <div className="eyebrow">Complete Re-layout</div>
              <h1 className="hero-display mt-6 font-[var(--font-display)] font-semibold text-foreground">
                Make the graph feel designed, not merely rendered.
              </h1>
              <p className="mt-8 max-w-xl text-[17px] leading-[1.85] text-foreground/68">
                This version abandons the glassy UI and rebuilds the product around editorial pacing,
                tactile surfaces, stronger hierarchy, and three scene-based presentation modes.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/home" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-7")}>
                  Launch Workspace
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
                <a href="#modes" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "surface-button rounded-full px-7 text-foreground")}>
                  Explore Scene Modes
                </a>
              </div>

              <div className="mt-12 flex flex-wrap gap-3">
                <MetricPill label="Documents" value={String(meta?.summary?.documents ?? 0)} />
                <MetricPill label="Communities" value={String(meta?.summary?.communities ?? 0)} />
                <MetricPill label="Model" value={meta?.summary?.model ?? "gpt-4o-mini"} />
              </div>
            </div>

            {/* Right: mockup */}
            <LandingPreview meta={meta} scene={scene} />
          </div>
        </section>

        {/* ── Scene modes ── */}
        <section id="modes" className="shell py-20 sm:py-24">
          <SectionLead
            eyebrow="Scene System"
            title="Three moods, one shared product."
            body="The presentation system lets the same graph workspace shift tone without losing coherence — from editorial warmth to archive precision to night-shift focus."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {storyModes.map((opt, i) => (
              <div
                key={opt.id}
                className={cn(
                  "reveal panel-paper rounded-[26px] p-6 transition",
                  scene === opt.id ? "-translate-y-1 border-foreground/20 shadow-[0_28px_68px_oklch(0.14_0.02_258/0.12)]" : ""
                )}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="eyebrow">{opt.eyebrow}</div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{opt.name}</div>
                <p className="mt-4 text-sm leading-7 text-foreground/68">{opt.note}</p>
                <div className="mt-7">
                  <Button
                    variant={scene === opt.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setScene(opt.id)}
                    className="rounded-full"
                  >
                    {scene === opt.id ? "Active" : "Apply Scene"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Working principles ── */}
        <section className="shell pb-16">
          <SectionLead
            eyebrow="Working Logic"
            title="Spatial, not cosmetic."
            body="Landing, chat, evidence, and search each have a distinct visual job. The redesign is about cognitive clarity — not decoration."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {workingPrinciples.map((item, i) => (
              <div
                key={item.id}
                className="reveal panel-note rounded-[24px] p-6"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="eyebrow">{item.id}</div>
                <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{item.title}</div>
                <p className="mt-4 text-sm leading-7 text-foreground/68">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Workbench preview ── */}
        <section id="workspace" className="shell pb-24 pt-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionLead
              eyebrow="Workbench"
              title="A split between deep conversation and tactile evidence."
              body="The center stage is a focused dark canvas. Side rails read like notebooks and archived fragments."
            />
            <div className="flex flex-wrap gap-3">
              <MetricPill label="Nodes" value={String(meta?.summary?.nodes ?? 0)} />
              <MetricPill label="Edges" value={String(meta?.summary?.edges ?? 0)} />
              <MetricPill label="Status" value={chatPending ? "Thinking…" : "Ready"} />
            </div>
          </div>

          {metaError ? (
            <div className="panel-paper mb-6 rounded-[22px] p-5 text-sm leading-7 text-foreground">{metaError}</div>
          ) : null}

          {/* Full workbench panel */}
          <div className="panel-paper relative overflow-hidden rounded-[40px]">
            <div className="grid-texture absolute inset-0 opacity-40" />
            <div className="relative grid min-h-[860px] xl:grid-cols-[260px_minmax(0,1fr)_360px]">

              {/* Left desk rail */}
              <aside className="hidden border-r border-foreground/[0.07] xl:flex xl:min-h-0 xl:flex-col">
                <div className={cn("border-b border-foreground/[0.07]", pad)}>
                  <div className="eyebrow mb-3">Context Rail</div>
                  <div className="text-xl font-semibold tracking-tight text-foreground">Desk Notes</div>
                  <p className="mt-3 text-sm leading-7 text-foreground/65">
                    Summary metrics, scene hints, and communities — without crowding the main stage.
                  </p>
                </div>

                <ScrollArea className="min-h-0 flex-1">
                  <div className={cn("space-y-5", pad)}>
                    {meta ? (
                      <div className="space-y-2">
                        <MetricPill label="Documents" value={String(meta.summary?.documents ?? 0)} />
                        <MetricPill label="Nodes" value={String(meta.summary?.nodes ?? 0)} />
                        <MetricPill label="Images" value={String(meta.summary?.images_detected ?? 0)} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-12 rounded-[14px]" />
                        <Skeleton className="h-12 rounded-[14px]" />
                        <Skeleton className="h-12 rounded-[14px]" />
                      </div>
                    )}

                    <Separator />

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Layers3 className="size-3.5 text-muted-foreground" />
                        <div className="eyebrow">Communities</div>
                      </div>
                      <div className="space-y-2">
                        {(meta?.communities.slice(0, 6) ?? []).map((c) => (
                          <div key={`${c.community}-${c.label}`} className="panel-note rounded-[18px] p-3.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">{c.label}</div>
                                <div className="mt-0.5 text-[11px] text-muted-foreground">Community {c.community}</div>
                              </div>
                              <Badge variant="outline" className="shrink-0">{c.count}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="panel-note rounded-[22px] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Orbit className="size-3.5 text-muted-foreground" />
                        <div className="eyebrow">Current Mode</div>
                      </div>
                      <div className="text-base font-semibold text-foreground">
                        {storyModes.find((s) => s.id === scene)?.name ?? "Atelier"}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-foreground/68">
                        {storyModes.find((s) => s.id === scene)?.note}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </aside>

              {/* Center stage */}
              <section className="flex min-h-0 flex-col">
                <div className={pad}>
                  <div className="panel-ink flex min-h-[780px] flex-col rounded-[30px] text-white">
                    {/* Chat header */}
                    <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="size-3.5 text-white/48" />
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/48">Conversation Stage</span>
                          </div>
                          <div className="mt-2.5 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-white">
                            Ask in plain language, verify like an editor.
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{meta?.summary?.model ?? "gpt-4o-mini"}</Badge>
                          <Badge variant="outline">{messages.length} messages</Badge>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {starterQuestions.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => void ask(q)}
                            className="prompt-chip prompt-chip-dark"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transcript */}
                    <div className="min-h-0 flex-1">
                      <ScrollArea className="h-full">
                        <div ref={transcriptRef} className={cn("mx-auto flex max-w-4xl flex-col gap-5", pad)}>
                          {/* Context cards */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.05] p-5">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">Session Tone</div>
                              <p className="mt-2.5 text-sm leading-7 text-white/72">
                                The dark canvas concentrates answers, evidence chips, and media previews for sustained reading.
                              </p>
                            </div>
                            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.05] p-5">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-white/48">Latest Focus</div>
                              <p className="mt-2.5 text-sm leading-7 text-white/72">
                                {selectedNode?.label ?? latestAssistant?.retrieved?.[0]?.label ?? "No node selected yet."}
                              </p>
                            </div>
                          </div>

                          {messages.map((msg, i) => (
                            <TranscriptMessage
                              key={`${msg.role}-${i}`}
                              message={msg}
                              onInspect={(nodeId) => void inspectNode(nodeId, true)}
                            />
                          ))}
                          {chatPending ? (
                            <div className="max-w-[92%] rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-4">
                              <div className="flex items-center gap-3 text-sm text-white/65">
                                <LoaderCircle className="size-4 animate-spin" />
                                Reading graph evidence and drafting a compact answer.
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Compose */}
                    <div className="border-t border-white/[0.08] px-5 py-5 sm:px-6">
                      {chatError ? (
                        <div className="mb-4 rounded-[18px] border border-white/10 bg-white/[0.07] p-4 text-sm leading-7 text-white/80">
                          {chatError}
                        </div>
                      ) : null}
                      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_200px]">
                        <Textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(); }
                          }}
                          placeholder="Ask about a community, source file, concept relationship, or missing evidence."
                          className="min-h-[120px] resize-none rounded-[24px] border-white/[0.10] bg-white/[0.07] px-5 py-4 text-[15px] text-white shadow-none placeholder:text-white/40"
                        />
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => void ask()} disabled={chatPending || !question.trim()} size="lg" className="rounded-[20px]">
                            Send Question
                            <SendHorizonal data-icon="inline-end" />
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setQuestion(starterQuestions[0])}
                            disabled={chatPending}
                            className="rounded-[20px] border-white/14 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white"
                          >
                            Use Prompt
                          </Button>
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => setInspectorOpen(true)}
                            className="rounded-[20px] text-white hover:bg-white/[0.08] hover:text-white xl:hidden"
                          >
                            Open Inspector
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right: inspector */}
              <aside className="hidden border-l border-foreground/[0.07] xl:flex xl:min-h-0 xl:flex-col">
                <InspectorWorkbench
                  meta={meta} latestAssistant={latestAssistant}
                  searchText={searchText} setSearchText={setSearchText}
                  searchPending={searchPending} searchResults={searchResults}
                  searchError={searchError} selectedNode={selectedNode}
                  nodePending={nodePending} nodeError={nodeError}
                  onInspect={(nodeId) => void inspectNode(nodeId)}
                  tab={inspectorTab} setTab={setInspectorTab}
                />
              </aside>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="shell pb-24">
          <div className="panel-rail reveal rounded-[34px] px-8 py-10">
            <div className="flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="eyebrow mb-4">Ready to start</div>
                <h3 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  The landing page sells a point of view. The workbench earns the trust.
                </h3>
                <p className="mt-4 text-[16px] leading-[1.8] text-foreground/68">
                  Use the landing when presenting the product. Switch to the workspace when you need to work inside the graph.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/home" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-7")}>
                  Open Workspace
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
                <a href="#workspace" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "surface-button rounded-full px-7 text-foreground")}>
                  Return to Preview
                </a>
              </div>
            </div>
          </div>
        </section>

        <TweaksDock
          open={tweaksOpen} setOpen={setTweaksOpen}
          scene={scene} setScene={setScene}
          density={density} setDensity={setDensity}
          motion={motion} setMotion={setMotion}
        />

        <DialogContent
          showCloseButton={false}
          className="h-[94vh] w-[min(98vw,1800px)] max-w-none overflow-hidden rounded-[32px] border border-foreground/10 bg-background/95 p-0 shadow-[0_40px_100px_oklch(0.08_0.016_258/0.28)]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Evidence Inspector</DialogTitle>
            <DialogDescription>Inspect nodes, search the graph, and review report context.</DialogDescription>
          </DialogHeader>
          <div className="h-full min-h-0">
            <InspectorWorkbench
              meta={meta} latestAssistant={latestAssistant}
              searchText={searchText} setSearchText={setSearchText}
              searchPending={searchPending} searchResults={searchResults}
              searchError={searchError} selectedNode={selectedNode}
              nodePending={nodePending} nodeError={nodeError}
              onInspect={(nodeId) => void inspectNode(nodeId)}
              tab={inspectorTab} setTab={setInspectorTab}
            />
          </div>
        </DialogContent>
      </main>
    </Dialog>
  );
}
