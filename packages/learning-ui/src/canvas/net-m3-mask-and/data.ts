import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { MaskConfig } from "../models/net-subnet";

// 3.2 beat 3: the network address is the address AND the mask. Four byte buttons show the address, the mask and the result for each byte; the chosen byte opens into eight address bits you can flip, the mask bits and the AND.
// The model is in models/net-subnet.ts.
const TITLE = "Address AND mask gives the network";
const PURPOSE = "Flip bits of 10.20.143.7 under the mask /20, one byte at a time, and see which bits the AND keeps and which it clears to zero.";
const LIMITS =
  "IPv4 only, one fixed mask (/20). The AND is shown one byte at a time: under this mask the first two bytes are kept whole and the last is cleared. Contiguous masks only.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3MaskAndConfig: MaskConfig = {
  mode: "mask-and",
  view: "and",
  address: "10.20.143.7",
  prefix: 20,
};

function MaskAndBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "mask-and", config: netM3MaskAndConfig });
}

export const netM3MaskAnd: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MaskAndBeat,
};
