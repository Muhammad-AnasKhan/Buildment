import { describe, expect, it } from "vitest";
import {
  DAYS,
  DEFAULT_INPUT,
  describeChange,
  describeTrend,
  simulatePile,
  waitDays,
} from "@buildment/learning-ui/canvas/order-pile-stock-flow/model";

describe("order pile stock and flow", () => {
  it("matches chapter 6.3 by default: 7 in, 6 out, 12 waiting, so 18 after one week", () => {
    const run = simulatePile(DEFAULT_INPUT);
    expect(run.rows).toHaveLength(DAYS);
    expect(run.firstDayChange).toBe(1);
    expect(run.rows[5].pile).toBe(18);
    expect(run.endPile).toBe(36);
    expect(run.endWaitDays).toBe(6);
  });

  it("keeps the pile level when inflow equals outflow, however high it is", () => {
    const run = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 6, startPile: 18 });
    expect(run.rows.every((row) => row.pile === 18)).toBe(true);
    expect(describeTrend(run)).toMatch(/stays at 18/);
  });

  it("still grows when the inflow falls but stays above the outflow", () => {
    const eight = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 8 });
    const seven = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 7 });
    expect(eight.endPile).toBe(60);
    expect(seven.endPile).toBeGreaterThan(DEFAULT_INPUT.startPile);
  });

  it("drains when fewer orders come in than cakes go out, and never goes below zero", () => {
    const run = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 5 });
    expect(run.rows[11].pile).toBe(0);
    expect(run.endPile).toBe(0);
    expect(run.rows.every((row) => row.pile >= 0)).toBe(true);
    expect(describeTrend(run)).toMatch(/empty by day 12/);
  });

  it("overshoots when customers react a week late", () => {
    const run = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 8, startPile: 0, customersReact: true });
    expect(run.peakPile).toBe(17);
    expect(run.endPile).toBeLessThan(run.peakPile);
    expect(describeTrend(run)).toMatch(/rose to 17/);
  });

  it("handles the minimum and maximum inputs", () => {
    const low = simulatePile({ ordersPerDay: 3, bakedPerDay: 10, startPile: 0, customersReact: false });
    expect(low.endPile).toBe(0);
    const high = simulatePile({ ordersPerDay: 10, bakedPerDay: 4, startPile: 24, customersReact: false });
    expect(high.endPile).toBe(24 + 6 * DAYS);
  });

  it("clamps out-of-range input and falls back on non-numbers", () => {
    const run = simulatePile({ ordersPerDay: 99, bakedPerDay: Number.NaN, startPile: -5, customersReact: false });
    expect(run.input).toEqual({ ordersPerDay: 10, bakedPerDay: 6, startPile: 0, customersReact: false });
  });

  it("gives the wait as pile divided by cakes a day", () => {
    expect(waitDays(22, 6)).toBe(3.7);
    expect(waitDays(18, 6)).toBe(3);
  });

  it("explains the change in words", () => {
    const before = simulatePile(DEFAULT_INPUT);
    const after = simulatePile({ ...DEFAULT_INPUT, ordersPerDay: 6 });
    expect(describeChange(before, after)).toMatch(/Orders went from 7 to 6 a day/);
    expect(describeChange(before, after)).toMatch(/now 12, not 36/);
  });
});
