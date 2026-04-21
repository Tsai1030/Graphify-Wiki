from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

from graphify.analyze import god_nodes, suggest_questions, surprising_connections
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.detect import detect, save_manifest
from graphify.export import to_html, to_json
from graphify.report import generate
from graphify.wiki import to_wiki


PROMPT_VERSION = "kb-v1"
DEFAULT_MODEL = "gpt-4.1-mini"
GLOBAL_CONCEPTS_PATH = "graphify-out/global_concepts.md"


def make_id(*parts: str) -> str:
    combined = "_".join(p.strip("_.") for p in parts if p)
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", combined)
    cleaned = cleaned.strip("_").lower()
    digest = hashlib.sha1(combined.encode("utf-8")).hexdigest()[:10]
    if not cleaned:
        return f"id_{digest}"
    if re.search(r"[^\x00-\x7F]", combined):
        return f"{cleaned}_{digest}"
    return cleaned


def to_posix(path: Path) -> str:
    return path.as_posix()


def safe_read_text(path: Path) -> str:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "cp950", "big5", "utf-16"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="ignore")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def extract_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    return fallback


def extract_image_paths(text: str) -> list[str]:
    matches = re.findall(r"`(data_markdown/img/[^`]+?\.(?:png|jpg|jpeg|gif|webp|svg))`", text, flags=re.IGNORECASE)
    deduped: list[str] = []
    seen: set[str] = set()
    for match in matches:
        norm = match.strip().replace("\\", "/")
        if norm not in seen:
            seen.add(norm)
            deduped.append(norm)
    return deduped


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def coerce_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if not text:
        raise ValueError("empty model response")
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def normalize_confidence(value: str, default: str = "INFERRED") -> str:
    value = (value or default).upper()
    if value not in {"EXTRACTED", "INFERRED", "AMBIGUOUS"}:
        return default
    return value


def normalize_score(confidence: str, value: Any) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        score = 1.0 if confidence == "EXTRACTED" else 0.7 if confidence == "INFERRED" else 0.2
    score = max(0.0, min(1.0, score))
    if confidence == "EXTRACTED":
        return 1.0
    return round(score, 2)


