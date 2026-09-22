import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type AiAction =
  | "improve"
  | "summarize"
  | "expand"
  | "fix_grammar"
  | "make_shorter"
  | "custom";

const SYSTEM_PROMPT = `You are an intelligent writing assistant embedded in a text editor called Webbly Workspace.
Your job is to help users improve, summarize, expand, fix, or rewrite their text.
Always respond with ONLY the resulting text — no explanations, no preambles, no markdown code fences unless the user's content itself is markdown.
Preserve the original language of the document.`;

function buildPrompt(action: AiAction, content: string, customPrompt?: string): string {
  switch (action) {
    case "improve":
      return `Improve the writing quality, clarity, and flow of the following text:\n\n${content}`;
    case "summarize":
      return `Summarize the following text concisely:\n\n${content}`;
    case "expand":
      return `Expand the following text with more detail and depth:\n\n${content}`;
    case "fix_grammar":
      return `Fix all grammar, spelling, and punctuation errors in the following text:\n\n${content}`;
    case "make_shorter":
      return `Make the following text shorter while keeping the core meaning:\n\n${content}`;
    case "custom":
      return content.trim()
        ? `${customPrompt}\n\nText:\n${content}`
        : (customPrompt ?? "");
    default:
      return content;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { action?: AiAction; content?: string; customPrompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { action, content, customPrompt } = body;
  if (!action || typeof content !== "string") {
    return Response.json(
      { error: "Missing required fields: action, content." },
      { status: 400 }
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(action, content, customPrompt);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.models.generateContentStream({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        let message = err instanceof Error ? err.message : String(err);

        for (let i = 0; i < 3; i++) {
          try {
            const parsed = JSON.parse(message);
            const inner =
              parsed?.error?.message ??
              parsed?.[0]?.error?.message ??
              parsed?.message ??
              parsed?.[0]?.message;
            if (typeof inner === "string" && inner !== message) {
              message = inner;
            } else {
              break;
            }
          } catch {
            break;
          }
        }

        controller.error(new Error(message));
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
