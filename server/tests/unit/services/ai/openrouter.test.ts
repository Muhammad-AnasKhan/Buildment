import { describe, expect, it, vi } from "vitest";
import { AiError, checkOpenRouterKey, createChatCompletion } from "../../../../src/services/ai/openrouter.js";

const apiKey = "sk-or-v1-secret-value-for-tests-0000";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const reply = (content: string) => json(200, { choices: [{ message: { content } }] });

function timeoutError() {
  const error = new Error("The operation was aborted due to timeout");
  error.name = "TimeoutError";
  return error;
}

async function caught(promise: Promise<unknown>): Promise<AiError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(AiError);
    return error as AiError;
  }
  throw new Error("expected an AiError");
}

describe("checkOpenRouterKey", () => {
  it("calls GET /api/v1/key with the key as a bearer token", async () => {
    const fetchImpl = vi.fn(async () => json(200, { data: { limit_remaining: null, is_free_tier: true } }));
    await expect(checkOpenRouterKey(apiKey, { fetchImpl })).resolves.toEqual({ limitRemaining: null, isFreeTier: true });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/key");
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${apiKey}`);
  });

  it.each([
    [401, "AI_KEY_INVALID", 422],
    [402, "AI_OUT_OF_CREDIT", 402],
    [429, "AI_RATE_LIMITED", 429],
    [500, "AI_PROVIDER_ERROR", 502],
  ])("maps HTTP %i to %s", async (status, code, httpStatus) => {
    const error = await caught(checkOpenRouterKey(apiKey, { fetchImpl: async () => json(status, { error: { message: `bad ${apiKey}` } }) }));
    expect(error.code).toBe(code);
    expect(error.statusCode).toBe(httpStatus);
    expect(error.message).not.toContain(apiKey);
    expect(error.cause).toBeUndefined();
  });

  it("treats a key with no credit left as out of credit", async () => {
    const error = await caught(checkOpenRouterKey(apiKey, { fetchImpl: async () => json(200, { data: { limit_remaining: 0 } }) }));
    expect(error.code).toBe("AI_OUT_OF_CREDIT");
  });
});

describe("createChatCompletion", () => {
  const base = { apiKey, model: "test/model", messages: [{ role: "user" as const, content: "Hi" }], maxTokens: 50 };

  it("returns the trimmed reply", async () => {
    await expect(createChatCompletion({ ...base, fetchImpl: async () => reply("  Why?  ") })).resolves.toBe("Why?");
  });

  it("retries a timeout once and then succeeds", async () => {
    const fetchImpl = vi.fn().mockRejectedValueOnce(timeoutError()).mockResolvedValueOnce(reply("Second try"));
    await expect(createChatCompletion({ ...base, fetchImpl })).resolves.toBe("Second try");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("gives up after a second timeout with a clear error", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(timeoutError());
    const error = await caught(createChatCompletion({ ...base, fetchImpl }));
    expect(error.code).toBe("AI_PROVIDER_TIMEOUT");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry an invalid key", async () => {
    const fetchImpl = vi.fn(async () => json(401, {}));
    const error = await caught(createChatCompletion({ ...base, fetchImpl }));
    expect(error.code).toBe("AI_KEY_INVALID");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("treats an empty reply as a provider error", async () => {
    const error = await caught(createChatCompletion({ ...base, fetchImpl: async () => reply("   ") }));
    expect(error.code).toBe("AI_PROVIDER_ERROR");
  });
});
