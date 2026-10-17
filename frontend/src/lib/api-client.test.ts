import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchApiResponse } from "./api-client";
import { safelyRunChapterAction } from "../components/teach/editor/chapter-action-result";

afterEach(() => vi.unstubAllGlobals());

describe("API connection failures", () => {
  it("recovers a read after a transient failure", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce(new Response("ok"));
    vi.stubGlobal("fetch", fetch);
    expect(await (await fetchApiResponse("/api/v1/test")).text()).toBe("ok");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("reports persistent failures as unavailable, retaining the cause", async () => {
    const cause = new TypeError("fetch failed");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(cause));
    await expect(fetchApiResponse("/api/v1/test")).rejects.toMatchObject({ status: 503, code: "API_UNAVAILABLE", cause });
  });
  it("never retries a mutation", async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetch);
    await expect(fetchApiResponse("/api/v1/test", { method: "POST" })).rejects.toMatchObject({ code: "API_UNAVAILABLE" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("preserves cancellation", async () => {
    const error = new DOMException("Aborted", "AbortError");
    const fetch = vi.fn().mockRejectedValue(error);
    vi.stubGlobal("fetch", fetch);
    await expect(fetchApiResponse("/api/v1/test")).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("turns a rejected chapter action into an error and allows the next attempt", async () => {
    const action = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce({ ok: true });
    expect(await safelyRunChapterAction(action)).toMatchObject({ ok: false });
    expect(await safelyRunChapterAction(action)).toEqual({ ok: true });
  });
});
