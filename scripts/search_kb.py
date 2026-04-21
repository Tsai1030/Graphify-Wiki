from __future__ import annotations

import argparse
import json
from pathlib import Path

from networkx.readwrite import json_graph


def load_graph(path: Path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    try:
        return json_graph.node_link_graph(raw, edges="links")
    except TypeError:
        return json_graph.node_link_graph(raw)


def main() -> None:
    parser = argparse.ArgumentParser(description="Simple local search for the generated knowledge graph.")
    parser.add_argument("query", help="Search text")
    parser.add_argument("--graph", default="graphify-out/graph.json", help="Path to graph.json")
    parser.add_argument("--limit", type=int, default=15, help="Maximum results to print")
    args = parser.parse_args()

    graph = load_graph(Path(args.graph))
    query = args.query.strip().lower()
    matches = []

    for node_id, data in graph.nodes(data=True):
        label = str(data.get("label", ""))
        source_file = str(data.get("source_file", ""))
        haystack = f"{label} {source_file}".lower()
        if query not in haystack:
            continue

        exact = 1 if label.lower() == query else 0
        starts = 1 if label.lower().startswith(query) else 0
        matches.append(
            (
                -exact,
                -starts,
                -graph.degree(node_id),
                label,
                node_id,
                source_file,
            )
        )

    matches.sort()
    if not matches:
        print("No matches.")
        return

    for _, _, neg_degree, label, node_id, source_file in matches[: args.limit]:
        print(f"{label} | degree={-neg_degree} | id={node_id}")
        if source_file:
            print(f"  source={source_file}")


if __name__ == "__main__":
    main()
