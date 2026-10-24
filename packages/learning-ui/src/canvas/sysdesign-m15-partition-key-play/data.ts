import type { CustomCanvasSpec } from "../registry";
import { PartitionKeyPlayCanvas } from "./PartitionKeyPlayCanvas";

// 15.4 beat 5, "Choose a key: order against balance". Model: ./model.ts.
export const sysdesignM15PartitionKeyPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Choose a key: order against balance",
  purpose: "Tap a key and watch two things at once: whether related events stay in order, and how evenly four partitions are loaded.",
  limits:
    "One fixed data set of 1,000 events: 200 orders of 5 events each, 50 customers (a few very popular) and 3 countries, made up for the course and placed by a fixed hash. The perfectly even 250 events a partition for order id is a property of this data set and this hash, because every order has exactly 5 events; real orders vary, and real traffic would be a little uneven. Ordering is judged by whether all events of an order, or of a customer, land in one partition.",
  component: PartitionKeyPlayCanvas,
};
