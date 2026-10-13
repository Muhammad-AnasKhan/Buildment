import { describe, expect, it } from "vitest";
import { clampHeartbeatDelta, utcDateOnly } from "./heartbeat";

describe("clampHeartbeatDelta", () => {
  it("caps at 20 seconds", () => {
    expect(clampHeartbeatDelta(15)).toBe(15);
    expect(clampHeartbeatDelta(100)).toBe(20);
  });

  it("rejects non-positive values", () => {
    expect(clampHeartbeatDelta(0)).toBe(0);
    expect(clampHeartbeatDelta(-5)).toBe(0);
  });
});

describe("utcDateOnly", () => {
  it("strips time to UTC midnight", () => {
    const d = utcDateOnly(new Date("2026-03-15T14:30:00Z"));
    expect(d.toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });
});
