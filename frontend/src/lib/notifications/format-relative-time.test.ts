import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./format-relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-10-18T12:00:00Z");

  it("uses compact units for the last week", () => {
    expect(formatRelativeTime("2026-10-18T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-10-18T11:55:00Z", now)).toBe("5m");
    expect(formatRelativeTime("2026-10-18T09:00:00Z", now)).toBe("3h");
    expect(formatRelativeTime("2026-10-16T12:00:00Z", now)).toBe("2d");
  });

  it("treats clock skew as just now", () => {
    expect(formatRelativeTime("2026-10-18T12:00:05Z", now)).toBe("just now");
  });

  it("falls back to a date after a week", () => {
    expect(formatRelativeTime("2026-10-01T12:00:00Z", now)).not.toMatch(/^\d+[mhd]$/);
  });
});
