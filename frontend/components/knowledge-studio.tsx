"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronUp,
  Compass,
  FileStack,
  Gauge,
  ImageIcon,
  Layers3,
  LoaderCircle,
  MessagesSquare,
  Network,
  Orbit,
  PanelRightOpen,
  Search,
  SendHorizonal,
  Sparkles,
  TableProperties,
  Waypoints
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const starterQuestions = [
  "工地週轉金申請需要注意什麼？",
  "零用金核銷流程怎麼跑？",
  "工務所設置有哪些核心控制點？",
  "保固及維修和完工點交的關聯是什麼？"
];

const storySteps = [
  {
    id: "ask",
    eyebrow: "01",
    title: "先問，不先翻檔案",
    body: "把流程、責任單位、表格、照片直接當成自然語言問題丟進來，系統會先找出圖譜裡最有關聯的節點。",
    detail: "每一次回答都會同步連動來源與關聯。"
  },
  {
    id: "trace",
    eyebrow: "02",
    title: "讓證據自己浮上來",
    body: "圖片、表格、節點摘要與引用文件會跟著問題一起浮出來，不需要在視窗之間來回切換。",
    detail: "你看到的不是摘要頁，而是可以追索的知識現場。"
  },
  {
    id: "navigate",
    eyebrow: "03",
    title: "從對話走進脈絡",
    body: "回答只是入口。真正的操作，是沿著節點關聯繼續展開、比對、再追問。",
    detail: "工作台會維持連續上下文，不會把每一次提問切成孤立的泡泡。"
  }
];

