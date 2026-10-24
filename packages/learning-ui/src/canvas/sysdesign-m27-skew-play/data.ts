import type { CustomCanvasSpec } from "../registry";
import { SkewPlayCanvas } from "./SkewPlayCanvas";

// 27.4 beat 5: the skew of the views and the cache size against the origin load.
// Model: models/lamha-skew.ts. Course numbers: models/lamha-numbers.ts.
export const sysdesignM27SkewPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the skew, watch the origin",
  purpose: "Drag the skew of the views and the size of the edge cache and watch the curve, the share of plays answered at the edge and the origin load against its 1 Tbit/s budget.",
  limits:
    "A Zipf shape with invented exponents, not a measurement (a real figure is listed as source needed in the chapter). The catalogue is 1 billion videos, the peak is 12.5 Tbit/s and the origin budget is 1 Tbit/s: course numbers. The model treats a video as one unit when a cache holds pieces, assumes the cache holds exactly the most-watched videos where a real LRU rule only approximates that, and uses one cache where a real CDN has many edges, each seeing a slice of the audience with its own skew. It leaves out new uploads, which are not yet popular, and videos that go viral.",
  component: SkewPlayCanvas,
};
