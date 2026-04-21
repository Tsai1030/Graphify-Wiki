import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { ensureRootEnvLoaded } from "@/lib/root-env";
import { buildChatContext, getRetrievedImages, retrieveNodes } from "@/lib/retrieval";

const SYSTEM_PROMPT = `你是企業內部知識庫助理。請只根據提供的 Graphify 知識圖譜上下文回答。

規則：
- 先直接回答，再列出重點。
- 如果問題是流程題，整理成步驟或清單。
- 如果是責任或文件題，指出角色、文件、控制點。
- 不要假裝看過沒有提供的內容。
- 如果上下文不足，明確說明證據不足。
- 使用繁體中文。`;

export async function POST(request: NextRequest) {
  ensureRootEnvLoaded();

  const { question, history = [] } = (await request.json()) as {
    question?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const retrieved = retrieveNodes(question, 8);
  if (!retrieved.length) {
    return NextResponse.json({
      answer: "目前知識圖裡找不到明顯相關的節點，請換個關鍵字或把問題講得更具體一點。",
      retrieved,
      sourceFiles: [],
      images: []
    });
  }

  const { context, sourceFiles } = buildChatContext(question, retrieved);
  const images = getRetrievedImages(retrieved, 4);
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-5.4-mini";

  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
  }

  const client = new OpenAI({ apiKey, timeout: 120000, maxRetries: 2 });
  const recentHistory = history.slice(-4);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentHistory.map((item) => ({
        role: item.role,
        content: item.content
      })),
      {
        role: "user",
        content: `使用者問題：${question}

## Knowledge Graph Context
${context}

請根據上述內容回答，最後加上「來源」段落。`
      }
    ]
  });

  return NextResponse.json({
    answer: response.choices[0].message.content ?? "",
    retrieved,
    sourceFiles,
    images
  });
}
