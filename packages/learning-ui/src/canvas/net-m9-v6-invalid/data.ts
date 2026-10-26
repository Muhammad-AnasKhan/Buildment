import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { V6Config } from "../models/net-ipv6";

// 9.2 beat 4: 2001:db8::1::5c is invalid (two ::); 2001:0DB8:0:0:0:0:0:5C is valid but not standard. The learner types forms and reads the rule that refuses or corrects them.
// The model is in models/net-ipv6.ts.
const TITLE = "Invalid is not the same as non-standard";
const PURPOSE = "Type an IPv6 address or step through examples and read whether it is invalid (and which rule breaks), valid but not standard (and why), or standard.";
const LIMITS =
  "IPv6 text only. Invalid means no reader can take it (for example two ::). Valid but not standard means every reader accepts it, but RFC 5952 asks writers to use the short form. Dotted IPv4 endings are real but not covered.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM9V6InvalidConfig: V6Config = {
  mode: "v6",
  view: "invalid",
  addresses: ["2001:db8::1::5c", "2001:0DB8:0:0:0:0:0:5C", "2001:db8:0:0:0::5c", "2001:db8::5c", "2001:db8:0:0:1:0:0:1:5", "2001:db8::12345", "fe80::1c2b:3aff:fe4d:5e6f"],
};

function V6InvalidBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "v6", config: netM9V6InvalidConfig });
}

export const netM9V6Invalid: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: V6InvalidBeat,
};
