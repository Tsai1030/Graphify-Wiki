import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { ensureRootEnvLoaded } from "@/lib/root-env";
import { buildChatContext, getRetrievedImages, retrieveNodes } from "@/lib/retrieval";

const SYSTEM_PROMPT = `You are a Graphify-powered knowledge assistant.

Rules:
- Answer only from the retrieved graph context and snippets.
- If the evidence is incomplete, say so clearly instead of guessing.
- Prefer concise, structured responses.
- Mention related nodes or source files when they help the answer.
- If the graph is empty, explain what the user needs to prepare next.`;

export async function POST(request: NextRequest) {
  ensureRootEnvLoaded();

  const { question, history = [] } = (await request.json()) as {
    question?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const retrieved = retrieveNodes(question, 8);
  if (!retrieved.length) {
    return NextResponse.json({
      answer:
        "No relevant graph evidence is available yet. Add your private corpus to `data_markdown/`, generate a graph into `graphify-out/`, and try again.",
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
    return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
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
        content: `Question:\n${question}\n\n## Knowledge Graph Context\n${context}\n\nAnswer using the graph evidence above.`
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
