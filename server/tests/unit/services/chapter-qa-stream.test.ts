import { beforeEach, describe, expect, it, vi } from "vitest";

const release = vi.fn(async () => undefined);
const record = vi.fn(async () => undefined);

vi.mock("../../../src/config/env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../src/config/env.js")>();
  return {
    ...actual,
    env: { ...actual.env, LEARNER_QA_MODEL: "claude-haiku-5-5", LEARNER_QA_DAILY_LIMIT: 20, ANTHROPIC_API_KEY: "test" },
    learnerQaAvailable: true,
  };
});
vi.mock("../../../src/utils/logger.js", () => ({ logger: { error: vi.fn() } }));
vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    chapter: {
      findUnique: vi.fn(async () => ({
        id: "ch1",
        title: "Chapter",
        courseId: "c1",
        readerMode: "DEFAULT",
        archivedAt: null,
        publishedAt: new Date(),
        source: "Teaching text.",
        compiled: null,
        course: { title: "Course", familySlug: null, variantFamily: null, assistant: { effort: "medium", guidance: "Be exact.", starters: ["What is this?"] } },
      })),
    },
  },
}));
vi.mock("../../../src/services/enrollment/api-learn-access.js", () => ({ requireBlockSubmissionAccess: vi.fn(async () => ({ id: "e1", variantSlug: null })) }));
vi.mock("../../../src/services/progress/gate.js", () => ({
  ChapterLockedError: class extends Error {},
  assertChapterUnlocked: vi.fn(async () => undefined),
}));
vi.mock("../../../src/services/ai/chapter-qa/usage.js", () => ({
  reserveQuestion: vi.fn(async () => "row1"),
  recordTokens: record,
  releaseQuestion: release,
  remainingToday: vi.fn(async () => ({ remaining: 19, dailyLimit: 20 })),
}));

const { STREAM_ERROR_MARK, chapterQuestionStatus, streamAnswerAboutChapter } = await import("../../../src/services/ai/chapter-qa/service.js");

const user = { id: "u1", email: "learner@example.com" } as never;
const usage = { input_tokens: 10, output_tokens: 5 };

/** A stand-in for client.messages.stream: emits the given text pieces, then resolves or rejects. */
function fakeClient(pieces: string[], outcome: { stop_reason?: string } | Error) {
  const stream = vi.fn((params: unknown) => {
    void params;
    const listeners: ((text: string) => void)[] = [];
    return {
      on(event: string, listener: (text: string) => void) {
        if (event === "text") listeners.push(listener);
        return this;
      },
      async finalMessage() {
        for (const piece of pieces) listeners.forEach((listener) => listener(piece));
        if (outcome instanceof Error) throw outcome;
        return { usage, stop_reason: outcome.stop_reason ?? "end_turn", content: [] };
      },
    };
  });
  return { client: { messages: { stream } } as never, stream };
}

async function collect(client: never, previous?: { question: string; answer: string }) {
  const streamed = await streamAnswerAboutChapter({ chapterId: "ch1", user, question: "What is this?", previous }, { client });
  const chunks: string[] = [];
  await streamed.run((chunk) => chunks.push(chunk));
  return { streamed, text: chunks.join("") };
}

beforeEach(() => {
  release.mockClear();
  record.mockClear();
});

describe("streamed chapter answers", () => {
  it("writes the text as it is generated and records the tokens", async () => {
    const { client, stream } = fakeClient(["Hello", " there"], {});
    const { streamed, text } = await collect(client);
    expect(text).toBe("Hello there");
    expect(streamed.remaining).toEqual({ remaining: 19, dailyLimit: 20 });
    expect(record).toHaveBeenCalledWith("row1", { inputTokens: 10, outputTokens: 5 });
    expect(release).not.toHaveBeenCalled();
    expect(stream).toHaveBeenCalledOnce();
  });

  it("sends the course's effort, guidance and the one earlier turn to the model", async () => {
    const { client, stream } = fakeClient(["Ok"], {});
    await collect(client, { question: "Earlier?", answer: "Earlier answer." });
    const params = (stream.mock.calls[0] as unknown[])[0] as { output_config: unknown; thinking?: unknown; system: string; messages: { role: string }[] };
    expect(params.output_config).toEqual({ effort: "medium" });
    expect(params.thinking).toBeUndefined();
    expect(params.system).toContain("Be exact.");
    expect(params.messages.map((message) => message.role)).toEqual(["user", "assistant", "user"]);
  });

  it("releases the question and writes the failure after a late error, without the provider's text", async () => {
    const { client } = fakeClient(["Half"], new Error("upstream said: secret detail"));
    const { text } = await collect(client);
    expect(text.startsWith("Half" + STREAM_ERROR_MARK)).toBe(true);
    expect(text).not.toContain("secret detail");
    expect(release).toHaveBeenCalledWith("row1");
  });

  it("releases the question when the model returns no text", async () => {
    const { client } = fakeClient([], {});
    const { text } = await collect(client);
    expect(text.startsWith(STREAM_ERROR_MARK)).toBe(true);
    expect(release).toHaveBeenCalledWith("row1");
  });

  it("answers a refusal with the friendly decline and keeps the question counted", async () => {
    const { client } = fakeClient([], { stop_reason: "refusal" });
    const { text } = await collect(client);
    expect(text).toMatch(/only help with this chapter/);
    expect(release).not.toHaveBeenCalled();
  });
});

describe("chapter question status", () => {
  it("returns the course's starters", async () => {
    expect(await chapterQuestionStatus("ch1", user)).toEqual({ available: true, remaining: 19, dailyLimit: 20, starters: ["What is this?"] });
  });
});
