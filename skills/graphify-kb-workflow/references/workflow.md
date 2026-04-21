# Graphify KB Workflow Reference

## Purpose

Use this reference when a user wants the exact workflow for building a private Graphify knowledge base from Markdown, using the repo frontend, or browsing the generated communities in Obsidian.

## Required private directories

```text
data_markdown/
graphify_repo/
graphify-out/
```

## Required environment variables

Create `.env` from `.env.example` and set:

```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.4-mini
```

## Frontend setup

```powershell
cd frontend
npm install
cd ..
```

## Clone Graphify locally

```powershell
git clone https://github.com/safishamsi/graphify.git graphify_repo
```

## Prepare the Markdown corpus

Recommended structure:

```text
data_markdown/
+-- topic-a.md
+-- topic-b.md
\-- img/
    +-- topic-a/
    |   \-- figure-01.png
    \-- topic-b/
        \-- figure-01.png
```

The corpus should already be in Markdown. Image references should point into `data_markdown/img/...`.

## Build the graph

```powershell
.\build_kb.ps1
```

This generates:
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/wiki/index.md`
- `graphify-out/obsidian/`

## Start the frontend workspace

```powershell
.\run_frontend.ps1
```

Open:

```text
http://localhost:3001
```

Routes:
- `/` for the landing page
- `/home` for the working interface

## Use terminal chat

Interactive:

```powershell
.\chat_kb.ps1
```

Single question:

```powershell
.\chat_kb.ps1 "Summarize the key workflow steps"
```

## Use Obsidian

Open this folder as an Obsidian vault:

```text
graphify-out/obsidian
```

Start from:
- `START_HERE.md`
- `graph.canvas`
- `_COMMUNITY_*.md`

## Privacy reminder

Keep these out of git:
- `data_markdown/`
- `graphify-out/`
- `.env`
- `graphify_repo/`
