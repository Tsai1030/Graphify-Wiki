# Graphify Atlas

A polished Graphify-powered knowledge workspace built with Next.js, React, TypeScript, and Tailwind CSS.

This repository is the public shareable shell of the project:
- product architecture
- frontend interaction design
- API and retrieval scaffolding
- local scripts and usage flow

This repository does not include any confidential source corpus or generated graph outputs.

## English

### Overview

Graphify Atlas is a cinematic knowledge workspace for exploring a private document corpus through:
- conversational retrieval
- graph-backed evidence inspection
- image and table previews
- a product landing page plus a dedicated `/home` workspace
- optional Obsidian browsing for community clusters and node notes

The public repo is intentionally data-free. You bring your own private corpus, build your own graph locally, and keep those files out of version control.

### What is included

- `frontend/`: Next.js app with the landing page and interactive workspace
- `scripts/`: local build and chat helpers
- `build_kb.ps1`: private knowledge-base build entrypoint
- `chat_kb.ps1`: command-line chat against the generated graph
- `run_frontend.ps1`: frontend dev launcher
- `.env.example`: required environment variables

### What is intentionally excluded

The following directories are ignored and should remain private:

- `data_markdown/`
- `graphify-out/`
- `.env`
- `graphify_repo/`

This means the public repository is safe to share without exposing:
- raw internal documents
- extracted images
- generated graph JSON, wiki, and Obsidian files
- cached LLM outputs

### Product structure

Routes:
- `/`: landing page with visual storytelling and motion
- `/home`: fixed-height workspace for actual usage

Workspace zones:
- `Atlas Rail`: context, quick actions, dataset stats
- `Conversation Canvas`: the main interaction surface
- `Signal Rail`: source signals, related nodes, and evidence state
- `Evidence Viewer`: a floating inspector for focused graph exploration

### Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- OpenAI API
- Local Graphify outputs as the retrieval source

### Project structure

```text
.
+-- frontend/
|   +-- app/
|   |   +-- api/
|   |   +-- home/
|   |   +-- globals.css
|   |   \-- page.tsx
|   +-- components/
|   \-- lib/
+-- scripts/
+-- build_kb.ps1
+-- chat_kb.ps1
+-- run_frontend.ps1
+-- .env.example
\-- README.md
```

### Step-by-step setup

#### 1. Clone this repository

```powershell
git clone https://github.com/Tsai1030/Graphify-Wiki.git
cd Graphify-Wiki
```

#### 2. Create your environment file

```powershell
Copy-Item .env.example .env
```

Then set:

```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.4-mini
```

#### 3. Install frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

#### 4. Prepare Graphify locally

This project expects the Graphify source code to exist locally in `graphify_repo/`.

Clone the upstream Graphify repository:

```powershell
git clone https://github.com/safishamsi/graphify.git graphify_repo
```

The build script will install Graphify into the local virtual environment automatically.

#### 5. Prepare your Markdown corpus

Create a private folder named:

```text
data_markdown/
```

Put your source files there.

If your documents are already Markdown, you can use them directly.

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

Important notes:
- Markdown files can reference images with relative paths that point into `data_markdown/img/...`
- This project is designed for a corpus that is already cleaned into Markdown
- `data_markdown/` is private and excluded from git

#### 6. Build the Graphify knowledge base

Run:

```powershell
.\build_kb.ps1
```

This script will:
- create `.venv/` if it does not exist
- install Graphify and Python dependencies
- read files from `data_markdown/`
- generate graph outputs into `graphify-out/`

