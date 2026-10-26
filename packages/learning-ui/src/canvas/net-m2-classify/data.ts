import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { ClassifyConfig } from "../models/net-address";

// 2.4 beat: every IPv4 address is public, private (RFC 1918), shared
// (100.64.0.0/10) or special (the IANA registry). Twelve addresses, mixed:
// tap one, then its kind; a wrong try says why. The sorting is `classify()` in
// models/net-address.ts, the same function the 2.5 exercise tests.
const TITLE = "Sort twelve addresses";
const PURPOSE = "Tap an address, then the kind it belongs to: public, private, shared or special. A wrong try says why.";
const LIMITS =
  "The sorting uses the course's prefix list: the three RFC 1918 blocks, 100.64.0.0/10, the special-purpose rows named in the chapter, and multicast. A real registry has more rows. 203.0.113.45 is a documentation address: the course uses it as a stand-in for a public server, but it is sorted as special.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM2ClassifyConfig: ClassifyConfig = {
  mode: "classify",
  addresses: [
    "192.168.1.23",
    "127.0.0.1",
    "1.1.1.1",
    "100.72.14.9",
    "172.17.0.3",
    "172.32.0.1",
    "169.254.10.20",
    "10.20.143.7",
    "203.0.113.45",
    "192.169.1.1",
    "172.31.255.254",
    "0.0.0.0",
  ],
};

function ClassifyBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "classify", config: netM2ClassifyConfig });
}

export const netM2Classify: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ClassifyBeat,
};
