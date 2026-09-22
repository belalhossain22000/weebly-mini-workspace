export type AiAction =
  | "improve"
  | "summarize"
  | "expand"
  | "fix_grammar"
  | "make_shorter"
  | "custom";

/**
 * Streams an AI response for the given action on the provided text.
 * Calls onChunk for each streamed text chunk, and onDone when complete.
 *
 * The actual Gemini call happens server-side in /api/ai — the API key
 * never reaches the browser.
 */
export async function streamAiEdit({
  action,
  content,
  customPrompt,
  onChunk,
  onDone,
  onError,
}: {
  action: AiAction;
  content: string;
  customPrompt?: string;
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: string) => void;
}): Promise<void> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, content, customPrompt }),
    });

    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null);
      onError(data?.error ?? `Request failed with status ${response.status}.`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      fullText += text;
      onChunk(text);
    }

    onDone(fullText);
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}
