import type { CustomCanvasSpec } from "../registry";
import { TraceRequestCanvas } from "./TraceRequestCanvas";

// 17.2 beat 4, "Tap the span that holds the time". Model: ./model.ts.
export const sysdesignM17TraceRequest: CustomCanvasSpec = {
  kind: "custom",
  title: "Tap the span that holds the time",
  purpose: "Switch between a fast and a slow order and tap a span in the trace. A row's own time is its duration minus its children, and in the slow order one call to the card provider holds 742 of the 780 ms.",
  limits:
    "The services (api, menu, payments), the span names and every start, end and duration are course numbers for the made-up Souq Express app, shaped like the trace in challenge 16. A real trace has many more spans, calls that run side by side, and spans from queues and retries. Here the children never overlap, so own time is simply a span's duration minus its children's durations.",
  component: TraceRequestCanvas,
};
