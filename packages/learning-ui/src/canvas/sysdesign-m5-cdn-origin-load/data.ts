import type { CustomCanvasSpec } from "../registry";
import { CdnOriginLoadCanvas } from "./CdnOriginLoadCanvas";

// 5.7 "Predict the origin's load". Model: models/cdn-origin.ts.
export const sysdesignM5CdnOriginLoad: CustomCanvasSpec = {
  kind: "custom",
  title: "Predict the origin's load",
  purpose: "Drag the edge lifetime and the traffic each edge gets, switch the shield on, and watch the edge hit rate, the origin's requests a minute and the oldest page a shopper can see.",
  limits:
    "The formula is derived for the course, not measured: requests arrive at random, all 20 edges get the same traffic for one page, and an edge never evicts the page early (a real edge evicts rarely read objects, which lowers the hit rate for the long tail of a catalogue). Three of the 20 edges are drawn. The shield is modelled as one shared copy with the same lifetime, which is why the oldest page can be about twice the lifetime. The fetch dots slow down and speed up with the real rate, but squeezed so a trickle is still visible.",
  component: CdnOriginLoadCanvas,
};
