import type { CustomCanvasSpec } from "../registry";
import { OrderPileCanvas } from "./OrderPileCanvas";

// Why Things Happen course, chapter 6.3 "Loops that pull back, delays and
// stocks". Huda's pile of waiting orders as a tank: 7 orders a day in, 6 cakes
// a day out, 12 waiting at the start, as in the chapter. See spec.md.
export const orderPileStockFlow: CustomCanvasSpec = {
  kind: "custom",
  title: "Huda's pile of waiting orders",
  purpose: "Change the orders that come in and the cakes that go out, and see the pile rise, stay level or drain.",
  limits:
    "Every day here is the same, the oven bakes the same number every day, and all orders are for one cake. Real orders come and go by the day and by the season. The 'react a week late' rule is one simple guess at how customers respond to a long wait; real customers do not all react in the same way or at the same time.",
  component: OrderPileCanvas,
};
