import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { SplitConfig } from "../models/net-subnet";

// 3.5 beat 2: 100 devices need a /25 (126 usable), 50 a /26 (62) and 20 a /27 (30). Each network offers five prefixes, /24 to /28, as native buttons.
// The model is in models/net-subnet.ts.
const TITLE = "Pick the size for each network";
const PURPOSE = "Give each of three networks (100, 50 and 20 devices) the smallest block that holds it, and see how many addresses are spare.";
const LIMITS =
  "Usable hosts are the block size minus two, up to /30. A block too small is refused; a bigger one is allowed and the spare count rises. Sizes only: where each block goes comes in the next pictures.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3SplitSizeConfig: SplitConfig = {
  mode: "split",
  view: "size",
  block: "192.168.10.0/24",
  needs: [{ name: "Staff", hosts: 100 }, { name: "Lab", hosts: 50 }, { name: "Printers", hosts: 20 }],
  choices: [24, 25, 26, 27, 28],
};

function SplitSizeBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "split", config: netM3SplitSizeConfig });
}

export const netM3SplitSize: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitSizeBeat,
};
