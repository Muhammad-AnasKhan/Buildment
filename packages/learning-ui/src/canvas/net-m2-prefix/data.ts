import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { PrefixConfig } from "../models/net-address";

// 2.3 beat: the prefix length sets the block size and the mask together. One
// address, 10.20.143.7, and a prefix from /8 to /32; the mask, its bits, the
// block size, the usable count and the first and last address follow.
// The model is in models/net-address.ts.
const TITLE = "The prefix sets the size and the mask";
const PURPOSE = "Drag the prefix length from /8 to /32 on 10.20.143.7 and see the mask, the block size, the usable count and the first and last address change together.";
const LIMITS =
  "IPv4 only, one address at a time. Usable is the size minus two up to /30. A /31 keeps both addresses for a point-to-point link (RFC 3021) and a /32 is a single address. Masks whose ones are not all on the left are not covered.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM2PrefixConfig: PrefixConfig = {
  mode: "prefix",
  address: "10.20.143.7",
  min: 8,
  max: 32,
  initial: 24,
};

function PrefixBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "prefix", config: netM2PrefixConfig });
}

export const netM2Prefix: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: PrefixBeat,
};
