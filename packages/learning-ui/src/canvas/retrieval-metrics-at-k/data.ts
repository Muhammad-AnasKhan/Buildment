import type { CustomCanvasSpec } from "../registry";
import { RetrievalMetricsCanvas } from "./RetrievalMetricsCanvas";

// AI Engineering Interview course, chapter 5.2 "Retrieval metrics". The
// ranked list and its four relevant chunks match the worked example in that
// chapter. See spec.md.
export const retrievalMetricsAtK: CustomCanvasSpec = {
  kind: "custom",
  title: "Recall and precision as k changes",
  purpose: "Change how many retrieved chunks you keep and watch recall, precision and reciprocal rank move.",
  limits:
    "This is one query with yes or no relevance and a fixed ranking. Real evaluation averages over many queries (MRR is the mean of the reciprocal ranks), and some chunks are partly relevant, which graded metrics such as nDCG handle. A larger k also costs tokens and latency, which this model does not show.",
  component: RetrievalMetricsCanvas,
};
