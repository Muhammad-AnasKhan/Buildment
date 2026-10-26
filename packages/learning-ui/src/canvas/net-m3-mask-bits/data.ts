import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { MaskConfig } from "../models/net-subnet";

// 3.2 beat 2: the mask is 32 bits, n ones then zeros, and the ones mark the network part of an address. The campus address 10.20.143.7 and a prefix from /8 to /32; the address bits and the mask bits sit one above the other, the first n of both tinted, with each byte's value above it.
// The model is in models/net-subnet.ts.
const TITLE = "The mask marks the network part";
const PURPOSE = "Change the prefix length on 10.20.143.7 and see the mask's 1 bits cover the first part of the address: the network part, with the rest left for hosts.";
const LIMITS =
  "IPv4 only, one address at a time. Contiguous masks only: the 1 bits are all on the left. The picture shows which bits are network and which are host; the AND that uses the mask is the next picture.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3MaskBitsConfig: MaskConfig = {
  mode: "mask-and",
  view: "bits",
  address: "10.20.143.7",
  prefix: 20,
  min: 8,
  max: 32,
};

function MaskBitsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "mask-and", config: netM3MaskBitsConfig });
}

export const netM3MaskBits: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MaskBitsBeat,
};