Expected outputs include:
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/wiki/index.md`
- `graphify-out/obsidian/`

#### 7. Start the frontend

```powershell
.\run_frontend.ps1
```

Open:

```text
http://localhost:3001
```

Use:
- `/` for the landing page
- `/home` for the actual workspace

#### 8. Optional: chat with the graph in the terminal

```powershell
.\chat_kb.ps1
```

Or ask a single question:

```powershell
.\chat_kb.ps1 "What are the key steps in the workflow?"
```

#### 9. Optional: inspect the graph in Obsidian

After `.\build_kb.ps1` finishes, open this folder as an Obsidian vault:

```text
graphify-out/obsidian
```

Suggested entry points:
- `graphify-out/obsidian/START_HERE.md`
- `graphify-out/obsidian/graph.canvas`
- `_COMMUNITY_*.md` files for cluster overviews

This lets you:
- browse node notes
- inspect community groups
- navigate links visually
- explore the generated knowledge map outside the web app

### Using your own private knowledge base

This public repo assumes that your private data stays local.

Expected private-only directories:

```text
data_markdown/
graphify-out/
graphify_repo/
```

Typical local workflow:

1. Put your private Markdown corpus into `data_markdown/`
2. Clone Graphify into `graphify_repo/`
3. Run `.\build_kb.ps1`
4. Launch the frontend with `.\run_frontend.ps1`
5. Open `/home`
6. Optionally open `graphify-out/obsidian` in Obsidian

### Public sharing model

If you want to publish your UI and architecture without exposing data:

1. Keep `data_markdown/` out of git
2. Keep `graphify-out/` out of git
3. Keep `.env` out of git
4. Share only the code, README, and setup instructions

This repository is structured exactly for that model.

### Notes

- The app can render its shell without a graph, but meaningful retrieval requires local `graphify-out/` data
- The chat API requires a valid `OPENAI_API_KEY`
- The frontend is configured to run on port `3001`
- The knowledge-base build script expects PowerShell and `uv`

---

## 中文說明

### 專案介紹

`Graphify Atlas` 是一個以 Graphify 為核心的知識工作台，讓私有文件可以被整理成：
- 可對話查詢
- 可檢視節點與關聯
- 可顯示圖片與表格
- 可用前端工作區與 Obsidian 兩種方式探索

這個 GitHub 倉庫是公開分享版，主要提供：
- 架構設計
- 前端互動頁面
- API 與檢索流程
- 本地建置方式

### 這個公開版不包含什麼

以下內容不會被上傳：
- `data_markdown/`
- `graphify-out/`
- `.env`
- `graphify_repo/`

也就是說，這個 repo 不會暴露：
- 原始機密文件
- 圖片原檔
- 知識圖譜輸出
- 快取與推論結果

### 使用步驟

#### 1. 先下載這個專案

```powershell
git clone https://github.com/Tsai1030/Graphify-Wiki.git
cd Graphify-Wiki
```

#### 2. 建立環境變數

```powershell
Copy-Item .env.example .env
```

填入：

```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.4-mini
```

#### 3. 安裝前端依賴

```powershell
cd frontend
npm install
cd ..
```

#### 4. 先把 Graphify 準備好

這個專案預期你會把 Graphify 原始 repo 放在本地的 `graphify_repo/`。

執行：

```powershell
git clone https://github.com/safishamsi/graphify.git graphify_repo
```

之後 `.\build_kb.ps1` 會自動把 Graphify 安裝到本地虛擬環境中。

#### 5. 把你已經是 Markdown 的文件放進來

建立這個資料夾：

```text
data_markdown/
```

把你已經整理好的 Markdown 文件放進去即可，不需要另外再轉格式。

建議結構：

```text
data_markdown/
+-- 文件A.md
+-- 文件B.md
\-- img/
    +-- 文件A/
    |   \-- 圖片001.png
    \-- 文件B/
        \-- 圖片001.png
```

補充說明：
- 如果 Markdown 內有圖片，建議圖片路徑放在 `data_markdown/img/...`
- 這份專案最適合處理「已經整理成 Markdown」的資料
- `data_markdown/` 是私有資料夾，不會被 git 上傳

#### 6. 建立 Graphify 知識庫

執行：

```powershell
.\build_kb.ps1
```

這一步會自動做：
- 建立 `.venv/`
- 安裝 Graphify 與 Python 套件
- 讀取 `data_markdown/`
- 產出 `graphify-out/`

產物通常會包含：
- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/wiki/index.md`
- `graphify-out/obsidian/`

#### 7. 啟動前端工作區

```powershell
.\run_frontend.ps1
```

打開：

```text
http://localhost:3001
```

使用方式：
- `/` 是產品展示 landing page
- `/home` 是實際工作區頁面

#### 8. 可選：用命令列直接問答

```powershell
.\chat_kb.ps1
```

或直接單次提問：

```powershell
.\chat_kb.ps1 "請整理這份知識庫中的關鍵流程"
```

#### 9. 可選：用 Obsidian 看節點與群組

當 `.\build_kb.ps1` 跑完之後，直接用 Obsidian 開這個資料夾當 vault：

```text
graphify-out/obsidian
```

建議先看：
- `graphify-out/obsidian/START_HERE.md`
- `graphify-out/obsidian/graph.canvas`
- `_COMMUNITY_*.md`

你可以在 Obsidian 裡：
- 看節點筆記
- 看社群群組
- 透過連結往來跳轉
- 用 Graph View 或 Canvas 方式理解知識圖譜

### 如果你要接自己的私有知識庫

本地準備這些資料夾：

```text
data_markdown/
graphify-out/
graphify_repo/
```

本地流程：

1. 把私有 Markdown 文件放進 `data_markdown/`
2. 把 Graphify clone 到 `graphify_repo/`
3. 執行 `.\build_kb.ps1`
4. 啟動 `.\run_frontend.ps1`
5. 開 `/home`
6. 如果想看群組與節點網絡，再用 Obsidian 開 `graphify-out/obsidian`

### 頁面結構

- `/`：產品展示 landing page
- `/home`：實際工作區

工作區主要分成：
- 左側 `Atlas Rail`
- 中間 `Conversation Canvas`
- 右側 `Signal Rail`
- 中央浮動 `Evidence Viewer`

### 分享建議

如果你的文件是機密的，最好的分享方式就是：

1. 只公開程式碼與介面
2. 不上傳任何原始文件
3. 不上傳 graph 輸出
4. 用 README 教別人如何接上自己的私有資料

這個 repo 現在就是用這種方式整理的。
