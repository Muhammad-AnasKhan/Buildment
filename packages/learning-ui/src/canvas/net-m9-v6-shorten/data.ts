import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { V6Config } from "../models/net-ipv6";

// 9.2 beat 3: 2001:0db8:0000:0000:0001:0000:0000:0001 shortens to 2001:db8::1:0:0:1: two equal zero runs, and the first is compressed. The learner drops the leading zeros and chooses the run.
// The model is in models/net-ipv6.ts.
const TITLE = "Shorten it to the standard form";
const PURPOSE = "Take a full-form address, drop the leading zeros and choose the run of zero groups that becomes ::. The picture says whether the result is the standard form.";
const LIMITS =
  "Standard form is RFC 5952: no leading zeros, lowercase, the longest run of two or more zero groups becomes ::, the first one when two are equally long, and a single zero group stays 0. Other forms can still be valid; they are just not the one to write. The tie rule is in section 4.2.3 of the RFC.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM9V6ShortenConfig: V6Config = {
  mode: "v6",
  view: "shorten",
  addresses: ["2001:0db8:0000:0000:0001:0000:0000:0001", "fe80:0000:0000:0000:1c2b:3aff:fe4d:5e6f", "2001:0db8:0000:0001:0000:0000:0000:0001", "2001:0db8:0000:0001:0001:0001:0001:0001", "fe80:0000:0000:0000:0000:0000:0000:0000"],
};

function V6ShortenBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "v6", config: netM9V6ShortenConfig });
}

export const netM9V6Shorten: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: V6ShortenBeat,
};
