import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { OverlapConfig } from "../models/net-subnet";

// 3.6 beat 2: each block is a stretch of address numbers on one line. 172.17.0.0/16 runs from 2,886,795,264 to 2,886,860,799; the office /24 starts inside it at 172.17.5.0.
// The model is in models/net-subnet.ts.
const TITLE = "Blocks are ranges on one line";
const PURPOSE = "Slide an office network of 256 addresses along the line of addresses and see when it lands inside Docker's default 172.17.0.0/16.";
const LIMITS =
  "IPv4 ranges on one line, from 172.16.0.0 to 172.19.255.255 only. No routing consequence is modelled: the overlap is shown, not what a router then does. A /24 is far narrower than the line, so it is drawn at a minimum width. 172.17.0.0/16 is what one test machine showed as its default bridge; check your own with docker network inspect bridge.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3OverlapLineConfig: OverlapConfig = {
  mode: "overlap",
  view: "line",
  fixedName: "Docker",
  fixed: "172.17.0.0/16",
  movingName: "Office",
  moving: "172.17.5.0/24",
  window: "172.16.0.0/14",
};

function OverlapLineBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "overlap", config: netM3OverlapLineConfig });
}

export const netM3OverlapLine: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: OverlapLineBeat,
};
