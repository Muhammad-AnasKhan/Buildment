import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { SplitConfig } from "../models/net-subnet";

// 3.5 beat 4: the 100-device /25 is already at .0 to .127. The 50-device /26 starts at .100 and is refused with the reason; the learner moves it to a boundary.
// The model is in models/net-subnet.ts.
const TITLE = "Each piece starts on its own boundary";
const PURPOSE = "Slide the 50-device block (a /26) along 192.168.10.0/24 and see where it is allowed to start, and the reason when it is refused.";
const LIMITS =
  "A block of 2^k addresses starts only where its last k bits are zero, so a /26 starts at .0, .64, .128 or .192. The 100-device block already holds the first half, so .0 and .64 are also refused for overlap.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3SplitBoundaryConfig: SplitConfig = {
  mode: "split",
  view: "boundary",
  block: "192.168.10.0/24",
  needs: [{ name: "Staff", hosts: 100 }, { name: "Lab", hosts: 50 }, { name: "Printers", hosts: 20 }],
  startOffset: 100,
};

function SplitBoundaryBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "split", config: netM3SplitBoundaryConfig });
}

export const netM3SplitBoundary: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitBoundaryBeat,
};
