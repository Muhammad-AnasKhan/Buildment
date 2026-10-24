import type { CustomCanvasSpec } from "../registry";
import { FreshmarketStockHoldsCanvas } from "./FreshmarketStockHoldsCanvas";

export const freshmarketStockHolds: CustomCanvasSpec = {
  kind: "custom",
  title: "What a stock hold changes",
  purpose: "Try a checkout request and see why a hold lowers availability before it lowers stock on the shelf.",
  limits: "This models one product and one new checkout request. It assumes the existing holds are valid and payment either succeeds or the new hold is released. A real checkout also needs expiry, idempotency, and atomic database writes.",
  component: FreshmarketStockHoldsCanvas,
};
