import type { CustomCanvasSpec } from "../registry";
import { GeohashZoomCanvas } from "./GeohashZoomCanvas";

// 24.2 beat 2: tap a sub-box to zoom in and add a letter to a geohash.
// Model: models/geohash-zoom.ts.
export const sysdesignM24GeohashZoom: CustomCanvasSpec = {
  kind: "custom",
  title: "A short code for every box",
  purpose: "Start with the whole world cut into 32 boxes, each with one letter. Tap a box to zoom into it and add its letter, up to seven letters. A longer code names a smaller box inside the bigger one.",
  limits:
    "The picture draws every box as the same size so that the 32 letters stay big enough to tap, so it does not show the true shape of the box. Real boxes are 8 columns by 4 rows for odd letters and 4 columns by 8 rows for even ones, and the sizes (for example 1.2 km by 0.6 km at six letters) are measured at the equator. Boxes get narrower away from the equator. The nested boxes in the corner shrink by a fixed share for each letter so that seven of them stay visible; the true shrink is 8 or 4 times a letter.",
  component: GeohashZoomCanvas,
};
