import { describe, expect, it } from "vitest";
import { describeHoldRaceChange, simulateHoldRace } from "@/canvas/ticketline-seat-hold-race/model";

describe("seat hold race", () => {
  it("shows the default overbooking risk and the atomic result", () => {
    expect(simulateHoldRace({ buyers: 6, seats: 4 })).toEqual({
      buyers: 6, seats: 4,
      naive: { accepted: 6, rejected: 0, oversold: 2 },
      atomic: { accepted: 4, rejected: 2, oversold: 0 },
    });
  });

  it("accepts no requests when no seats remain", () => {
    expect(simulateHoldRace({ buyers: 6, seats: 0 })).toEqual({
      buyers: 6, seats: 0,
      naive: { accepted: 0, rejected: 6, oversold: 0 },
      atomic: { accepted: 0, rejected: 6, oversold: 0 },
    });
  });

  it("has no overbooking when buyers fit and handles zero buyers", () => {
    expect(simulateHoldRace({ buyers: 3, seats: 4 }).naive.oversold).toBe(0);
    expect(simulateHoldRace({ buyers: 0, seats: 4 }).atomic).toEqual({ accepted: 0, rejected: 0, oversold: 0 });
  });

  it("bounds large and invalid inputs", () => {
    expect(simulateHoldRace({ buyers: 100, seats: 100 })).toEqual({
      buyers: 16, seats: 12,
      naive: { accepted: 16, rejected: 0, oversold: 4 },
      atomic: { accepted: 12, rejected: 4, oversold: 0 },
    });
    expect(simulateHoldRace({ buyers: Number.NaN, seats: -2 }).buyers).toBe(0);
  });

  it("explains the input and outcome change", () => {
    expect(describeHoldRaceChange({ buyers: 6, seats: 4 }, { buyers: 8, seats: 4 })).toContain("from 2 to 4 overbooked seats");
    expect(describeHoldRaceChange({ buyers: 6, seats: 4 }, { buyers: 6, seats: 4 })).toBe("");
  });
});
