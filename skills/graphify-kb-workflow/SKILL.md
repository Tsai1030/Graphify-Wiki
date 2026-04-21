---
name: graphify-kb-workflow
description: Guide Codex through setting up a private Graphify knowledge base from an existing Markdown corpus, generating graph outputs with the repo scripts, launching the Next.js workspace, and opening Obsidian over the generated node communities. Use when the user wants to ingest Markdown files and image paths into Graphify, rebuild the graph after corpus changes, explain the required folder structure, or browse graph communities in Obsidian.
---

# Graphify KB Workflow

## Overview

Use the repository's existing scripts and folder conventions to turn a private Markdown corpus into:
- Graphify graph outputs in `graphify-out/`
- a local chat and frontend workspace
- an Obsidian vault for community and node exploration

Read [references/workflow.md](references/workflow.md) when you need the exact commands, expected outputs, or the end-to-end checklist.

## Workflow

### 1. Verify the required private folders

Expect these paths:
- `data_markdown/` for the private Markdown corpus
- `graphify_repo/` for the local clone of `safishamsi/graphify`
- `graphify-out/` for generated graph outputs

If `graphify_repo/` is missing, tell the user to clone:

```powershell
git clone https://github.com/safishamsi/graphify.git graphify_repo
```

If `data_markdown/` is missing, tell the user to add their Markdown files there before building.

### 2. Treat the corpus as private

Keep these directories out of git:
- `data_markdown/`
- `graphify-out/`
- `.env`
- `graphify_repo/`

Do not recommend uploading private documents or generated graph artifacts to a public remote.

### 3. Prefer the repo build script

Use:

```powershell
.\build_kb.ps1
```

Do not invent a separate build flow if the existing script is available. It already:
- creates `.venv/` when needed
- installs Graphify and Python dependencies
- reads `data_markdown/`
- writes outputs into `graphify-out/`

### 4. Explain the corpus expectations clearly

Assume the best input format is an already-cleaned Markdown corpus.

Recommend this pattern:
- Markdown files directly under `data_markdown/`
- image files under `data_markdown/img/...`
- Markdown references that point to those image paths

### 5. Point users to the right outputs

After a successful build, reference these outputs:
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/wiki/index.md`
- `graphify-out/obsidian/`

### 6. Use the built-in runtime entry points

For the frontend:

```powershell
.\run_frontend.ps1
```

For terminal chat:

```powershell
.\chat_kb.ps1
```

Tell users:
- `/` is the landing page
- `/home` is the actual workspace

### 7. Use Obsidian as the cluster viewer

After the graph is built, tell the user to open:

```text
graphify-out/obsidian
```

Use Obsidian to inspect:
- `_COMMUNITY_*.md` cluster summaries
- `START_HERE.md`
- `graph.canvas`
- node notes and backlinks

### 8. Keep guidance practical

When answering with this skill:
- give the steps in execution order
- use repo-relative paths and exact script names
- mention what each step produces
- mention what remains local and private

