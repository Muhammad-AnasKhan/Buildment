import { apiHeaders, fetchApiResponse, parseApiResponse } from "@/lib/api-client";
import { STREAM_ERROR_MARK, splitStreamed, type QaTurn } from "@/lib/chapter-question";

export type StreamResult = { remaining: number; dailyLimit: number; answer: string };

/** Number from a response header, or the fallback when the header is missing or not a number. */
function headerNumber(response: Response, name: string, fallback: number): number {
  const value = Number(response.headers.get(name));
  return response.headers.has(name) && Number.isFinite(value) ? value : fallback;
}

/**
 * Asks a question and hands the answer to `onText` as it arrives (the text so far, each time).
 * Problems found before the answer starts come back as the API's normal error and are thrown as
 * ApiError; a failure after the first byte is thrown as a plain Error with the server's message.
 */
export async function streamChapterAnswer(input: {
  chapterId: string;
  question: string;
  previous?: QaTurn;
  signal?: AbortSignal;
  fallback: Omit<StreamResult, "answer">;
  onText: (answerSoFar: string) => void;
}): Promise<StreamResult> {
  const response = await fetchApiResponse(`/api/v1/chapters/${input.chapterId}/ask`, {
    method: "POST",
    signal: input.signal,
    headers: { ...apiHeaders({ json: true }), Accept: "text/plain, application/json" },
    body: JSON.stringify({ question: input.question, stream: true, ...(input.previous ? { previous: input.previous } : {}) }),
  });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("text/plain") || !response.body) {
    // Throws ApiError for an error envelope; a surprise success shape is treated as a failure too.
    await parseApiResponse(response);
    throw new Error("The answer did not arrive as a stream.");
  }

  const counts = {
    remaining: headerNumber(response, "x-questions-remaining", input.fallback.remaining),
    dailyLimit: headerNumber(response, "x-questions-daily-limit", input.fallback.dailyLimit),
  };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    // Once the failure mark shows up, keep reading so the whole message arrives, but stop updating the answer.
    if (!text.includes(STREAM_ERROR_MARK)) input.onText(text);
  }
  text += decoder.decode();
  const { answer, failure } = splitStreamed(text);
  if (text.includes(STREAM_ERROR_MARK)) throw new Error(failure ?? "The answer stopped early.");
  input.onText(answer);
  return { ...counts, answer };
}
