import { describe, expect, it } from "vitest";
import { calculateStockHold } from "@/canvas/freshmarket-stock-holds/model";

describe("FreshMarket stock holds", () => {
  it("holds units before payment, then decrements stock and the new hold together", () => {
    const result = calculateStockHold({ stock: 8, held: 2, request: 3 });
    expect(result).toMatchObject({ available: 6, accepted: true, afterHold: { stock: 8, held: 5, available: 3 }, afterPayment: { stock: 5, held: 2, available: 3 } });
  });

  it("refuses an unavailable request without changing counters", () => {
    const result = calculateStockHold({ stock: 4, held: 3, request: 2 });
    expect(result.accepted).toBe(false);
    expect(result.afterHold).toEqual({ stock: 4, held: 3, available: 1 });
    expect(result.afterPayment).toEqual({ stock: 4, held: 3, available: 1 });
  });

  it("handles empty stock and clamps out-of-range inputs", () => {
    expect(calculateStockHold({ stock: 0, held: 8, request: 1 })).toMatchObject({ available: 0, accepted: false });
    expect(calculateStockHold({ stock: 100, held: 100, request: Number.NaN })).toMatchObject({ stock: 20, held: 20, request: 1, accepted: false });
  });
});
