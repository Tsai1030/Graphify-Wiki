"use client";

import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Compass,
  FileStack,
  FolderSearch2,
  ImageIcon,
  LoaderCircle,
  MessagesSquare,
  Network,
  PanelRightOpen,
  Search,
  SendHorizonal,
  Sparkles,
  TableProperties
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

function MetaMetric({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-background px-3 py-3">
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="shrink-0 text-xl font-semibold tracking-tight text-foreground">{value}</div>
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
    <div className="mt-4 flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">回覆相關圖片</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <div key={image.path} className="overflow-hidden rounded-2xl border border-border bg-background">
            <a href={image.url} target="_blank" rel="noreferrer" className="block">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={image.url} alt={image.label} className="h-full w-full object-cover" />
              </div>
            </a>
            <div className="flex flex-col gap-2 px-3 py-3">
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
      <div className="ml-auto max-w-[84%] min-w-0 rounded-[26px] bg-primary px-4 py-4 text-primary-foreground shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/70">
          <Compass className="size-4" />
          你的問題
        </div>
        <div className="break-words whitespace-pre-wrap text-sm leading-7">{message.content}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[92%] min-w-0 rounded-[28px] border border-border bg-white px-4 py-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <Bot />
          Graphify
        </Badge>
        {message.retrieved?.length ? <Badge variant="outline">已連到 {message.retrieved.length} 個節點</Badge> : null}
      </div>

      <div className="break-words whitespace-pre-wrap text-sm leading-7 text-foreground">{message.content}</div>

      <InlineImageGallery images={message.images ?? []} onInspect={onInspect} />

      {message.retrieved?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {message.retrieved.slice(0, 5).map((node) => (
            <Button
              key={`${message.content}-${node.id}`}
              variant="outline"
              size="sm"
              onClick={() => onInspect(node.id)}
              className="max-w-full rounded-full"
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
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-3 text-sm font-medium text-foreground">
        <TableProperties className="size-4 text-muted-foreground" />
        <span className="break-words">{table.title}</span>
      </div>
      <div className="scroll-thin overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-muted">
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
              <tr key={`${table.title}-${rowIndex}`} className="border-t border-border">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${table.title}-${rowIndex}-${cellIndex}`}
                    className="max-w-[280px] break-words px-3 py-2 align-top text-foreground/80"
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
        <AlertTitle>節點載入失敗</AlertTitle>
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
      <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-sm leading-7 text-muted-foreground">
        還沒有選取節點。先在中間發問，或點右下角浮動檢視器後搜尋主題。
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
          <div className="break-words text-lg font-semibold text-foreground">{node.label}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{node.communityLabel}</Badge>
            <Badge variant="outline">{node.images.length} 圖片</Badge>
            <Badge variant="outline">{node.tables.length} 表格</Badge>
          </div>
        </div>
        <Badge variant={loading ? "secondary" : "outline"}>{loading ? "更新中" : "就緒"}</Badge>
      </div>

      {node.source_file ? (
        <div className="rounded-xl bg-muted px-3 py-2 font-[var(--font-mono)] text-[11px] leading-5 text-muted-foreground break-all">
          {node.source_file}
        </div>
      ) : null}

      {node.summary ? <div className="break-words text-sm leading-7 text-foreground/80">{node.summary}</div> : null}

      {node.images.length ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <ImageIcon className="size-4" />
              圖片
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
                className="overflow-hidden rounded-2xl border border-border bg-background transition hover:border-foreground/20"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={image.url} alt={image.label} className="h-full w-full object-cover" />
                </div>
                <div className="border-t border-border px-3 py-3">
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
          <div className="rounded-2xl bg-foreground px-4 py-4 font-[var(--font-mono)] text-xs leading-6 text-background">
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
                className="h-auto min-w-0 justify-start px-3 py-3 text-left"
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
  const reportText = meta?.reportExcerpt ?? "目前尚未載入摘要。";
  const visibleReportText = reportExpanded || reportText.length <= 900 ? reportText : `${reportText.slice(0, 900)}...`;

  return (
    <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Evidence</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">浮動檢視器</div>
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
              placeholder="搜尋節點：工務所、估驗、保固..."
              className="pl-9"
            />
          </div>
          {searchPending && !results.length ? <Skeleton className="mt-3 h-10 rounded-xl" /> : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-5 py-5">
        <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="h-full min-h-0 gap-4">
          <TabsList variant="line" className="hidden w-full justify-start rounded-none px-0">
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

          <TabsContent value="focus" className="mt-0 min-h-0 flex-1 outline-none">
            <ScrollArea className="h-full min-h-0">
              <div className="mx-auto min-h-full w-full max-w-[1360px] min-w-0 pr-4">
                <SelectedNodePanel
                  node={selectedNode}
                  loading={nodePending}
                  error={nodeError}
                  onInspect={inspectNode}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="atlas" className="mt-0 min-h-0 flex-1 outline-none">
            <ScrollArea className="h-full min-h-0">
              <div className="mx-auto flex min-h-full w-full max-w-[1360px] min-w-0 flex-col gap-3 pr-4">
                {searchError ? (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>搜尋失敗</AlertTitle>
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
                      className="h-auto min-w-0 justify-start rounded-2xl px-3 py-3 text-left"
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
                  <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm leading-7 text-muted-foreground">
                    輸入至少兩個字開始搜尋，或先從對話裡點一個節點。
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="mt-0 min-h-0 flex-1 outline-none">
            <ScrollArea className="h-full min-h-0">
              <div className="mx-auto flex min-h-full w-full max-w-[1360px] min-w-0 flex-col gap-5 pr-4">
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
                          className="rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground/80 break-all"
                        >
                          {source}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm leading-7 text-muted-foreground">
                        還沒有來源文件。發問後，這裡會列出本輪實際引用的檔案。
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
                  <div className="mt-3 rounded-2xl bg-foreground px-4 py-4 font-[var(--font-mono)] text-xs leading-6 text-background">
                    <div className="scroll-thin max-h-[360px] overflow-y-auto whitespace-pre-wrap break-words">
                      {visibleReportText}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </Tabs>
  );
}

export function KnowledgeStudio() {
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [metaError, setMetaError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "直接問我流程、表單、責任單位、圖像或表格。我會根據你的 Graphify 知識庫回答，並把證據同步到檢視器。"
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
      if (shouldOpen) {
        setInspectorOpen(true);
      }
    } catch {
      setNodeError("節點細節載入失敗，請重新點一次，或先用搜尋縮小範圍。");
      if (shouldOpen) {
        setInspectorOpen(true);
      }
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
      setChatError("問答服務暫時失敗，請稍後再試，或先打開檢視器搜尋節點。");
    } finally {
      setChatPending(false);
    }
  }

  const latestAssistant = [...messages].reverse().find((item) => item.role === "assistant" && item.retrieved?.length);

  return (
    <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
      <main className="h-screen overflow-hidden bg-background text-foreground">
        <div className="mx-auto h-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="kb-panel hidden h-[calc(100vh-2rem)] min-h-0 overflow-hidden xl:flex xl:flex-col">
              <div className="border-b border-border px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Graphify</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">Knowledge Console</div>
                  </div>
                  <Badge variant={chatPending ? "secondary" : "outline"}>{chatPending ? "推理中" : "已連線"}</Badge>
                </div>
                <div className="mt-3 text-sm leading-7 text-muted-foreground">
                  左邊快速找主題，中間對答，右下角再叫出浮動檢視器。
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-5 px-5 py-5">
                  {meta ? (
                    <div className="flex flex-col gap-2">
                      <MetaMetric label="Documents" value={String(meta.summary?.documents ?? "—")} hint="已建庫文件" />
                      <MetaMetric label="Nodes" value={String(meta.summary?.nodes ?? "—")} hint="關聯節點數" />
                      <MetaMetric label="Images" value={String(meta.summary?.images_detected ?? "—")} hint="已連到圖片" />
                    </div>
                  ) : metaError ? (
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <AlertTitle>摘要載入失敗</AlertTitle>
                      <AlertDescription>{metaError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-16 rounded-2xl" />
                      <Skeleton className="h-16 rounded-2xl" />
                      <Skeleton className="h-16 rounded-2xl" />
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <Sparkles className="size-4" />
                      快速開始
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {starterQuestions.map((item) => (
                        <Button
                          key={item}
                          variant="ghost"
                          size="sm"
                          onClick={() => void ask(item)}
                          className="h-auto min-w-0 justify-start rounded-2xl px-3 py-3 text-left"
                        >
                          <span className="break-words whitespace-normal">{item}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <FolderSearch2 className="size-4" />
                      主題社群
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {meta?.communities.slice(0, 6).map((community) => (
                        <div key={`${community.community}-${community.label}`} className="rounded-2xl bg-background px-3 py-3">
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

            <section className="kb-panel flex h-[calc(100vh-2rem)] min-h-0 min-w-0 flex-col overflow-hidden">
              <div className="border-b border-border px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <MessagesSquare className="size-4" />
                      主對話區
                    </div>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">把問題直接丟進知識庫</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                      問流程、問表格、問責任單位，或直接指定要看圖片。回答會自動連動知識節點。
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{meta?.summary?.model ?? "gpt-5.4-mini"}</Badge>
                    <Badge variant="outline">{messages.length} 則對話</Badge>
                    <Badge variant="outline">{latestAssistant?.sourceFiles?.length ?? 0} 份來源</Badge>
                  </div>
                </div>
              </div>

              <div className="border-b border-border px-5 py-4">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pr-4">
                    {starterQuestions.map((item) => (
                      <Button
                        key={`quick-${item}`}
                        variant="outline"
                        size="sm"
                        onClick={() => void ask(item)}
                        className="rounded-full"
                      >
                        <Sparkles data-icon="inline-start" />
                        {item}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div ref={scrollRef} className="flex min-w-0 flex-col gap-5 px-5 py-5">
                  {messages.map((message, index) => (
                    <ThreadMessage key={`${message.role}-${index}`} message={message} onInspect={(nodeId) => void selectNode(nodeId, true)} />
                  ))}

                  {chatPending ? (
                    <div className="max-w-[92%] rounded-[28px] border border-border bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <LoaderCircle className="animate-spin text-foreground" />
                        正在從知識圖譜整理上下文並生成回答…
                      </div>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="border-t border-border bg-muted/35 px-5 py-5">
                {chatError ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle />
                    <AlertTitle>問答服務暫時失敗</AlertTitle>
                    <AlertDescription>{chatError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="rounded-[28px] border border-border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Command Input</div>
                    <div className="text-xs text-muted-foreground">Enter 送出，Shift + Enter 換行</div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                    <Textarea
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void ask(question);
                        }
                      }}
                      placeholder="例如：請整理工地週轉金申請流程，並指出重要表格和相關圖片。"
                      className="min-h-[132px] resize-none rounded-[22px] bg-background"
                    />

                    <div className="flex flex-col gap-3">
                      <Button onClick={() => void ask(question)} disabled={chatPending || !question.trim()} size="lg">
                        發問
                        <SendHorizonal data-icon="inline-end" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setQuestion(starterQuestions[0])}
                        disabled={chatPending}
                      >
                        套用範例
                        <Sparkles data-icon="inline-end" />
                      </Button>
                      <div className="rounded-2xl bg-background px-3 py-3 text-sm leading-6 text-muted-foreground">
                        這裡只捲聊天內容。需要看節點、表格、圖片時，再打開右下角檢視器。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="pointer-events-none fixed bottom-5 right-5 z-30">
          {selectedNode ? (
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              className="pointer-events-auto mb-3 ml-auto block max-w-[220px] rounded-2xl border border-border bg-white/95 px-3 py-3 text-left shadow-card backdrop-blur"
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">目前焦點</div>
              <div className="mt-1 break-words text-sm font-medium text-foreground">{selectedNode.label}</div>
            </button>
          ) : null}

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/70 blur-2xl" />
            <Button
              size="lg"
              onClick={() => setInspectorOpen(true)}
              className="pointer-events-auto relative h-14 rounded-full px-5 shadow-glow"
            >
              <PanelRightOpen data-icon="inline-start" />
              打開檢視器
            </Button>
          </div>
        </div>

        <DialogContent className="h-[94vh] w-[min(99vw,1820px)] max-w-none overflow-hidden rounded-[32px] border border-white/70 bg-white/96 p-0 shadow-glow backdrop-blur-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>浮動檢視器</DialogTitle>
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