function scrollToTarget(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ExpandButton({
  expanded,
  onClick,
  labelMore = "展開",
  labelLess = "收合"
}: {
  expanded: boolean;
  onClick: () => void;
  labelMore?: string;
  labelLess?: string;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="w-fit rounded-full px-2">
      {expanded ? labelLess : labelMore}
      {expanded ? <ChevronUp data-icon="inline-end" /> : <ChevronDown data-icon="inline-end" />}
    </Button>
  );
}

function MetricPill({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/55 bg-white/72 px-4 py-2 text-sm shadow-[0_18px_45px_rgba(16,35,53,0.08)] backdrop-blur-xl">
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-2 font-semibold text-foreground">{value}</span>
    </div>
  );
}

function InlineImageGallery({
  images,
  onInspect
}: {
  images: ChatImage[];
  onInspect: (nodeId: string) => void;
}) {
  if (!images.length) return null;

  return (
    <div className="mt-5 flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">相關影像</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <div key={image.path} className="overflow-hidden rounded-[22px] border border-border/80 bg-white/75">
            <a href={image.url} target="_blank" rel="noreferrer" className="block">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={image.url} alt={image.label} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
              </div>
            </a>
            <div className="flex flex-col gap-3 px-4 py-4">
              <div className="break-words text-sm font-medium text-foreground">{image.label}</div>
              <Button variant="outline" size="sm" onClick={() => onInspect(image.nodeId)} className="w-fit rounded-full">
                <ImageIcon data-icon="inline-start" />
                {image.nodeLabel}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreadMessage({
  message,
  onInspect
}: {
  message: ChatMessage;
  onInspect: (nodeId: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[86%] min-w-0 rounded-[30px] border border-primary/10 bg-primary px-5 py-5 text-primary-foreground shadow-[0_22px_50px_rgba(14,43,79,0.16)]">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/75">
          <Compass className="size-4" />
          問題
        </div>
        <div className="break-words whitespace-pre-wrap text-sm leading-7">{message.content}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[92%] min-w-0 rounded-[32px] border border-white/70 bg-white/82 px-5 py-5 shadow-[0_22px_55px_rgba(17,31,53,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <Bot />
          Graphify Atlas
        </Badge>
        {message.retrieved?.length ? <Badge variant="outline">{message.retrieved.length} 個關聯節點</Badge> : null}
        {message.sourceFiles?.length ? <Badge variant="outline">{message.sourceFiles.length} 份來源</Badge> : null}
      </div>

      <div className="break-words whitespace-pre-wrap text-sm leading-7 text-foreground">{message.content}</div>

      <InlineImageGallery images={message.images ?? []} onInspect={onInspect} />

      {message.retrieved?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {message.retrieved.slice(0, 5).map((node) => (
            <Button
              key={`${message.content}-${node.id}`}
              variant="outline"
              size="sm"
              onClick={() => onInspect(node.id)}
              className="max-w-full rounded-full bg-white/60"
            >
              <Network data-icon="inline-start" />
              <span className="max-w-[180px] truncate">{node.label}</span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TablePreview({ table }: { table: MarkdownTable }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border/80 bg-white/75">
      <div className="flex items-center gap-2 border-b border-border/80 px-4 py-3 text-sm font-medium text-foreground">
        <TableProperties className="size-4 text-muted-foreground" />
        <span className="break-words">{table.title}</span>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-muted/80">
            <tr>
              {table.headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-2 font-medium text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${table.title}-${rowIndex}`} className="border-t border-border/70">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${table.title}-${rowIndex}-${cellIndex}`}
                    className="max-w-[320px] break-words px-3 py-2 align-top text-foreground/80"
                  >
                    {cell || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectedNodePanel({
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
  const [snippetExpanded, setSnippetExpanded] = useState(false);
  const [imagesExpanded, setImagesExpanded] = useState(false);
  const [tablesExpanded, setTablesExpanded] = useState(false);
  const [neighborsExpanded, setNeighborsExpanded] = useState(false);

  useEffect(() => {
    setSnippetExpanded(false);
    setImagesExpanded(false);
    setTablesExpanded(false);
    setNeighborsExpanded(false);
  }, [node?.id]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>載入節點時發生問題</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading && !node) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="rounded-[24px] border border-dashed border-border bg-white/60 px-5 py-8 text-sm leading-7 text-muted-foreground">
        先從對話或搜尋選一個節點，這裡會顯示圖片、表格、來源片段與關聯路徑。
      </div>
    );
  }

  const visibleImages = imagesExpanded ? node.images : node.images.slice(0, 4);
  const visibleTables = tablesExpanded ? node.tables : node.tables.slice(0, 2);
  const visibleNeighbors = neighborsExpanded ? node.neighbors : node.neighbors.slice(0, 6);

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-[1.55rem] font-semibold tracking-tight text-foreground">{node.label}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{node.communityLabel}</Badge>
            <Badge variant="outline">{node.images.length} 張圖片</Badge>
            <Badge variant="outline">{node.tables.length} 個表格</Badge>
          </div>
        </div>
        <Badge variant={loading ? "secondary" : "outline"}>{loading ? "同步中" : "就緒"}</Badge>
      </div>

      {node.source_file ? (
        <div className="rounded-xl bg-muted/75 px-3 py-2 font-[var(--font-mono)] text-[11px] leading-5 text-muted-foreground break-all">
          {node.source_file}
        </div>
      ) : null}

      {node.summary ? <div className="break-words text-sm leading-7 text-foreground/80">{node.summary}</div> : null}

      {node.images.length ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <ImageIcon className="size-4" />
              圖像
            </div>
            {node.images.length > 4 ? (
              <ExpandButton expanded={imagesExpanded} onClick={() => setImagesExpanded((value) => !value)} />
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleImages.map((image) => (
              <a
                key={image.path}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-[22px] border border-border/80 bg-white/75 transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={image.url} alt={image.label} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
                </div>
                <div className="border-t border-border/80 px-4 py-4">
                  <div className="break-words text-sm font-medium text-foreground">{image.label}</div>
                  <div className="mt-1 break-all text-xs text-muted-foreground">{image.path}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {node.tables.length ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <TableProperties className="size-4" />
              表格
            </div>
            {node.tables.length > 2 ? (
              <ExpandButton expanded={tablesExpanded} onClick={() => setTablesExpanded((value) => !value)} />
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            {visibleTables.map((table) => (
              <TablePreview key={`${node.id}-${table.title}`} table={table} />
            ))}
          </div>
        </div>
      ) : null}

      {node.snippet ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">來源片段</div>
            {node.snippet.length > 600 ? (
              <ExpandButton expanded={snippetExpanded} onClick={() => setSnippetExpanded((value) => !value)} />
            ) : null}
          </div>
          <div className="rounded-[22px] bg-foreground px-4 py-4 font-[var(--font-mono)] text-xs leading-6 text-background">
            <div
              className={cn(
                "scroll-thin overflow-y-auto whitespace-pre-wrap break-words",
                snippetExpanded ? "max-h-[420px]" : "max-h-[180px]"
              )}
            >
              {snippetExpanded ? node.snippet : `${node.snippet.slice(0, 700)}${node.snippet.length > 700 ? "..." : ""}`}
            </div>
          </div>
        </div>
      ) : null}

      {node.neighbors.length ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">關聯節點</div>
            {node.neighbors.length > 6 ? (
              <ExpandButton expanded={neighborsExpanded} onClick={() => setNeighborsExpanded((value) => !value)} />
            ) : null}
          </div>
          <div className="grid gap-2">
            {visibleNeighbors.map((neighbor) => (
              <Button
                key={`${node.id}-${neighbor.id}`}
                variant="outline"
                size="sm"
                onClick={() => onInspect(neighbor.id)}
                className="h-auto min-w-0 justify-start rounded-[20px] bg-white/65 px-3 py-3 text-left"
              >
                <div className="flex min-w-0 flex-col items-start gap-1">
                  <div className="break-words font-medium text-foreground">{neighbor.label}</div>
                  <div className="break-all text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {neighbor.relation} · {neighbor.confidence}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InspectorContent({
  search,
  setSearch,
  searchPending,
  results,
  searchError,
  selectedNode,
  nodePending,
  nodeError,
  inspectNode,
  latestAssistant,
  meta,
  inspectorTab,
  setInspectorTab,
  filesExpanded,
  setFilesExpanded,
  reportExpanded,
  setReportExpanded
}: {
  search: string;
  setSearch: (value: string) => void;
  searchPending: boolean;
  results: RetrievedNode[];
  searchError: string;
  selectedNode: NodePayload["node"] | null;
  nodePending: boolean;
  nodeError: string;
  inspectNode: (nodeId: string) => void;
  latestAssistant: ChatMessage | undefined;
  meta: MetaPayload | null;
  inspectorTab: string;
  setInspectorTab: (value: string) => void;
  filesExpanded: boolean;
  setFilesExpanded: (value: boolean | ((value: boolean) => boolean)) => void;
  reportExpanded: boolean;
  setReportExpanded: (value: boolean | ((value: boolean) => boolean)) => void;
}) {
  const visibleResults = useMemo(() => results.slice(0, 10), [results]);
  const visibleSourceFiles = useMemo(
    () => (filesExpanded ? latestAssistant?.sourceFiles ?? [] : (latestAssistant?.sourceFiles ?? []).slice(0, 6)),
    [filesExpanded, latestAssistant?.sourceFiles]
  );
  const reportText = meta?.reportExcerpt ?? "目前尚未載入圖譜摘要。";
  const visibleReportText = reportExpanded || reportText.length <= 900 ? reportText : `${reportText.slice(0, 900)}...`;

  return (
    <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/70 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Evidence Capsule</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">證據艙</div>
          </div>
          <Badge variant="outline">Graph-backed</Badge>
        </div>

        <TabsList variant="line" className="mt-5 flex w-full justify-center rounded-none border-b border-border/60 px-0">
          <TabsTrigger value="focus">
            <Network data-icon="inline-start" />
            焦點
          </TabsTrigger>
          <TabsTrigger value="atlas">
            <Search data-icon="inline-start" />
            搜尋
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileStack data-icon="inline-start" />
            來源
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜尋節點、制度、表格或責任單位"
              className="rounded-full bg-white/80 pl-9"
            />
          </div>
          {searchPending && !results.length ? <Skeleton className="mt-3 h-10 rounded-xl" /> : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-6 py-5">
        <TabsContent value="focus" className="mt-0 h-full outline-none">
          <ScrollArea className="h-full">
            <div className="mx-auto min-h-full w-full max-w-[1440px] pr-4">
              <SelectedNodePanel node={selectedNode} loading={nodePending} error={nodeError} onInspect={inspectNode} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="atlas" className="mt-0 h-full outline-none">
          <ScrollArea className="h-full">
            <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-3 pr-4">
              {searchError ? (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertTitle>搜尋時發生問題</AlertTitle>
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">搜尋結果</div>

              {visibleResults.length ? (
                visibleResults.map((result) => (
                  <Button
                    key={result.id}
                    variant="outline"
                    size="sm"
                    onClick={() => inspectNode(result.id)}
                    className="h-auto min-w-0 justify-start rounded-[22px] bg-white/70 px-4 py-4 text-left"
                  >
                    <div className="flex min-w-0 w-full flex-col items-start gap-2">
                      <div className="flex w-full min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 break-words font-medium text-foreground">{result.label}</div>
                        <Badge variant="secondary">{result.score.toFixed(1)}</Badge>
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {result.communityLabel}
                      </div>
                      {result.sourceFile ? (
                        <div className="break-all text-xs leading-5 text-muted-foreground">{result.sourceFile}</div>
                      ) : null}
                    </div>
                  </Button>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-white/65 px-5 py-8 text-sm leading-7 text-muted-foreground">
                  輸入至少兩個字，圖譜會回傳最相關的節點。
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="files" className="mt-0 h-full outline-none">
          <ScrollArea className="h-full">
            <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-5 pr-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">本輪引用文件</div>
                  {(latestAssistant?.sourceFiles?.length ?? 0) > 6 ? (
                    <ExpandButton expanded={filesExpanded} onClick={() => setFilesExpanded((value) => !value)} />
                  ) : null}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {visibleSourceFiles.length ? (
                    visibleSourceFiles.map((source) => (
                      <div
                        key={source}
                        className="rounded-[20px] border border-border bg-white/70 px-4 py-3 text-sm text-foreground/80 break-all"
                      >
                        {source}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-border bg-white/65 px-5 py-8 text-sm leading-7 text-muted-foreground">
                      當前對話尚未引用來源文件。
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Graph Report 摘錄</div>
                  {reportText.length > 900 ? (
                    <ExpandButton expanded={reportExpanded} onClick={() => setReportExpanded((value) => !value)} />
                  ) : null}
                </div>
                <div className="mt-3 rounded-[22px] bg-foreground px-4 py-4 font-[var(--font-mono)] text-xs leading-6 text-background">
                  <div className="scroll-thin max-h-[360px] overflow-y-auto whitespace-pre-wrap break-words">
                    {visibleReportText}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}

function SignalRail({
  meta,
  selectedNode,
  latestAssistant,
  openInspector,
  setQuestion
}: {
  meta: MetaPayload | null;
  selectedNode: NodePayload["node"] | null;
  latestAssistant: ChatMessage | undefined;
  openInspector: () => void;
  setQuestion: (value: string) => void;
}) {
  const previewImage = selectedNode?.images?.[0] ?? latestAssistant?.images?.[0];
  const sourceFiles = latestAssistant?.sourceFiles?.slice(0, 3) ?? [];

  return (
    <aside className="hidden min-h-0 flex-col border-l border-border/70 bg-white/38 lg:flex">
      <div className="border-b border-border/70 px-5 py-5">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signal Rail</div>
        <div className="mt-2 text-lg font-semibold tracking-tight">同步中的脈絡</div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 px-5 py-5">
          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Gauge className="size-4" />
              圖譜規模
            </div>
            <div className="mt-4 space-y-3">
              <MetricPill label="節點" value={String(meta?.summary?.nodes ?? "—")} />
              <MetricPill label="圖片" value={String(meta?.summary?.images_detected ?? "—")} />
              <MetricPill label="社群" value={String(meta?.summary?.communities ?? "—")} />
            </div>
          </div>

          {previewImage ? (
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/70">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={previewImage.url} alt={previewImage.label} className="h-full w-full object-cover" />
              </div>
              <div className="px-4 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">當前影像</div>
                <div className="mt-2 break-words text-sm font-medium">{previewImage.label}</div>
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Waypoints className="size-4" />
              焦點節點
            </div>
            <div className="mt-3">
              {selectedNode ? (
                <>
                  <div className="text-base font-semibold tracking-tight">{selectedNode.label}</div>
                  {selectedNode.summary ? (
                    <div className="mt-2 line-clamp-5 text-sm leading-7 text-muted-foreground">{selectedNode.summary}</div>
                  ) : null}
                </>
              ) : (
                <div className="text-sm leading-7 text-muted-foreground">回答後會自動同步一個目前最相關的節點。</div>
              )}
            </div>
            <Button onClick={openInspector} variant="outline" className="mt-4 w-full rounded-full">
              <PanelRightOpen data-icon="inline-start" />
              打開證據艙
            </Button>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">快速帶入</div>
            <div className="mt-3 flex flex-col gap-2">
              {starterQuestions.slice(0, 3).map((item) => (
                <button
                  key={`rail-${item}`}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className="rounded-[18px] border border-border/80 bg-white/80 px-3 py-3 text-left text-sm leading-6 text-foreground transition hover:-translate-y-0.5 hover:border-foreground/20"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">最近來源</div>
            <div className="mt-3 flex flex-col gap-2">
              {sourceFiles.length ? (
                sourceFiles.map((source) => (
                  <div key={source} className="rounded-[18px] bg-muted/70 px-3 py-3 text-xs leading-6 text-muted-foreground break-all">
                    {source}
                  </div>
                ))
              ) : (
                <div className="text-sm leading-7 text-muted-foreground">發問後，這裡會顯示本輪引用文件。</div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

function StoryShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const updateActiveStory = () => {
      const anchor = window.innerHeight * 0.24;
      let nextIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top - anchor);

        if (distance < bestDistance) {
          bestDistance = distance;
          nextIndex = index;
        }
      });

      setActiveIndex(nextIndex);
    };

    updateActiveStory();
    window.addEventListener("scroll", updateActiveStory, { passive: true });
    window.addEventListener("resize", updateActiveStory);

    return () => {
      window.removeEventListener("scroll", updateActiveStory);
      window.removeEventListener("resize", updateActiveStory);
    };
  }, []);

  const activeStep = storySteps[activeIndex] ?? storySteps[0];

  return (
    <section id="story" className="landing-shell py-24">
      <div className="grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[34px] border border-white/65 bg-white/78 px-6 py-6 shadow-[0_24px_70px_rgba(17,31,53,0.1)] backdrop-blur-2xl">
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Scroll Narrative</div>
            <h2 className="mt-4 max-w-[10ch] text-4xl font-semibold tracking-tight sm:text-5xl">
              左邊定錨，右邊堆疊。
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-foreground/70">
              這段捲動不是補充說明，而是操作方法本身。固定的資訊卡負責定向，右側堆疊卡片則一張張把工作方式推到前景。
            </p>

            <div className="mt-8 rounded-[26px] border border-white/70 bg-white/72 px-5 py-5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">當前步驟</div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="text-5xl font-semibold leading-none tracking-[-0.08em] text-foreground/18">
                  {activeStep.eyebrow}
                </div>
                <div className="text-xl font-semibold tracking-tight text-foreground">{activeStep.title}</div>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/72">{activeStep.body}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{activeStep.detail}</p>
            </div>

            <div className="mt-8 grid gap-3">
              {storySteps.map((step, index) => (
                <button
                  key={`legend-${step.id}`}
                  type="button"
                  onClick={() => cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className={cn(
                    "rounded-[20px] border px-4 py-4 text-left transition duration-300",
                    index === activeIndex
                      ? "border-foreground/20 bg-white text-foreground shadow-[0_18px_40px_rgba(17,31,53,0.1)]"
                      : "border-white/70 bg-white/65 text-foreground/70 hover:-translate-y-0.5 hover:border-foreground/18"
                  )}
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{step.eyebrow}</div>
                  <div className="mt-2 text-sm font-medium">{step.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="story-stack relative pb-[26vh]">
          <div className="absolute bottom-0 left-8 top-0 hidden w-px bg-gradient-to-b from-transparent via-foreground/12 to-transparent lg:block" />
          {storySteps.map((step, index) => {
            const delta = index - activeIndex;
            const isPast = index < activeIndex;
            const futureOffset = Math.max(delta, 0);
            const scale = isPast ? 0.94 : 1 - Math.min(futureOffset, 3) * 0.035;
            const translateY = futureOffset * 36;
            const opacity = isPast ? 0.52 : 1 - Math.min(futureOffset, 3) * 0.08;
            const blur = isPast ? 1.2 : Math.min(futureOffset, 2) * 0.4;

            return (
              <article
                key={step.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="story-panel sticky overflow-hidden rounded-[34px] border border-white/65 bg-white/82 px-6 py-6 shadow-[0_24px_70px_rgba(17,31,53,0.1)] backdrop-blur-2xl transition duration-500 ease-out"
                style={{
                  top: "116px",
                  zIndex: storySteps.length - index,
                  marginTop: index === 0 ? "0px" : "-24vh",
                  transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                  opacity,
                  filter: `blur(${blur}px)`
                }}
              >
                <div className="story-card-inner flex min-h-[74vh] flex-col justify-between">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-2xl">
                      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{step.eyebrow}</div>
                      <h3 className="mt-4 text-3xl font-semibold tracking-tight">{step.title}</h3>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/72">{step.body}</p>
                    </div>
                    <div className="text-[clamp(3.8rem,8vw,7rem)] font-semibold leading-none tracking-[-0.08em] text-foreground/10">
                      {step.eyebrow}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 border-t border-border/70 pt-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="text-sm leading-7 text-muted-foreground">{step.detail}</div>
                    <div className="rounded-[24px] border border-white/70 bg-white/78 px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Interaction</div>
                      <div className="mt-3 text-sm leading-7 text-foreground">
                        {index === 0
                          ? "輸入一句自然語言，工作台先把語意折進圖譜，再把可追索的節點帶出來。"
                          : index === 1
                            ? "回答會連動圖片、表格、來源與節點，不需要自己切視窗找證據。"
                            : "沿著節點一路追問，工作台會保留上下文，讓脈絡自然展開。"}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomeWorkspace({
  meta,
  metaError,
  messages,
  question,
  setQuestion,
  chatPending,
  chatError,
  ask,
  scrollRef,
  latestAssistant,
  selectedNode,
  selectNode,
  setInspectorOpen
}: {
  meta: MetaPayload | null;
  metaError: string;
  messages: ChatMessage[];
  question: string;
  setQuestion: (value: string) => void;
  chatPending: boolean;
  chatError: string;
  ask: (question: string) => Promise<void>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  latestAssistant: ChatMessage | undefined;
  selectedNode: NodePayload["node"] | null;
  selectNode: (nodeId: string, shouldOpen?: boolean) => Promise<void>;
  setInspectorOpen: (open: boolean) => void;
}) {
  return (
    <main className="relative h-[100svh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(112,210,192,0.13),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.08),transparent_18%)]" />
        <div className="surface-grid absolute inset-0 opacity-40" />
      </div>

      <header className="border-b border-white/45 bg-background/78 backdrop-blur-xl">
        <div className="landing-shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/72 shadow-[0_14px_35px_rgba(16,35,53,0.08)]">
              <Orbit className="size-5 text-foreground" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Home Workspace</div>
              <div className="text-sm font-semibold tracking-tight">Graphify Atlas</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <MetricPill label="模型" value={meta?.summary?.model ?? "gpt-5.4-mini"} />
            <MetricPill label="節點" value={String(meta?.summary?.nodes ?? "—")} />
            <MetricPill label="來源" value={String(latestAssistant?.sourceFiles?.length ?? 0)} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-full bg-white/70 px-4 text-sm font-medium text-foreground/72 transition-colors hover:bg-white/90"
            >
              Landing
            </Link>
            <Button onClick={() => setInspectorOpen(true)} className="rounded-full shadow-[0_20px_45px_rgba(17,31,53,0.14)]">
              <PanelRightOpen data-icon="inline-start" />
              證據艙
            </Button>
          </div>
        </div>
      </header>

      <div className="landing-shell flex h-[calc(100svh-4rem)] min-h-0 py-4">
        <div className="studio-shell grid h-full min-h-0 w-full overflow-hidden rounded-[34px] border border-white/70 bg-white/74 shadow-[0_28px_80px_rgba(17,31,53,0.12)] backdrop-blur-2xl xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="hidden min-h-0 flex-col border-r border-border/70 bg-white/42 xl:flex">
            <div className="border-b border-border/70 px-5 py-5">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Atlas Rail</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">工作區導覽</div>
              <div className="mt-3 text-sm leading-7 text-muted-foreground">
                先鎖定主題，再把問題丟進中間畫布。左邊負責方向，中央負責推進。
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-5 px-5 py-5">
                {meta ? (
                  <div className="grid gap-3">
                    <MetricPill label="文件" value={String(meta.summary?.documents ?? "—")} />
                    <MetricPill label="圖片" value={String(meta.summary?.images_detected ?? "—")} />
                    <MetricPill label="社群" value={String(meta.summary?.communities ?? "—")} />
                  </div>
                ) : metaError ? (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>圖譜資訊無法載入</AlertTitle>
                    <AlertDescription>{metaError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-3">
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                  </div>
                )}

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <Sparkles className="size-4" />
                    快速帶入
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {starterQuestions.map((item) => (
                      <button
                        key={`home-prompt-${item}`}
                        type="button"
                        onClick={() => setQuestion(item)}
                        className="rounded-[18px] border border-white/70 bg-white/78 px-4 py-4 text-left text-sm leading-6 text-foreground transition hover:-translate-y-0.5 hover:border-foreground/20"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <Layers3 className="size-4" />
                    主題社群
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {meta?.communities.slice(0, 7).map((community) => (
                      <button
                        key={`${community.community}-${community.label}`}
                        type="button"
                        onClick={() => setQuestion(`${community.label} 相關流程與重點`)}
                        className="rounded-[18px] border border-white/70 bg-white/76 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-foreground/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 break-words text-sm font-medium text-foreground">{community.label}</div>
                          <Badge variant="outline">{community.count}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-border/70 bg-white/58 px-6 py-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <MessagesSquare className="size-4" />
                    Conversation Canvas
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">直接操作你的知識現場。</div>
                  <div className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    回答、圖片、表格、節點與來源會保持在同一個固定工作台，不需要整頁捲動。
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{messages.length} 則對話</Badge>
                  <Badge variant="outline">{latestAssistant?.retrieved?.length ?? 0} 個節點</Badge>
                  <Badge variant="outline">{chatPending ? "推理中" : "穩定"}</Badge>
                </div>
              </div>

              <div className="mt-5">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-1">
                    {starterQuestions.map((item) => (
                      <button
                        key={`home-quick-${item}`}
                        type="button"
                        onClick={() => void ask(item)}
                        className="rounded-full border border-white/70 bg-white/80 px-4 py-3 text-sm text-foreground transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div ref={scrollRef} className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-6 py-8">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="rounded-[26px] border border-white/70 bg-white/78 px-5 py-5 shadow-[0_20px_50px_rgba(17,31,53,0.08)]">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">當前上下文</div>
                    <div className="mt-3 text-sm leading-7 text-foreground/74">
                      {latestAssistant?.content
                        ? "系統會沿用上一輪回答的檢索脈絡，並把最新焦點節點同步到右側。"
                        : "從左側挑一個主題，或直接輸入你的問題。"}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/70 bg-white/78 px-5 py-5 shadow-[0_20px_50px_rgba(17,31,53,0.08)]">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">目前焦點</div>
                    <div className="mt-3 text-sm leading-7 text-foreground/74">
                      {selectedNode?.label ?? latestAssistant?.retrieved?.[0]?.label ?? "等待新的提問"}
                    </div>
                  </div>
                </div>

                {messages.map((message, index) => (
                  <ThreadMessage key={`${message.role}-${index}`} message={message} onInspect={(nodeId) => void selectNode(nodeId, true)} />
                ))}

                {chatPending ? (
                  <div className="max-w-[92%] rounded-[30px] border border-white/70 bg-white/82 px-5 py-5 shadow-[0_22px_55px_rgba(17,31,53,0.08)] backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <LoaderCircle className="animate-spin text-foreground" />
                      正在整理圖譜上下文與引用來源。
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <div className="border-t border-border/70 bg-white/70 px-6 py-5 backdrop-blur-xl">
              {chatError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle />
                  <AlertTitle>暫時無法完成回答</AlertTitle>
                  <AlertDescription>{chatError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <Textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void ask(question);
                    }
                  }}
                  placeholder="例如：整理工地週轉金申請流程，並指出重要表格與相關圖片。"
                  className="min-h-[128px] resize-none rounded-[28px] border-white/70 bg-white/85 px-5 py-5 text-base shadow-[0_18px_40px_rgba(17,31,53,0.06)]"
                />

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => void ask(question)}
                    disabled={chatPending || !question.trim()}
                    size="lg"
                    className="rounded-[22px] shadow-[0_20px_45px_rgba(17,31,53,0.14)]"
                  >
                    送出問題
                    <SendHorizonal data-icon="inline-end" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setQuestion(starterQuestions[0])}
                    disabled={chatPending}
                    className="rounded-[22px] bg-white/80"
                  >
                    帶入範例
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setInspectorOpen(true)}
                    className="rounded-[22px]"
                  >
                    打開證據艙
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <SignalRail
            meta={meta}
            selectedNode={selectedNode}
            latestAssistant={latestAssistant}
            openInspector={() => setInspectorOpen(true)}
            setQuestion={setQuestion}
          />
        </div>
      </div>
    </main>
  );
}

export function KnowledgeStudio({
  mode = "landing"
}: {
  mode?: "landing" | "home";
}) {
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [metaError, setMetaError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "把你的制度、工法、會議與照片直接丟進來，我會把答案和證據一起拉到同一個工作台。"
    }
  ]);
  const [question, setQuestion] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<RetrievedNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodePayload["node"] | null>(null);
  const [chatPending, setChatPending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [nodePending, setNodePending] = useState(false);
  const [nodeError, setNodeError] = useState("");
  const [inspectorTab, setInspectorTab] = useState("focus");
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/meta")
      .then(async (res) => {
        if (!res.ok) throw new Error("meta failed");
        return (await res.json()) as MetaPayload;
      })
      .then((data) => setMeta(data))
      .catch(() => setMetaError("讀取知識庫摘要失敗，請確認 graphify-out 與 API 是否正常。"));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const query = deferredSearch.trim();
    if (query.length < 2) {
      setResults([]);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    setSearchPending(true);
    setInspectorTab("atlas");

    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=9`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("search failed");
        return (await res.json()) as { results?: RetrievedNode[] };
      })
      .then((data) => {
        setResults(data.results ?? []);
        setSearchError("");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setSearchError("搜尋節點失敗，請稍後再試。");
        }
      })
      .finally(() => setSearchPending(false));

    return () => controller.abort();
  }, [deferredSearch]);

  async function selectNode(nodeId: string, shouldOpen = true) {
    setNodePending(true);
    setNodeError("");
    setInspectorTab("focus");

    try {
      const response = await fetch(`/api/node/${encodeURIComponent(nodeId)}`);
      if (!response.ok) throw new Error("node failed");
      const data = (await response.json()) as NodePayload;
      setSelectedNode(data.node);
      if (shouldOpen) setInspectorOpen(true);
    } catch {
      setNodeError("節點細節載入失敗，請重新點一次，或先用搜尋縮小範圍。");
      if (shouldOpen) setInspectorOpen(true);
    } finally {
      setNodePending(false);
    }
  }

  async function ask(nextQuestion: string) {
    const clean = nextQuestion.trim();
    if (!clean || chatPending) return;

    startTransition(() => {
      setMessages((current) => [...current, { role: "user", content: clean }]);
      setQuestion("");
    });
    setChatPending(true);
    setChatError("");

    const history = messages.map((message) => ({ role: message.role, content: message.content }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, history })
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
        retrieved?: RetrievedNode[];
        sourceFiles?: string[];
        images?: ChatImage[];
      };
      if (!response.ok) throw new Error(data.error || "chat failed");

      startTransition(() => {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.answer ?? "",
            retrieved: data.retrieved,
            sourceFiles: data.sourceFiles,
            images: data.images
          }
        ]);
      });

      if (data.retrieved?.[0]?.id) {
        void selectNode(data.retrieved[0].id, false);
      }
    } catch {
      setChatError("問答服務暫時無法回應，請稍後再試。");
    } finally {
      setChatPending(false);
    }
  }

  const latestAssistant = [...messages].reverse().find((item) => item.role === "assistant" && item.retrieved?.length);

  const isHome = mode === "home";

  if (isHome) {
    return (
      <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <HomeWorkspace
          meta={meta}
          metaError={metaError}
          messages={messages}
          question={question}
          setQuestion={setQuestion}
          chatPending={chatPending}
          chatError={chatError}
          ask={ask}
          scrollRef={scrollRef}
          latestAssistant={latestAssistant}
          selectedNode={selectedNode}
          selectNode={selectNode}
          setInspectorOpen={setInspectorOpen}
        />

        <DialogContent className="h-[94vh] w-[min(99vw,1820px)] max-w-none overflow-hidden rounded-[34px] border border-white/70 bg-white/88 p-0 shadow-[0_35px_100px_rgba(17,31,53,0.18)] backdrop-blur-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>證據艙</DialogTitle>
            <DialogDescription>查看節點、搜尋結果與引用來源。</DialogDescription>
          </DialogHeader>

          <div className="flex h-full min-h-0 flex-col">
            <InspectorContent
              search={search}
              setSearch={setSearch}
              searchPending={searchPending}
              results={results}
              searchError={searchError}
              selectedNode={selectedNode}
              nodePending={nodePending}
              nodeError={nodeError}
              inspectNode={(nodeId) => void selectNode(nodeId, true)}
              latestAssistant={latestAssistant}
              meta={meta}
              inspectorTab={inspectorTab}
              setInspectorTab={setInspectorTab}
              filesExpanded={filesExpanded}
              setFilesExpanded={setFilesExpanded}
              reportExpanded={reportExpanded}
              setReportExpanded={setReportExpanded}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
      <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="motion-float-slow absolute left-[6%] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(113,206,187,0.28),transparent_72%)]" />
          <div className="motion-float-delay absolute right-[8%] top-[18rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(42,89,170,0.16),transparent_74%)]" />
          <div className="motion-pulse-soft absolute bottom-[18%] left-[32%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,213,165,0.18),transparent_70%)]" />
          <div className="surface-grid absolute inset-0 opacity-50" />
        </div>

        <header className="sticky top-0 z-40 border-b border-white/40 bg-background/72 backdrop-blur-xl">
          <div className="landing-shell flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 shadow-[0_14px_35px_rgba(16,35,53,0.08)]">
                <Orbit className="size-5 text-foreground" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Graphify Atlas</div>
                <div className="text-sm font-semibold tracking-tight">Interactive Knowledge Workspace</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <MetricPill label="模型" value={meta?.summary?.model ?? "gpt-5.4-mini"} />
              <MetricPill label="節點" value={String(meta?.summary?.nodes ?? "—")} />
              <MetricPill label="圖片" value={String(meta?.summary?.images_detected ?? "—")} />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors",
                  isHome
                    ? "bg-white/70 text-foreground/72 hover:bg-white/85"
                    : "border border-border bg-white/78 text-foreground"
                )}
              >
                Landing
              </Link>
              <Link
                href="/home"
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors",
                  isHome
                    ? "border border-border bg-white/78 text-foreground"
                    : "bg-white/70 text-foreground/72 hover:bg-white/85"
                )}
              >
                Home
              </Link>
              {!isHome ? (
                <Button variant="ghost" onClick={() => scrollToTarget("workspace")} className="rounded-full">
                  工作台
                </Button>
              ) : null}
              <Button onClick={() => setInspectorOpen(true)} className="rounded-full shadow-[0_20px_45px_rgba(17,31,53,0.14)]">
                <PanelRightOpen data-icon="inline-start" />
                證據艙
              </Button>
            </div>
          </div>
        </header>

        {!isHome ? (
          <>
            <section className="relative isolate">
              <div className="landing-shell grid min-h-[calc(100svh-4rem)] items-center gap-14 py-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(430px,0.97fr)]">
                <div className="reveal-up max-w-[780px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/70 px-4 py-2 text-sm shadow-[0_18px_45px_rgba(16,35,53,0.08)] backdrop-blur-xl">
                    <Sparkles className="size-4 text-foreground" />
                    把知識庫變成可回應的現場
                  </div>

                  <h1 className="mt-8 max-w-[10ch] text-[clamp(3.4rem,8vw,7.6rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-foreground">
                    讓制度、照片與表格一起回話。
                  </h1>

                  <p className="mt-8 max-w-[34rem] text-lg leading-8 text-foreground/72">
                    這不是把聊天框套在文件上，而是把圖譜、來源、影像和關聯路徑折進同一個工作台。你提問，知識現場直接展開。
                  </p>

                  <div className="mt-10 flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      onClick={() => scrollToTarget("workspace")}
                      className="rounded-full px-6 shadow-[0_22px_50px_rgba(16,35,53,0.16)]"
                    >
                      進入工作台
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                    <Link
                      href="/home"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white/70 px-6 text-sm font-medium text-foreground transition-colors hover:bg-white/90"
                    >
                      直接打開 Home
                    </Link>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => scrollToTarget("story")}
                      className="rounded-full bg-white/70 px-6"
                    >
                      看它怎麼工作
                    </Button>
                  </div>

                  <div className="mt-12 flex flex-wrap gap-3">
                    {starterQuestions.map((item) => (
                      <button
                        key={`hero-${item}`}
                        type="button"
                        onClick={() => {
                          setQuestion(item);
                          scrollToTarget("workspace");
                        }}
                        className="rounded-full border border-white/55 bg-white/72 px-4 py-3 text-sm text-foreground transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_35px_rgba(16,35,53,0.08)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="mt-12 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <MetricPill label="文件" value={String(meta?.summary?.documents ?? "51")} />
                    <MetricPill label="關聯邊" value={String(meta?.summary?.edges ?? "—")} />
                    <MetricPill label="社群" value={String(meta?.summary?.communities ?? "—")} />
                  </div>
                </div>

                <div className="relative min-h-[640px]">
                  <div className="motion-float-slow absolute inset-x-10 top-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75),rgba(255,255,255,0))]" />
                  <div className="relative h-full overflow-hidden rounded-[42px] border border-white/65 bg-white/78 shadow-[0_28px_80px_rgba(17,31,53,0.12)] backdrop-blur-2xl">
                    <div className="surface-grid absolute inset-0 opacity-70" />
                    <div className="absolute -right-20 top-8 h-48 w-48 rounded-full border border-white/60" />
                    <div className="absolute right-10 top-20 h-24 w-24 rounded-full border border-white/70 motion-orbit" />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
                        <div>
                          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Live Surface</div>
                          <div className="mt-2 text-xl font-semibold tracking-tight">Knowledge is staged, not buried</div>
                        </div>
                        <Badge variant="outline">{meta?.summary?.model ?? "gpt-5.4-mini"}</Badge>
                      </div>

                      <div className="grid flex-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="flex flex-col justify-between gap-6">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Prompt</div>
                            <div className="mt-4 rounded-[30px] bg-foreground px-5 py-5 text-sm leading-7 text-background shadow-[0_20px_50px_rgba(17,31,53,0.18)]">
                              保固及維修跟完工點交有什麼關聯？請一起帶出責任單位與相關圖像。
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Badge variant="outline">會連動節點</Badge>
                              <Badge variant="outline">會拉出來源</Badge>
                              <Badge variant="outline">會顯示圖片與表格</Badge>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[24px] border border-white/70 bg-white/72 px-4 py-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Documents</div>
                              <div className="mt-3 text-3xl font-semibold tracking-tight">{meta?.summary?.documents ?? 51}</div>
                            </div>
                            <div className="rounded-[24px] border border-white/70 bg-white/72 px-4 py-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Nodes</div>
                              <div className="mt-3 text-3xl font-semibold tracking-tight">{meta?.summary?.nodes ?? "—"}</div>
                            </div>
                            <div className="rounded-[24px] border border-white/70 bg-white/72 px-4 py-4">
                              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Images</div>
                              <div className="mt-3 text-3xl font-semibold tracking-tight">{meta?.summary?.images_detected ?? "—"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="overflow-hidden rounded-[26px] border border-white/70 bg-white/72">
                            <div className="aspect-[4/5] overflow-hidden bg-muted">
                              {selectedNode?.images?.[0] ? (
                                <img
                                  src={selectedNode.images[0].url}
                                  alt={selectedNode.images[0].label}
                                  className="h-full w-full object-cover"
                                />
                              ) : latestAssistant?.images?.[0] ? (
                                <img
                                  src={latestAssistant.images[0].url}
                                  alt={latestAssistant.images[0].label}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full flex-col justify-between bg-[linear-gradient(180deg,rgba(245,247,250,0.96),rgba(224,232,240,0.92))] p-5">
                                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visual Evidence</div>
                                  <div className="space-y-3">
                                    <div className="h-20 rounded-[18px] border border-white/70 bg-white/80" />
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="h-16 rounded-[16px] border border-white/70 bg-white/80" />
                                      <div className="h-16 rounded-[16px] border border-white/70 bg-white/80" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/70 bg-white/72 px-4 py-4">
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Focus</div>
                            <div className="mt-3 text-sm leading-7 text-foreground">
                              {selectedNode?.label ?? "回答後會自動同步最相關節點，讓你一路往下追索。"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <StoryShowcase />
          </>
        ) : null}

        <section id="workspace" className={cn("landing-shell", isHome ? "py-10" : "py-24")}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Workspace</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">從任何一句話切進你的知識現場。</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-foreground/70">
                中央是對話畫布，右側是同步中的脈絡，證據艙則負責把節點、表格、圖片與來源拉到前景。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <MetricPill label="社群" value={String(meta?.summary?.communities ?? "—")} />
              <MetricPill label="來源" value={String(latestAssistant?.sourceFiles?.length ?? 0)} />
              <MetricPill label="連線" value={chatPending ? "推理中" : "穩定"} />
            </div>
          </div>

          <div className="studio-shell relative overflow-hidden rounded-[42px] border border-white/70 bg-white/74 shadow-[0_30px_95px_rgba(17,31,53,0.12)] backdrop-blur-2xl">
            <div className="surface-grid absolute inset-0 opacity-70" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/12 to-transparent" />

            <div className="relative grid min-h-[980px] xl:grid-cols-[260px_minmax(0,1fr)_320px] lg:min-h-[calc(100svh-6rem)]">
              <aside className="hidden min-h-0 flex-col border-r border-border/70 bg-white/45 xl:flex">
                <div className="border-b border-border/70 px-6 py-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Atlas Rail</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">Graphify Atlas</div>
                  <div className="mt-3 text-sm leading-7 text-muted-foreground">
                    讓知識圖譜維持在視野邊緣，你會更快找到下一個切入點。
                  </div>
                </div>

                <ScrollArea className="min-h-0 flex-1">
                  <div className="flex flex-col gap-5 px-6 py-6">
                    {meta ? (
                      <div className="grid gap-3">
                        <MetricPill label="文件" value={String(meta.summary?.documents ?? "—")} />
                        <MetricPill label="節點" value={String(meta.summary?.nodes ?? "—")} />
                        <MetricPill label="影像" value={String(meta.summary?.images_detected ?? "—")} />
                      </div>
                    ) : metaError ? (
                      <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>圖譜資訊無法載入</AlertTitle>
                        <AlertDescription>{metaError}</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid gap-3">
                        <Skeleton className="h-16 rounded-2xl" />
                        <Skeleton className="h-16 rounded-2xl" />
                        <Skeleton className="h-16 rounded-2xl" />
                      </div>
                    )}

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        <Layers3 className="size-4" />
                        主題社群
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        {meta?.communities.slice(0, 6).map((community) => (
                          <div key={`${community.community}-${community.label}`} className="rounded-[22px] border border-white/70 bg-white/75 px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 break-words text-sm font-medium text-foreground">{community.label}</div>
                              <Badge variant="outline">{community.count}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="border-b border-border/70 bg-white/60 px-6 py-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        <MessagesSquare className="size-4" />
                        Conversation Canvas
                      </div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight">把問題直接拋進工作流。</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{meta?.summary?.model ?? "gpt-5.4-mini"}</Badge>
                      <Badge variant="outline">{messages.length} 則對話</Badge>
                      <Badge variant="outline">{latestAssistant?.retrieved?.length ?? 0} 個節點</Badge>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-2 pb-1">
                        {starterQuestions.map((item) => (
                          <button
                            key={`quick-${item}`}
                            type="button"
                            onClick={() => void ask(item)}
                            className="rounded-full border border-white/70 bg-white/78 px-4 py-3 text-sm text-foreground transition duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <ScrollArea className="min-h-0 flex-1">
                  <div ref={scrollRef} className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="rounded-[28px] border border-white/70 bg-white/76 px-5 py-5 shadow-[0_20px_50px_rgba(17,31,53,0.08)]">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Session Tone</div>
                        <div className="mt-3 text-sm leading-7 text-foreground/74">
                          你現在的回答會自動帶入圖譜檢索、來源文件和影像資產，不需要切到其他工具。
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/70 bg-white/76 px-5 py-5 shadow-[0_20px_50px_rgba(17,31,53,0.08)]">
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest Sync</div>
                        <div className="mt-3 text-sm leading-7 text-foreground/74">
                          {selectedNode?.label ?? latestAssistant?.retrieved?.[0]?.label ?? "等待新的提問"}
                        </div>
                      </div>
                    </div>

                    {messages.map((message, index) => (
                      <ThreadMessage key={`${message.role}-${index}`} message={message} onInspect={(nodeId) => void selectNode(nodeId, true)} />
                    ))}

                    {chatPending ? (
                      <div className="max-w-[92%] rounded-[30px] border border-white/70 bg-white/82 px-5 py-5 shadow-[0_22px_55px_rgba(17,31,53,0.08)] backdrop-blur-xl">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <LoaderCircle className="animate-spin text-foreground" />
                          正在整理圖譜上下文與引用來源。
                        </div>
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>

                <div className="border-t border-border/70 bg-white/70 px-6 py-5 backdrop-blur-xl">
                  {chatError ? (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle />
                      <AlertTitle>暫時無法完成回答</AlertTitle>
                      <AlertDescription>{chatError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                    <Textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void ask(question);
                        }
                      }}
                      placeholder="例如：整理工地週轉金申請流程，並指出重要表格與相關圖片。"
                      className="min-h-[128px] resize-none rounded-[28px] border-white/70 bg-white/85 px-5 py-5 text-base shadow-[0_18px_40px_rgba(17,31,53,0.06)]"
                    />

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => void ask(question)}
                        disabled={chatPending || !question.trim()}
                        size="lg"
                        className="rounded-[22px] shadow-[0_20px_45px_rgba(17,31,53,0.14)]"
                      >
                        送出問題
                        <SendHorizonal data-icon="inline-end" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setQuestion(starterQuestions[0])}
                        disabled={chatPending}
                        className="rounded-[22px] bg-white/80"
                      >
                        帶入範例
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setInspectorOpen(true)}
                        className="rounded-[22px]"
                      >
                        打開證據艙
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <SignalRail
                meta={meta}
                selectedNode={selectedNode}
                latestAssistant={latestAssistant}
                openInspector={() => setInspectorOpen(true)}
                setQuestion={setQuestion}
              />
            </div>
          </div>
        </section>

        <section className="landing-shell pb-24">
          <div className="overflow-hidden rounded-[36px] border border-white/65 bg-white/76 px-8 py-10 shadow-[0_26px_70px_rgba(17,31,53,0.1)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Closing Loop</div>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">下一個問題，不必先知道答案藏在哪裡。</h3>
                <p className="mt-4 text-base leading-8 text-foreground/70">
                  從制度、工法、照片、會議到責任單位，Graphify Atlas 會把脈絡和證據一起推到前景。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => scrollToTarget("workspace")} size="lg" className="rounded-full px-6">
                  立即開始
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => setInspectorOpen(true)} className="rounded-full bg-white/80 px-6">
                  查看證據艙
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="pointer-events-none fixed bottom-5 right-5 z-30">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/70 blur-2xl" />
            <Button
              size="lg"
              onClick={() => setInspectorOpen(true)}
              className="pointer-events-auto relative h-14 rounded-full px-5 shadow-[0_22px_55px_rgba(17,31,53,0.18)]"
            >
              <PanelRightOpen data-icon="inline-start" />
              證據艙
            </Button>
          </div>
        </div>

        <DialogContent className="h-[94vh] w-[min(99vw,1820px)] max-w-none overflow-hidden rounded-[34px] border border-white/70 bg-white/88 p-0 shadow-[0_35px_100px_rgba(17,31,53,0.18)] backdrop-blur-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>證據艙</DialogTitle>
            <DialogDescription>查看節點、搜尋結果與引用來源。</DialogDescription>
          </DialogHeader>

          <div className="flex h-full min-h-0 flex-col">
            <InspectorContent
              search={search}
              setSearch={setSearch}
              searchPending={searchPending}
              results={results}
              searchError={searchError}
              selectedNode={selectedNode}
              nodePending={nodePending}
              nodeError={nodeError}
              inspectNode={(nodeId) => void selectNode(nodeId, true)}
              latestAssistant={latestAssistant}
              meta={meta}
              inspectorTab={inspectorTab}
              setInspectorTab={setInspectorTab}
              filesExpanded={filesExpanded}
              setFilesExpanded={setFilesExpanded}
              reportExpanded={reportExpanded}
              setReportExpanded={setReportExpanded}
            />
          </div>
        </DialogContent>
      </main>
    </Dialog>
  );
}
