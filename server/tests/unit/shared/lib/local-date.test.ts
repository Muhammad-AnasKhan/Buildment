import { describe, expect, it } from "vitest";
import {
  localDayKey,
  safeTimeZone,
  shiftDayKey,
  startOfLocalDay,
  weekStartKey,
} from "../../../../src/shared/lib/local-date.js";

describe("local dates", () => {
  it("falls back to UTC for unset or unknown timezones", () => {
    expect(safeTimeZone(undefined)).toBe("UTC");
    expect(safeTimeZone("")).toBe("UTC");
    expect(safeTimeZone("Mars/Olympus")).toBe("UTC");
    expect(safeTimeZone("Asia/Karachi")).toBe("Asia/Karachi");
  });

  it("puts 1 AM in Karachi on the learner's day, not the UTC one", () => {
    const instant = new Date("2026-10-22T20:30:00Z"); // 01:30 on the 23rd in UTC+5
    expect(localDayKey(instant, "UTC")).toBe("2026-10-22");
    expect(localDayKey(instant, "Asia/Karachi")).toBe("2026-10-23");
  });

  it("puts late evening in Los Angeles on the previous UTC day", () => {
    const instant = new Date("2026-10-23T05:00:00Z"); // 22:00 on the 22nd in UTC-7
    expect(localDayKey(instant, "America/Los_Angeles")).toBe("2026-10-22");
  });

  it("finds the Monday that starts a week", () => {
    expect(weekStartKey("2026-10-19")).toBe("2026-10-19"); // Monday
    expect(weekStartKey("2026-10-25")).toBe("2026-10-19"); // Sunday
    expect(weekStartKey("2026-10-26")).toBe("2026-10-26");
  });

  it("shifts across month and year ends", () => {
    expect(shiftDayKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDayKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("returns the instant a learner's day begins, including across DST", () => {
    expect(startOfLocalDay("2026-10-23", "Asia/Karachi").toISOString()).toBe("2026-10-22T19:00:00.000Z");
    expect(startOfLocalDay("2026-10-23", "UTC").toISOString()).toBe("2026-10-23T00:00:00.000Z");
    // New York leaves daylight time on 2026-11-01: midnight is still EDT (UTC-4) that morning.
    expect(startOfLocalDay("2026-11-01", "America/New_York").toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(startOfLocalDay("2026-11-02", "America/New_York").toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });
});
