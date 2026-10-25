import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/db/prisma.js";
import { logger } from "../../src/utils/logger.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

const KEY = "sk-or-v1-plaintext-key-that-must-never-leak-1234";
const OTHER_KEY = "sk-or-v1-second-plaintext-key-never-leaks-9876";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const fetchMock = vi.fn<typeof fetch>();
const logged: string[] = [];

beforeAll(async () => {
  fx = await createCourseFixture();
  vi.stubGlobal("fetch", fetchMock);
  for (const level of ["trace", "debug", "info", "warn", "error", "fatal"] as const) {
    vi.spyOn(logger, level).mockImplementation(((...args: unknown[]) => {
      logged.push(JSON.stringify(args, (_key, value) => (value instanceof Error ? `${value.name}: ${value.message}` : value)));
    }) as never);
  }
  for (const method of ["log", "info", "warn", "error"] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      logged.push(args.map(String).join(" "));
    });
  }
});
afterEach(() => fetchMock.mockReset());
afterAll(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await prisma.aiCredential.deleteMany({ where: { userId: fx.learner.id } });
  await fx.cleanup();
});

const as = (token: string | null) => ({
  get: () => auth(request(app).get("/api/v1/learner/ai-credential"), token),
  put: (body: object) => auth(request(app).put("/api/v1/learner/ai-credential").send(body), token),
  patch: (body: object) => auth(request(app).patch("/api/v1/learner/ai-credential").send(body), token),
  test: () => auth(request(app).post("/api/v1/learner/ai-credential/test"), token),
  del: () => auth(request(app).delete("/api/v1/learner/ai-credential"), token),
});
const auth = (req: request.Test, token: string | null) => (token ? req.set("Authorization", `Bearer ${token}`) : req);

const bodies: string[] = [];
const record = (res: request.Response) => {
  bodies.push(JSON.stringify(res.body ?? null), JSON.stringify(res.headers));
  return res;
};

describe("learner AI credential", () => {
  it("requires a signed-in learner", async () => {
    expect((await as(null).get()).status).toBe(401);
  });

  it("reports no key before one is saved", async () => {
    const res = record(await as(fx.learnerToken).get());
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ configured: true, hasKey: false, lastFour: null, model: null });
    expect(res.body.data.defaultModel).toBeTruthy();
  });

  it("refuses a key OpenRouter rejects and stores nothing", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { error: { message: "No auth credentials found" } }));
    const res = record(await as(fx.learnerToken).put({ apiKey: KEY }));
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("AI_KEY_INVALID");
    expect(await prisma.aiCredential.count({ where: { userId: fx.learner.id } })).toBe(0);
  });

  it("validates with GET /key, then stores only ciphertext and the last four characters", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { limit_remaining: 5, is_free_tier: false } }));
    const res = record(await as(fx.learnerToken).put({ apiKey: `  ${KEY}  `, model: "openai/gpt-4o-mini" }));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ hasKey: true, lastFour: "1234", model: "openai/gpt-4o-mini" });
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://openrouter.ai/api/v1/key");

    const row = await prisma.aiCredential.findUniqueOrThrow({ where: { userId: fx.learner.id } });
    expect(JSON.stringify(row)).not.toContain(KEY);
    expect(row.lastFour).toBe("1234");
  });

  it("replaces the key and changes the model without a new key", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { limit_remaining: null } }));
    const replaced = record(await as(fx.learnerToken).put({ apiKey: OTHER_KEY }));
    expect(replaced.body.data).toMatchObject({ lastFour: "9876", model: null });

    const patched = record(await as(fx.learnerToken).patch({ model: "meta-llama/llama-3.3-70b-instruct:free" }));
    expect(patched.status).toBe(200);
    expect(patched.body.data.model).toBe("meta-llama/llama-3.3-70b-instruct:free");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a malformed model id", async () => {
    const res = record(await as(fx.learnerToken).patch({ model: "not a model" }));
    expect(res.status).toBe(400);
  });

  it("re-tests the saved key with the decrypted value", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: { limit_remaining: 1 } }));
    const res = record(await as(fx.learnerToken).test());
    expect(res.status).toBe(200);
    const init = fetchMock.mock.calls[0]![1]!;
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${OTHER_KEY}`);
    expect(res.body.data.lastUsedAt).toBeTruthy();
  });

  it("explains an out of credit key", async () => {
    fetchMock.mockResolvedValueOnce(json(402, {}));
    const res = record(await as(fx.learnerToken).test());
    expect(res.status).toBe(402);
    expect(res.body.code).toBe("AI_OUT_OF_CREDIT");
  });

  it("reports that the feature is not set up when the server has no encryption key", async () => {
    const saved = env.AI_KEY_ENCRYPTION_KEY;
    env.AI_KEY_ENCRYPTION_KEY = undefined;
    try {
      const status = record(await as(fx.learnerToken).get());
      expect(status.body.data.configured).toBe(false);
      const res = record(await as(fx.learnerToken).put({ apiKey: KEY }));
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ code: "AI_NOT_CONFIGURED", message: "AI interviews are not set up on this server." });
    } finally {
      env.AI_KEY_ENCRYPTION_KEY = saved;
    }
  });

  it("deletes the key", async () => {
    const res = await as(fx.learnerToken).del();
    expect(res.status).toBe(204);
    expect(await prisma.aiCredential.count({ where: { userId: fx.learner.id } })).toBe(0);
  });

  it("rate limits key checks per learner", async () => {
    // Six saves and tests ran above; the seventh inside ten minutes is refused before OpenRouter is called.
    const res = record(await as(fx.learnerToken).put({ apiKey: KEY }));
    expect(res.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never puts the plaintext key in a response body, header or log line", () => {
    expect(bodies.length).toBeGreaterThan(10);
    expect(logged.length).toBeGreaterThan(0);
    for (const text of [...bodies, ...logged]) {
      expect(text).not.toContain(KEY);
      expect(text).not.toContain(OTHER_KEY);
    }
  });
});
