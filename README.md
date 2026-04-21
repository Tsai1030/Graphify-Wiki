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
- landing-page storytelling plus a dedicated `/home` workspace

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
- generated graph JSON and wiki files
- cached LLM outputs

### Product structure

Routes:
- `/`: product landing page with visual storytelling and motion
- `/home`: fixed-height workspace for everyday usage

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

### Getting started

#### 1. Install dependencies

```powershell
cd frontend
npm install
```

#### 2. Create an environment file

```powershell
Copy-Item ..\.env.example ..\.env
```

Then set:

```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.4-mini
```

#### 3. Start the frontend

```powershell
cd ..
.\run_frontend.ps1
```

Open:

```text
http://localhost:3001
```

### Using your own private knowledge base

This public repo assumes that your private data stays local.

Expected private-only directories:

```text
data_markdown/
graphify-out/
graphify_repo/
```

Typical local workflow:

1. Place your private Markdown corpus and image references in `data_markdown/`.
2. Clone or install Graphify locally into `graphify_repo/`.
3. Run `.\build_kb.ps1` to generate your local outputs into `graphify-out/`.
4. Launch the frontend with `.\run_frontend.ps1`.
5. Open `/home` for the working interface.

### Public sharing model

If you want to publish your UI and architecture without exposing data:

1. Keep `data_markdown/` out of git.
2. Keep `graphify-out/` out of git.
3. Keep `.env` out of git.
4. Share only the code, README, and setup instructions.

This repository is structured exactly for that model.

### Notes

- The app can render its shell without a graph, but meaningful retrieval requires local `graphify-out/` data.
- The chat API requires a valid `OPENAI_API_KEY`.
- The frontend is configured to run on port `3001`.

---

## 中文說明

### 專案是什麼

`Graphify Atlas` 是一個以 Graphify 為核心的知識工作台，重點在於把私有文件轉成可檢索、可對話、可檢視證據的前端體驗。

這個 GitHub 倉庫是公開分享版，主要提供：
- 架構設計
- 前端互動頁面
- 使用方式
- 本地腳本流程

### 這個公開版不包含什麼

以下內容不會被上傳：
- `data_markdown/`
- `graphify-out/`
- `.env`
- `graphify_repo/`

也就是說，這個 repo 不會暴露：
- 原始機密文件
- 圖片素材原檔
- 知識圖譜輸出
- 快取與推論結果

### 如何使用

#### 1. 安裝前端依賴

```powershell
cd frontend
npm install
```

#### 2. 建立環境變數

```powershell
Copy-Item ..\.env.example ..\.env
```

填入：

```env
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.4-mini
```

#### 3. 啟動前端

```powershell
cd ..
.\run_frontend.ps1
```

打開：

```text
http://localhost:3001
```

### 如果你要接自己的私有知識庫

本地準備這些資料夾：

```text
data_markdown/
graphify-out/
graphify_repo/
```

本地流程：

1. 把私有 Markdown 與圖片路徑放進 `data_markdown/`
2. 在本機準備 `graphify_repo/`
3. 執行 `.\build_kb.ps1`
4. 啟動 `.\run_frontend.ps1`
5. 實際工作頁面在 `/home`

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
