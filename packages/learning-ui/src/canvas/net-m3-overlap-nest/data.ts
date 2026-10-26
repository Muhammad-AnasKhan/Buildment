import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { OverlapConfig } from "../models/net-subnet";

// 3.6 beat 3: two valid CIDR blocks either contain one another or share nothing. Both addresses are drawn as 32 bits; the shorter prefix pins down the leading bits, and the blocks nest exactly when those bits agree.
// The model is in models/net-subnet.ts.
const TITLE = "Valid blocks nest or stay apart";
const PURPOSE = "Change the size and place of the office block and compare its bits with Docker's 172.17.0.0/16: the two either share the first bits and nest, or differ and share nothing.";
const LIMITS =
  "IPv4 only. Valid blocks only: each starts where its host bits are zero, so two blocks can never overlap by halves. Blocks that only touch share no address and are not an overlap. The office block moves inside 172.16.0.0/12 (172.16.0.0 to 172.31.255.255).";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3OverlapNestConfig: OverlapConfig = {
  mode: "overlap",
  view: "nest",
  fixedName: "Docker",
  fixed: "172.17.0.0/16",
  movingName: "Office",
  moving: "172.17.5.0/24",
  window: "172.16.0.0/12",
  minPrefix: 12,
  maxPrefix: 28,
};

function OverlapNestBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "overlap", config: netM3OverlapNestConfig });
}

export const netM3OverlapNest: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: OverlapNestBeat,
};
