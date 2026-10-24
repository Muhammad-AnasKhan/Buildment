import type { CustomCanvasSpec } from "../registry";
import { FreshmarketCartSplitCanvas } from "./FreshmarketCartSplitCanvas";

export const freshmarketCartSplit: CustomCanvasSpec = {
  kind: "custom",
  title: "One cart, separate store orders",
  purpose: "Change the cart and see how one customer checkout creates an order for each store with items.",
  limits: "This shows order grouping only. It leaves out prices, stock checks, payment failure, and database rollback. The server must read the cart and group it; the browser cannot choose store ownership.",
  component: FreshmarketCartSplitCanvas,
};
