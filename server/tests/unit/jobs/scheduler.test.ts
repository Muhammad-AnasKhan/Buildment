import { describe, expect, it } from "vitest";
import { nextHourlyRunAt, nextJobRunAt, nextRunAt } from "../../../src/jobs/scheduler.js";

describe("nextRunAt", () => {
  it("picks today's slot when it is still ahead", () => {
    const next = nextRunAt(9, new Date("2026-10-13T06:30:00Z"));
    expect(next.toISOString()).toBe("2026-10-13T09:00:00.000Z");
  });

  it("rolls over to tomorrow once the slot has passed, including the exact minute", () => {
    expect(nextRunAt(9, new Date("2026-10-13T09:00:00Z")).toISOString()).toBe("2026-10-14T09:00:00.000Z");
    expect(nextRunAt(9, new Date("2026-10-13T23:59:59Z")).toISOString()).toBe("2026-10-14T09:00:00.000Z");
  });

  it("handles midnight slots across a month boundary", () => {
    expect(nextRunAt(0, new Date("2026-10-31T12:00:00Z")).toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });
});

describe("hourly jobs", () => {
  it("runs at the given minute of the current or next hour", () => {
    expect(nextHourlyRunAt(5, new Date("2026-10-13T06:02:00Z")).toISOString()).toBe("2026-10-13T06:05:00.000Z");
    expect(nextHourlyRunAt(5, new Date("2026-10-13T06:05:00Z")).toISOString()).toBe("2026-10-13T07:05:00.000Z");
    expect(nextHourlyRunAt(5, new Date("2026-10-13T23:30:00Z")).toISOString()).toBe("2026-10-14T00:05:00.000Z");
  });

  it("picks daily or hourly scheduling from the job definition", () => {
    const from = new Date("2026-10-13T06:30:00Z");
    expect(nextJobRunAt({ minute: 5 }, from).toISOString()).toBe("2026-10-13T07:05:00.000Z");
    expect(nextJobRunAt({ hourUtc: 0 }, from).toISOString()).toBe("2026-10-14T00:00:00.000Z");
  });
});
