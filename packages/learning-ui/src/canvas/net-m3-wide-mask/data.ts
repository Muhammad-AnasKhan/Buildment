import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { MaskConfig } from "../models/net-subnet";

// 3.2 beat 5: 192.168.1.23/23 covers 192.168.0.0 to 192.168.1.255, so 192.168.0.40 is local although its first three numbers differ. The third number is drawn in bits for the address, the destination and the mask, and the two ANDs are compared.
// The model is in models/net-subnet.ts.
const TITLE = "A /23 reaches across two third numbers";
const PURPOSE = "Type a destination and see whether 192.168.1.23/23 treats it as local, with the third number in bits and the first-three-numbers shortcut checked against the mask.";
const LIMITS =
  "IPv4 only, one fixed mask (/23). The shortcut shown is the one from chapter 1.4, keep the first three numbers, which is right only for a /24. Contiguous masks only.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3WideMaskConfig: MaskConfig = {
  mode: "mask-and",
  view: "wide",
  address: "192.168.1.23",
  prefix: 23,
  destination: "192.168.0.40",
};

function WideMaskBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "mask-and", config: netM3WideMaskConfig });
}

export const netM3WideMask: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: WideMaskBeat,
};
