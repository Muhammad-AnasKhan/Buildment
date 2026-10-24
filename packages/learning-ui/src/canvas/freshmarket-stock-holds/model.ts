export type StockHoldInputs = { stock: number; held: number; request: number };

export const STOCK_HOLD_BOUNDS = {
  stock: { min: 0, max: 20, default: 8 },
  held: { min: 0, max: 20, default: 2 },
  request: { min: 1, max: 10, default: 3 },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : min;
}

export function calculateStockHold(input: StockHoldInputs) {
  const stock = clamp(input.stock, STOCK_HOLD_BOUNDS.stock.min, STOCK_HOLD_BOUNDS.stock.max);
  const held = clamp(input.held, 0, stock);
  const request = clamp(input.request, STOCK_HOLD_BOUNDS.request.min, STOCK_HOLD_BOUNDS.request.max);
  const available = stock - held;
  const accepted = request <= available;
  const newHold = accepted ? request : 0;
  const afterHold = { stock, held: held + newHold, available: available - newHold };
  const afterPayment = { stock: stock - newHold, held, available: available - newHold };

  return { stock, held, request, available, accepted, afterHold, afterPayment };
}
