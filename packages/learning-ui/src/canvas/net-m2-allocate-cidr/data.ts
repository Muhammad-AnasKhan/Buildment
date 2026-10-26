import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { AllocateConfig } from "../models/net-address";

// 2.3 beat: CIDR sizes each block to the need. The same five made-up
// organisations as net-m2-allocate-class, but the learner now picks a prefix
// from /19 to /27 for each. A block too small is refused; a bigger one is
// allowed and the unused count rises. The model is in models/net-address.ts.
const TITLE = "Give each organisation the right size";
const PURPOSE = "The same five organisations, but now you choose a prefix from /19 to /27 for each. A block too small is refused; a bigger one is allowed and the unused count rises.";
const LIMITS =
  "The five organisations are made up. Usable is the block size minus two, and real allocations were never this tidy: registries also round up for growth and keep blocks aligned. The routing table count is one entry per block, before any blocks are merged.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM2AllocateCidrConfig: AllocateConfig = {
  mode: "allocate",
  flavour: "cidr",
  orgs: [
    { name: "Print shop", need: 30 },
    { name: "Law firm", need: 300 },
    { name: "School", need: 700 },
    { name: "Hospital", need: 2000 },
    { name: "Retailer", need: 5000 },
  ],
  choices: [19, 20, 21, 22, 23, 24, 25, 26, 27].map((prefix) => ({ prefix, label: `/${prefix}` })),
};

function AllocateCidrBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "allocate", config: netM2AllocateCidrConfig });
}

export const netM2AllocateCidr: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: AllocateCidrBeat,
};
