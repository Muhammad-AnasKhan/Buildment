import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { V6Config } from "../models/net-ipv6";

// 9.2 beat 2: an address is eight groups of sixteen bits, so :: stands for however many zero groups bring the written groups up to eight. 2001:db8:4a1:20::5c has five groups written, so :: stands for 3.
// The model is in models/net-ipv6.ts.
const TITLE = "Expand an address, group by group";
const PURPOSE = "Press Expand on 2001:db8:4a1:20::5c to see :: become three zero groups and every group grow to four digits. Type your own address too.";
const LIMITS =
  "IPv6 text only: no neighbour discovery and no routing. 2001:db8::/32 is the documentation range (RFC 3849) and fe80::/10 is link-local; they are examples, not live addresses. Dotted IPv4 endings such as ::ffff:192.0.2.1 are real but not covered. While you type, the picture keeps the last valid address.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM9V6ExpandConfig: V6Config = {
  mode: "v6",
  view: "expand",
  addresses: ["2001:db8:4a1:20::5c", "fe80::1c2b:3aff:fe4d:5e6f", "fe80::", "2001:db8::1:0:0:1"],
};

function V6ExpandBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "v6", config: netM9V6ExpandConfig });
}

export const netM9V6Expand: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: V6ExpandBeat,
};
