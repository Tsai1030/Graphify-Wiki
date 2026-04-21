# Build Summary

- Corpus: `data_markdown`
- Markdown documents: 51
- Images detected: 633
- Cache hits: 51
- Model: `gpt-5.4-mini`
- Graph: 1642 nodes / 3144 edges / 42 communities
- Token usage: 298,888 input / 224,500 output

## Outputs

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/wiki/index.md`
- `graphify-out/global_concepts.md`
- `graphify-out/RUN_SUMMARY.json`

## Useful Commands

- `./search_kb.ps1 工務所`
- `./.venv/Scripts/graphify.exe explain "工務所" --graph graphify-out/graph.json`
- `./.venv/Scripts/graphify.exe path "工務所" "零用金" --graph graphify-out/graph.json`
- `./build_kb.ps1`