def chunk_text(text: str, max_chars: int = 18000) -> str:
    if len(text) <= max_chars:
        return text
    head = text[: max_chars // 2]
    tail = text[-max_chars // 2 :]
    return head + "\n\n[... truncated for extraction ...]\n\n" + tail


def build_doc_prompt(relative_path: str, title: str, image_paths: list[str], text: str) -> str:
    image_hint = "\n".join(f"- {p}" for p in image_paths[:40]) or "- none"
    return f"""
You are extracting a Graphify-style knowledge graph from a single markdown document.

The corpus is a Chinese construction/process knowledge base. Preserve important Chinese labels exactly.
Focus on durable knowledge that makes a reusable knowledge base:
- processes and workflows
- roles or responsible parties
- forms, artifacts, and records
- controls, approvals, and checkpoints
- risks, compliance, and safety topics
- named diagrams and image sections

Ignore page headers/footers, repeated OCR noise, and line-level formatting clutter.
Do not invent facts that are not supported by the document.

Return one JSON object with this shape:
{{
  "document_title": "string",
  "document_summary": "short paragraph",
  "concepts": [
    {{
      "label": "string",
      "type": "process|role|artifact|control|risk|topic|image|diagram",
      "description": "string",
      "importance": 1
    }}
  ],
  "relations": [
    {{
      "source": "concept label",
      "target": "concept label",
      "relation": "references|conceptually_related_to|shares_data_with|rationale_for|implements|participate_in|form",
      "confidence": "EXTRACTED|INFERRED|AMBIGUOUS",
      "confidence_score": 1.0,
      "why": "short reason"
    }}
  ],
  "images": [
    {{
      "path": "relative image path from the document",
      "label": "human-readable image title",
      "summary": "one sentence"
    }}
  ],
  "image_relations": [
    {{
      "image_path": "relative image path",
      "concept": "concept label",
      "relation": "references|conceptually_related_to|rationale_for",
      "confidence": "EXTRACTED|INFERRED|AMBIGUOUS",
      "confidence_score": 1.0
    }}
  ],
  "hyperedges": [
    {{
      "label": "group label",
      "nodes": ["concept label 1", "concept label 2", "concept label 3"],
      "relation": "participate_in|form|implement",
      "confidence": "EXTRACTED|INFERRED",
      "confidence_score": 0.8
    }}
  ]
}}

Rules:
- Keep concepts high signal. Usually 6-14 concepts per document.
- Keep relations meaningful. Usually 6-20 relations per document.
- Use EXTRACTED only when the relation is explicit in the markdown.
- Use INFERRED only for strong, useful KB links.
- If the document already contains image captions or summaries, use them.
- Do not output markdown fences.

Document path: {relative_path}
Document title guess: {title}
Image paths mentioned in the document:
{image_hint}

Markdown document:
{chunk_text(text)}
""".strip()


def build_label_prompt(communities: dict[int, list[str]]) -> str:
    lines = []
    for cid, labels in communities.items():
        joined = ", ".join(labels[:15])
        lines.append(f"{cid}: {joined}")
    payload = "\n".join(lines)
    return f"""
Create short community labels for a knowledge graph.
Return JSON in the form:
{{"labels":[{{"community":0,"label":"short label"}}]}}

Rules:
- 2 to 5 words each
- specific and business-meaningful
- prefer the original Chinese terminology when the node labels are Chinese
- avoid generic names like "Miscellaneous"

Communities:
{payload}
""".strip()


def call_model_json(
    client: OpenAI,
    model: str,
    system_prompt: str,
    user_prompt: str,
    retries: int = 3,
) -> tuple[dict[str, Any], dict[str, int]]:
    usage_totals = {"input": 0, "output": 0}
    last_error: Exception | None = None

    for attempt in range(1, retries + 1):
        try:
            kwargs = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "response_format": {"type": "json_object"},
            }
            try:
                response = client.chat.completions.create(**kwargs)
            except Exception:
                kwargs.pop("response_format", None)
                response = client.chat.completions.create(**kwargs)

            usage = getattr(response, "usage", None)
            if usage is not None:
                usage_totals["input"] += int(getattr(usage, "prompt_tokens", 0) or 0)
                usage_totals["output"] += int(getattr(usage, "completion_tokens", 0) or 0)

            message = response.choices[0].message
            content = message.content or ""
            parsed = coerce_json(content)
            return parsed, usage_totals
        except Exception as exc:
            last_error = exc
            time.sleep(min(2 * attempt, 6))

    raise RuntimeError(f"model extraction failed after {retries} attempts: {last_error}")


def collect_doc_cache(
    cache_dir: Path,
    relative_path: str,
    content_hash: str,
    model: str,
) -> Path:
    cache_key = sha256_text(f"{PROMPT_VERSION}|{model}|{relative_path}|{content_hash}")
    return cache_dir / f"{cache_key}.json"


def transform_doc_result(
    project_root: Path,
    global_concepts_file: str,
    relative_doc_path: str,
    raw_result: dict[str, Any],
    detected_image_paths: list[str],
) -> dict[str, Any]:
    doc_title = (raw_result.get("document_title") or Path(relative_doc_path).stem).strip()
    doc_summary = (raw_result.get("document_summary") or "").strip()
    doc_node_id = make_id("doc", relative_doc_path)

    nodes: list[dict[str, Any]] = [
        {
            "id": doc_node_id,
            "label": doc_title,
            "file_type": "document",
            "source_file": relative_doc_path,
            "source_location": None,
            "summary": doc_summary,
        }
    ]
    edges: list[dict[str, Any]] = []
    hyperedges: list[dict[str, Any]] = []

    concept_id_by_label: dict[str, str] = {}
    concept_nodes: dict[str, dict[str, Any]] = {}

    for concept in raw_result.get("concepts", []):
        label = str(concept.get("label", "")).strip()
        if not label:
            continue
        concept_id = make_id("concept", label)
        concept_id_by_label[label] = concept_id
        existing = concept_nodes.get(concept_id)
        if existing is None:
            concept_nodes[concept_id] = {
                "id": concept_id,
                "label": label,
                "file_type": "document",
                "source_file": global_concepts_file,
                "source_location": None,
                "concept_type": concept.get("type") or "topic",
                "description": (concept.get("description") or "").strip(),
                "importance": int(concept.get("importance") or 1),
                "source_documents": [relative_doc_path],
            }
        else:
            docs = set(existing.get("source_documents", []))
            docs.add(relative_doc_path)
            existing["source_documents"] = sorted(docs)
            existing["importance"] = max(int(existing.get("importance", 1)), int(concept.get("importance") or 1))
            if not existing.get("description") and concept.get("description"):
                existing["description"] = concept.get("description")

        edges.append(
            {
                "source": doc_node_id,
                "target": concept_id,
                "relation": "references",
                "confidence": "EXTRACTED",
                "confidence_score": 1.0,
                "source_file": relative_doc_path,
                "source_location": None,
                "weight": 1.0,
            }
        )

    image_node_id_by_path: dict[str, str] = {}
    known_images = set(detected_image_paths)

    for image in raw_result.get("images", []):
        path_value = str(image.get("path", "")).strip().replace("\\", "/")
        if not path_value:
            continue
        if path_value not in known_images:
            known_images.add(path_value)
        image_path = Path(path_value)
        image_node_id = make_id("img", path_value)
        image_label = (image.get("label") or image_path.name).strip()
        image_node_id_by_path[path_value] = image_node_id
        nodes.append(
            {
                "id": image_node_id,
                "label": image_label,
                "file_type": "image",
                "source_file": path_value,
                "source_location": None,
                "summary": (image.get("summary") or "").strip(),
            }
        )
        edges.append(
            {
                "source": doc_node_id,
                "target": image_node_id,
                "relation": "references",
                "confidence": "EXTRACTED",
                "confidence_score": 1.0,
                "source_file": relative_doc_path,
                "source_location": None,
                "weight": 1.0,
            }
        )

    for path_value in sorted(known_images):
        if path_value in image_node_id_by_path:
            continue
        image_path = Path(path_value)
        image_node_id = make_id("img", path_value)
        image_node_id_by_path[path_value] = image_node_id
        nodes.append(
            {
                "id": image_node_id,
                "label": image_path.name,
                "file_type": "image",
                "source_file": path_value,
                "source_location": None,
            }
        )
        edges.append(
            {
                "source": doc_node_id,
                "target": image_node_id,
                "relation": "references",
                "confidence": "EXTRACTED",
                "confidence_score": 1.0,
                "source_file": relative_doc_path,
                "source_location": None,
                "weight": 1.0,
            }
        )

    def concept_id_for_label(label: str) -> str:
        clean = str(label or "").strip()
        if not clean:
            raise ValueError("missing concept label")
        concept_id = concept_id_by_label.get(clean)
        if concept_id:
            return concept_id
        concept_id = make_id("concept", clean)
        concept_id_by_label[clean] = concept_id
        if concept_id not in concept_nodes:
            concept_nodes[concept_id] = {
                "id": concept_id,
                "label": clean,
                "file_type": "document",
                "source_file": global_concepts_file,
                "source_location": None,
                "concept_type": "topic",
                "description": "",
                "importance": 1,
                "source_documents": [relative_doc_path],
            }
        return concept_id

    for relation in raw_result.get("relations", []):
        try:
            source_id = concept_id_for_label(str(relation.get("source", "")).strip())
            target_id = concept_id_for_label(str(relation.get("target", "")).strip())
        except ValueError:
            continue
        confidence = normalize_confidence(str(relation.get("confidence", "INFERRED")))
        edges.append(
            {
                "source": source_id,
                "target": target_id,
                "relation": str(relation.get("relation", "conceptually_related_to")).strip() or "conceptually_related_to",
                "confidence": confidence,
                "confidence_score": normalize_score(confidence, relation.get("confidence_score")),
                "source_file": relative_doc_path,
                "source_location": None,
                "weight": 1.0,
                "note": (relation.get("why") or "").strip(),
            }
        )

    for image_relation in raw_result.get("image_relations", []):
        image_path = str(image_relation.get("image_path", "")).strip().replace("\\", "/")
        concept_label = str(image_relation.get("concept", "")).strip()
        if not image_path or not concept_label:
            continue
        image_id = image_node_id_by_path.get(image_path)
        if image_id is None:
            image_id = make_id("img", image_path)
            image_node_id_by_path[image_path] = image_id
            nodes.append(
                {
                    "id": image_id,
                    "label": Path(image_path).name,
                    "file_type": "image",
                    "source_file": image_path,
                    "source_location": None,
                }
            )
        concept_id = concept_id_for_label(concept_label)
        confidence = normalize_confidence(str(image_relation.get("confidence", "INFERRED")))
        edges.append(
            {
                "source": image_id,
                "target": concept_id,
                "relation": str(image_relation.get("relation", "conceptually_related_to")).strip() or "conceptually_related_to",
                "confidence": confidence,
                "confidence_score": normalize_score(confidence, image_relation.get("confidence_score")),
                "source_file": relative_doc_path,
                "source_location": None,
                "weight": 1.0,
            }
        )

    for item in raw_result.get("hyperedges", []):
        labels = [str(label).strip() for label in item.get("nodes", []) if str(label).strip()]
        if len(labels) < 3:
            continue
        node_ids = [concept_id_for_label(label) for label in labels]
        confidence = normalize_confidence(str(item.get("confidence", "INFERRED")), default="INFERRED")
        hyperedges.append(
            {
                "id": make_id("hyperedge", relative_doc_path, str(item.get("label", ""))),
                "label": str(item.get("label", "Related group")).strip() or "Related group",
                "nodes": node_ids,
                "relation": str(item.get("relation", "form")).strip() or "form",
                "confidence": "EXTRACTED" if confidence == "EXTRACTED" else "INFERRED",
                "confidence_score": normalize_score(confidence, item.get("confidence_score")),
                "source_file": relative_doc_path,
            }
        )

    nodes.extend(concept_nodes.values())
    return {
        "nodes": nodes,
        "edges": edges,
        "hyperedges": hyperedges,
        "document": {
            "id": doc_node_id,
            "title": doc_title,
            "summary": doc_summary,
            "path": relative_doc_path,
        },
    }


def dedupe_graph_parts(parts: list[dict[str, Any]]) -> dict[str, Any]:
    nodes_by_id: dict[str, dict[str, Any]] = {}
    concept_docs: dict[str, set[str]] = defaultdict(set)
    edges_seen: set[tuple[str, str, str, str]] = set()
    edges: list[dict[str, Any]] = []
    hyper_seen: set[tuple[str, tuple[str, ...], str, str]] = set()
    hyperedges: list[dict[str, Any]] = []

    total_input = 0
    total_output = 0

    for part in parts:
        total_input += int(part.get("input_tokens", 0))
        total_output += int(part.get("output_tokens", 0))
        for node in part.get("nodes", []):
            node_id = node["id"]
            if node_id not in nodes_by_id:
                nodes_by_id[node_id] = dict(node)
            else:
                existing = nodes_by_id[node_id]
                for key, value in node.items():
                    if key == "source_documents":
                        continue
                    if not existing.get(key) and value:
                        existing[key] = value
                existing["importance"] = max(int(existing.get("importance", 1)), int(node.get("importance", 1)))
            for source_doc in node.get("source_documents", []):
                concept_docs[node_id].add(source_doc)

        for edge in part.get("edges", []):
            key = (
                edge["source"],
                edge["target"],
                edge.get("relation", ""),
                edge.get("source_file", ""),
            )
            if key not in edges_seen:
                edges_seen.add(key)
                edges.append(edge)

        for hyperedge in part.get("hyperedges", []):
            key = (
                hyperedge.get("label", ""),
                tuple(sorted(hyperedge.get("nodes", []))),
                hyperedge.get("relation", ""),
                hyperedge.get("source_file", ""),
            )
            if key not in hyper_seen:
                hyper_seen.add(key)
                hyperedges.append(hyperedge)

    for node_id, docs in concept_docs.items():
        if node_id in nodes_by_id:
            nodes_by_id[node_id]["source_documents"] = sorted(docs)

    return {
        "nodes": list(nodes_by_id.values()),
        "edges": edges,
        "hyperedges": hyperedges,
        "input_tokens": total_input,
        "output_tokens": total_output,
    }


def write_global_concepts_markdown(path: Path, extraction: dict[str, Any]) -> None:
    concept_nodes = [
        node
        for node in extraction.get("nodes", [])
        if node.get("id", "").startswith("concept_")
    ]
    concept_nodes.sort(key=lambda item: (-(int(item.get("importance", 1))), item.get("label", "")))

    lines = [
        "# Global Concepts",
        "",
        "Synthetic concept registry generated for the Graphify-style knowledge graph.",
        "",
    ]
    for node in concept_nodes:
        lines.append(f"## {node.get('label', node['id'])}")
        if node.get("description"):
            lines.append(node["description"])
        docs = node.get("source_documents", [])
        if docs:
            lines.append("")
            lines.append("Source documents:")
            for doc in docs[:20]:
                lines.append(f"- `{doc}`")
        lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def normalize_markdown_tree_encoding(root: Path) -> None:
    if not root.exists():
        return
    for path in root.rglob("*.md"):
        raw = path.read_bytes()
        text: str | None = None
        for encoding in ("utf-8", "cp950", "big5", "mbcs"):
            try:
                text = raw.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if text is None:
            text = raw.decode("utf-8", errors="ignore")
        path.write_text(text, encoding="utf-8")


def fallback_label_map(communities: dict[int, list[str]], graph) -> dict[int, str]:
    labels: dict[int, str] = {}
    for cid, node_ids in communities.items():
        names = [graph.nodes[n].get("label", n) for n in node_ids[:4]]
        labels[cid] = " / ".join(names[:2]) if names else f"Community {cid}"
    return labels


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a Graphify-style knowledge base for markdown corpora.")
    parser.add_argument("--root", default="data_markdown", help="Corpus root directory")
    parser.add_argument("--output", default="graphify-out", help="Output directory")
    parser.add_argument("--force", action="store_true", help="Ignore cached document extractions")
    args = parser.parse_args()

    project_root = Path.cwd()
    corpus_root = (project_root / args.root).resolve()
    output_dir = (project_root / args.output).resolve()
    cache_dir = output_dir / "cache" / "semantic"
    ensure_dir(output_dir)
    ensure_dir(cache_dir)

    load_dotenv(project_root / ".env")
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("LLM_MODEL", DEFAULT_MODEL)

    if not api_key:
        raise SystemExit("OPENAI_API_KEY is missing from .env")

    client = OpenAI(api_key=api_key, timeout=120.0, max_retries=2)
    detection = detect(corpus_root)
    (output_dir / ".graphify_detect.json").write_text(json.dumps(detection, indent=2, ensure_ascii=False), encoding="utf-8")

    document_files = [
        Path(path)
        for path in detection.get("files", {}).get("document", [])
        if Path(path).suffix.lower() == ".md"
    ]
    document_files.sort()
    if not document_files:
        raise SystemExit(f"No markdown documents found under {corpus_root}")

    system_prompt = (
        "You extract structured knowledge graph fragments for a local knowledge base. "
        "Return valid JSON only. Be conservative with facts and preserve Chinese terminology."
    )

    transformed_parts: list[dict[str, Any]] = []
    processed_docs = 0
    cache_hits = 0
    token_usage = {"input": 0, "output": 0}

    for doc_path in document_files:
        relative_doc_path = to_posix(doc_path.relative_to(project_root))
        text = safe_read_text(doc_path)
        title = extract_title(text, doc_path.stem)
        image_paths = extract_image_paths(text)
        content_hash = sha256_text(text)
        cache_path = collect_doc_cache(cache_dir, relative_doc_path, content_hash, model)

        if cache_path.exists() and not args.force:
            raw_payload = json.loads(cache_path.read_text(encoding="utf-8"))
            cache_hits += 1
        else:
            user_prompt = build_doc_prompt(relative_doc_path, title, image_paths, text)
            result, usage = call_model_json(client, model, system_prompt, user_prompt)
            token_usage["input"] += usage["input"]
            token_usage["output"] += usage["output"]
            raw_payload = {
                "relative_doc_path": relative_doc_path,
                "content_hash": content_hash,
                "model": model,
                "result": result,
                "usage": usage,
                "saved_at": int(time.time()),
            }
            cache_path.write_text(json.dumps(raw_payload, indent=2, ensure_ascii=False), encoding="utf-8")

        transformed = transform_doc_result(
            project_root=project_root,
            global_concepts_file=GLOBAL_CONCEPTS_PATH,
            relative_doc_path=relative_doc_path,
            raw_result=raw_payload["result"],
            detected_image_paths=image_paths,
        )
        transformed["input_tokens"] = raw_payload.get("usage", {}).get("input", 0)
        transformed["output_tokens"] = raw_payload.get("usage", {}).get("output", 0)
        transformed_parts.append(transformed)
        processed_docs += 1
        print(f"[{processed_docs}/{len(document_files)}] {relative_doc_path}", flush=True)

    extraction = dedupe_graph_parts(transformed_parts)
    write_global_concepts_markdown(output_dir / "global_concepts.md", extraction)
    (output_dir / ".graphify_extract.json").write_text(
        json.dumps(extraction, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    graph = build_from_json(extraction)
    communities = cluster(graph)
    cohesion = score_all(graph, communities)
    gods = god_nodes(graph)
    surprises = surprising_connections(graph, communities)

    analysis = {
        "communities": {str(cid): nodes for cid, nodes in communities.items()},
        "cohesion": {str(cid): score for cid, score in cohesion.items()},
        "gods": gods,
        "surprises": surprises,
    }
    (output_dir / ".graphify_analysis.json").write_text(
        json.dumps(analysis, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    label_inputs = {
        cid: [graph.nodes[n].get("label", n) for n in nodes[:15]]
        for cid, nodes in communities.items()
    }
    try:
        label_result, label_usage = call_model_json(
            client,
            model,
            "Return valid JSON only.",
            build_label_prompt(label_inputs),
        )
        token_usage["input"] += label_usage["input"]
        token_usage["output"] += label_usage["output"]
        labels = {
            int(item["community"]): str(item["label"]).strip()
            for item in label_result.get("labels", [])
            if str(item.get("label", "")).strip()
        }
    except Exception:
        labels = {}

    if not labels:
        labels = fallback_label_map(communities, graph)

    (output_dir / ".graphify_labels.json").write_text(
        json.dumps({str(k): v for k, v in labels.items()}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    questions = suggest_questions(graph, communities, labels)
    report = generate(
        graph,
        communities,
        cohesion,
        labels,
        gods,
        surprises,
        detection,
        {"input": extraction.get("input_tokens", 0) + token_usage["input"], "output": extraction.get("output_tokens", 0) + token_usage["output"]},
        args.root,
        suggested_questions=questions,
    )
    (output_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

    to_json(graph, communities, str(output_dir / "graph.json"))
    to_html(graph, communities, str(output_dir / "graph.html"), community_labels=labels or None)
    wiki_count = to_wiki(
        graph,
        communities,
        output_dir / "wiki",
        community_labels=labels or None,
        cohesion=cohesion,
        god_nodes_data=gods,
    )
    normalize_markdown_tree_encoding(output_dir / "wiki")

    run_summary = {
        "corpus_root": to_posix(corpus_root.relative_to(project_root)),
        "documents": len(document_files),
        "images_detected": len(detection.get("files", {}).get("image", [])),
        "cache_hits": cache_hits,
        "model": model,
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "communities": len(communities),
        "wiki_articles": wiki_count,
        "token_usage": {
            "input": extraction.get("input_tokens", 0) + token_usage["input"],
            "output": extraction.get("output_tokens", 0) + token_usage["output"],
        },
        "top_god_nodes": gods[:10],
    }
    (output_dir / "RUN_SUMMARY.json").write_text(
        json.dumps(run_summary, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    save_manifest(detection.get("files", {}), manifest_path=str(output_dir / "manifest.json"))

    summary_lines = [
        "# Build Summary",
        "",
        f"- Corpus: `{args.root}`",
        f"- Markdown documents: {len(document_files)}",
        f"- Images detected: {len(detection.get('files', {}).get('image', []))}",
        f"- Cache hits: {cache_hits}",
        f"- Model: `{model}`",
        f"- Graph: {graph.number_of_nodes()} nodes / {graph.number_of_edges()} edges / {len(communities)} communities",
        f"- Token usage: {run_summary['token_usage']['input']:,} input / {run_summary['token_usage']['output']:,} output",
        "",
        "## Outputs",
        "",
        "- `graphify-out/GRAPH_REPORT.md`",
        "- `graphify-out/graph.json`",
        "- `graphify-out/graph.html`",
        "- `graphify-out/wiki/index.md`",
        "- `graphify-out/global_concepts.md`",
        "- `graphify-out/RUN_SUMMARY.json`",
        "",
        "## Useful Commands",
        "",
        "- `./search_kb.ps1 工務所`",
        "- `./.venv/Scripts/graphify.exe explain \"工務所\" --graph graphify-out/graph.json`",
        "- `./.venv/Scripts/graphify.exe path \"工務所\" \"零用金\" --graph graphify-out/graph.json`",
        "- `./build_kb.ps1`",
    ]
    (output_dir / "BUILD_SUMMARY.md").write_text("\n".join(summary_lines), encoding="utf-8")

    print()
    print(f"Done: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges, {len(communities)} communities.", flush=True)
    print(f"Outputs written to {output_dir}", flush=True)


if __name__ == "__main__":
    main()
