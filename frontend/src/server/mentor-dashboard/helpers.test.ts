import { describe, expect, it } from "vitest";
import { activityState, average, formatLastActive, progressState } from "./helpers";

describe("mentor dashboard helpers", () => {
  const now = new Date("2026-09-23T12:00:00.000Z").getTime();

  it("classifies recent, inactive, and never-active learners objectively", () => {
    expect(activityState(null, now)).toBe("never");
    expect(activityState(new Date("2026-09-22T12:00:00.000Z"), now)).toBe("recent");
    expect(activityState(new Date("2026-09-15T12:00:00.000Z"), now)).toBe("inactive");
  });

  it("derives progress state from enrollment rollups", () => {
    expect(progressState("ASSIGNED", 0)).toBe("not-started");
    expect(progressState("IN_PROGRESS", 20)).toBe("in-progress");
    expect(progressState("COMPLETED", 100)).toBe("completed");
  });

  it("handles empty and populated cohort averages", () => {
    expect(average([])).toBe(0);
    expect(average([10, 40, 100])).toBe(50);
  });

  it("formats last activity without implying competence", () => {
    expect(formatLastActive(null, now)).toBe("Not started");
    expect(formatLastActive(new Date(now - 10 * 60000), now)).toBe("10 min ago");
  });
});
