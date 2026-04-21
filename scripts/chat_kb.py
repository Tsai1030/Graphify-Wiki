from __future__ import annotations

import argparse
import json
import os
import re
import textwrap
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from networkx.readwrite import json_graph
from openai import OpenAI


DEFAULT_MODEL = "gpt-5.4-mini"
SYSTEM_PROMPT = """你是企業內部知識庫助理。請只根據提供的 Graphify 知識圖譜上下文回答。

規則：
- 先直接回答使用者問題，再列出依據。
- 如果上下文不足，明確說「目前知識庫裡沒有足夠證據」。
- 不要假裝看過沒有提供的文件。
- 回答以繁體中文為主。
- 如果問題是流程題，盡量整理成步驟。
- 如果問題是責任題，指出角色、表單、控制點。
- 引用來源時優先用文件名稱或節點名稱，不要暴露太多內部技術細節。
"""


@dataclass
class RetrievedNode:
    node_id: str
    label: str
    score: float
    source_file: str
    summary: str
    community: Any


def load_graph(path: Path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    try:
        return json_graph.node_link_graph(raw, edges="links")
    except TypeError:
        return json_graph.node_link_graph(raw)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def read_text_with_fallback(path: Path) -> str:
    raw = path.read_bytes()
    for encoding in ("utf-8", "utf-8-sig", "cp950", "big5", "utf-16"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="ignore")


def tokenize(text: str) -> list[str]:
    lowered = text.lower()
    ascii_tokens = re.findall(r"[a-z0-9_]+", lowered)
    chinese_runs = re.findall(r"[\u4e00-\u9fff]{2,}", text)
    bigrams: list[str] = []
    for run in chinese_runs:
        if len(run) == 2:
            bigrams.append(run)
        else:
            bigrams.extend(run[i : i + 2] for i in range(len(run) - 1))
    single_cjk = re.findall(r"[\u4e00-\u9fff]", text)
    return ascii_tokens + chinese_runs + bigrams + single_cjk


def build_search_text(node_id: str, data: dict[str, Any]) -> str:
    parts = [
        node_id,
        str(data.get("label", "")),
        str(data.get("source_file", "")),
        str(data.get("summary", "")),
        str(data.get("norm_label", "")),
    ]
    return " ".join(parts)


def score_node(query: str, query_tokens: list[str], node_id: str, data: dict[str, Any], degree: int) -> float:
    label = str(data.get("label", ""))
    source_file = str(data.get("source_file", ""))
    summary = str(data.get("summary", ""))
    haystack = build_search_text(node_id, data).lower()
    score = 0.0

    if query.lower() in label.lower():
        score += 14
    if query.lower() in source_file.lower():
        score += 7
    if query.lower() in summary.lower():
        score += 5

    token_counts = Counter(tokenize(haystack))
    for token in query_tokens:
        if not token:
            continue
        token_count = token_counts.get(token, 0)
        if token_count:
            score += min(token_count, 3) * (3.0 if len(token) >= 2 else 0.8)

    if label and any(token in label for token in query_tokens if len(token) >= 2):
        score += 4

    score += min(degree, 40) * 0.05
    return score


def retrieve_nodes(graph, query: str, limit: int = 8) -> list[RetrievedNode]:
    query_tokens = tokenize(query)
    candidates: list[RetrievedNode] = []

    for node_id, data in graph.nodes(data=True):
        score = score_node(query, query_tokens, node_id, data, graph.degree(node_id))
        if score <= 0:
            continue
        candidates.append(
            RetrievedNode(
                node_id=node_id,
                label=str(data.get("label", node_id)),
                score=score,
                source_file=str(data.get("source_file", "")),
                summary=str(data.get("summary", "")),
                community=data.get("community"),
            )
        )

    candidates.sort(key=lambda item: (-item.score, -graph.degree(item.node_id), item.label))
    return candidates[:limit]


def format_edge(graph, source_id: str, target_id: str) -> str:
    edge = graph.edges[source_id, target_id]
    relation = edge.get("relation", "related_to")
    confidence = edge.get("confidence", "EXTRACTED")
    target_label = graph.nodes[target_id].get("label", target_id)
    return f"- {graph.nodes[source_id].get('label', source_id)} --{relation}/{confidence}--> {target_label}"


def snippet_for_file(project_root: Path, relative_path: str, limit: int = 1200) -> str:
    if not relative_path:
        return ""
    path = project_root / relative_path
    if not path.exists() or path.suffix.lower() not in {".md", ".txt"}:
        return ""
    text = read_text_with_fallback(path).strip()
    if not text:
        return ""
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text[:limit]


def build_context(
    project_root: Path,
    graph,
    retrieved: list[RetrievedNode],
    report_text: str,
    labels: dict[int, str],
) -> tuple[str, list[str]]:
    sections: list[str] = []
    sources: list[str] = []
    seen_sources: set[str] = set()

    if report_text:
        sections.append("## Graph Report Summary\n" + report_text[:2000])

    for node in retrieved:
        community_name = labels.get(int(node.community), f"Community {node.community}") if node.community is not None else "Unknown"
        header = [
            f"Node: {node.label}",
            f"ID: {node.node_id}",
            f"Community: {community_name}",
            f"Source: {node.source_file or '-'}",
            f"Summary: {node.summary or '-'}",
            "Connections:",
        ]

        neighbor_lines: list[str] = []
        neighbors = sorted(graph.neighbors(node.node_id), key=lambda nid: graph.degree(nid), reverse=True)
        for neighbor_id in neighbors[:8]:
            neighbor_lines.append(format_edge(graph, node.node_id, neighbor_id))

        if not neighbor_lines:
            neighbor_lines.append("- no direct connections captured")

        body = "\n".join(header + neighbor_lines)
        sections.append(body)

        if node.source_file and node.source_file not in seen_sources:
            seen_sources.add(node.source_file)
            sources.append(node.source_file)
            snippet = snippet_for_file(project_root, node.source_file)
            if snippet:
                sections.append(f"## Source Snippet: {node.source_file}\n{snippet}")

    return "\n\n".join(sections), sources


def format_history(history: list[dict[str, str]], keep_last: int = 4) -> str:
    trimmed = history[-keep_last:]
    if not trimmed:
        return ""
    lines = ["## Recent Conversation"]
    for item in trimmed:
        lines.append(f"Q: {item['question']}")
        lines.append(f"A: {item['answer']}")
    return "\n".join(lines)


def call_model(client: OpenAI, model: str, question: str, context: str, history_text: str) -> str:
    user_prompt = f"""使用者問題：
{question}

{history_text}

## Knowledge Graph Context
{context}

請依據以上內容作答，並在最後加一段：
來源：
- ...
"""
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return (response.choices[0].message.content or "").strip()


def print_sources(retrieved: list[RetrievedNode], sources: list[str]) -> None:
    print("\n[retrieved nodes]")
    for node in retrieved:
        community_display = f" community={node.community}" if node.community is not None else ""
        print(f"- {node.label} | score={node.score:.1f}{community_display}")
        if node.source_file:
            print(f"  source={node.source_file}")
    if sources:
        print("\n[source files]")
        for source in sources[:12]:
            print(f"- {source}")


def interactive_chat(
    project_root: Path,
    graph,
    report_text: str,
    labels: dict[int, str],
    client: OpenAI,
    model: str,
    show_sources: bool,
) -> None:
    history: list[dict[str, str]] = []

    print("Knowledge Base Chat")
    print("輸入問題直接開始；輸入 /help 看指令，/quit 離開。")

    while True:
        try:
            question = input("\nkb> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nbye")
            return

        if not question:
            continue
        if question in {"/quit", "/exit"}:
            print("bye")
            return
        if question == "/help":
            print("/help  顯示說明")
            print("/quit  離開")
            print("/sources on|off  開關檢索來源顯示")
            continue
        if question.startswith("/sources "):
            arg = question.split(" ", 1)[1].strip().lower()
            show_sources = arg == "on"
            print(f"sources {'on' if show_sources else 'off'}")
            continue

        retrieved = retrieve_nodes(graph, question)
        if not retrieved:
            print("目前知識圖裡找不到明顯相關的節點，請換個關鍵字試試。")
            continue

        context, sources = build_context(project_root, graph, retrieved, report_text, labels)
        history_text = format_history(history)
        answer = call_model(client, model, question, context, history_text)
        print("\n" + answer)
        if show_sources:
            print_sources(retrieved, sources)

        history.append({"question": question, "answer": answer})


def main() -> None:
    parser = argparse.ArgumentParser(description="Interactive command-line chat over the Graphify knowledge base.")
    parser.add_argument("question", nargs="?", help="Ask one question directly instead of starting interactive mode")
    parser.add_argument("--graph", default="graphify-out/graph.json", help="Path to graph.json")
    parser.add_argument("--report", default="graphify-out/GRAPH_REPORT.md", help="Path to GRAPH_REPORT.md")
    parser.add_argument("--labels", default="graphify-out/.graphify_labels.json", help="Path to labels json")
    parser.add_argument("--show-sources", action="store_true", help="Print retrieved nodes and source files")
    args = parser.parse_args()

    project_root = Path.cwd()
    load_dotenv(project_root / ".env")
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("LLM_MODEL", DEFAULT_MODEL)
    if not api_key:
        raise SystemExit("OPENAI_API_KEY is missing from .env")

    graph = load_graph(project_root / args.graph)
    report_text = read_text_with_fallback(project_root / args.report) if (project_root / args.report).exists() else ""
    labels_raw = load_json(project_root / args.labels) if (project_root / args.labels).exists() else {}
    labels = {int(k): v for k, v in labels_raw.items()}

    client = OpenAI(api_key=api_key, timeout=120.0, max_retries=2)

    if args.question:
        if args.question == "/help":
            print("用法：")
            print(r".\chat_kb.ps1")
            print(r".\chat_kb.ps1 ""工地週轉金申請需要注意什麼？""")
            print(r".\chat_kb.ps1 ""零用金核銷流程"" --show-sources")
            print("互動模式指令：/help /sources on /sources off /quit")
            return
        if args.question in {"/quit", "/exit"}:
            return
        retrieved = retrieve_nodes(graph, args.question)
        if not retrieved:
            print("目前知識圖裡找不到明顯相關的節點。")
            return
        context, sources = build_context(project_root, graph, retrieved, report_text, labels)
        answer = call_model(client, model, args.question, context, "")
        print(answer)
        if args.show_sources:
            print_sources(retrieved, sources)
        return

    interactive_chat(project_root, graph, report_text, labels, client, model, args.show_sources)


if __name__ == "__main__":
    main()
