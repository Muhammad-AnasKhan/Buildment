import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { SplitConfig } from "../models/net-subnet";

// 3.5 beat 3: 192.168.10.0/25 takes .0 to .127 and the free space is the other half. The block is drawn as a bar of 256 addresses; each tap places a block at the lowest free boundary of its size.
// The model is in models/net-subnet.ts.
const TITLE = "Place the biggest block first";
const PURPOSE = "Drop each block into 192.168.10.0/24 at the first free boundary. Place the 100-device block first, then try the order the other way round.";
const LIMITS =
  "Each block goes to the lowest free boundary of its own size; there is no choice of place. Biggest first leaves one free piece at the end. Smallest first can leave a gap, which still fits here but strands space when the sizes change.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3SplitPlaceConfig: SplitConfig = {
  mode: "split",
  view: "place",
  block: "192.168.10.0/24",
  needs: [{ name: "Staff", hosts: 100 }, { name: "Lab", hosts: 50 }, { name: "Printers", hosts: 20 }],
};

function SplitPlaceBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "split", config: netM3SplitPlaceConfig });
}

export const netM3SplitPlace: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitPlaceBeat,
};
