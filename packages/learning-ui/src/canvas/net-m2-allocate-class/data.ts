import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { AllocateConfig } from "../models/net-address";

// 2.1 beat: fixed classes force a block that is too big. Five made-up
// organisations need 30 to 5,000 computers; the learner gives each a class C
// (254 usable) or a class B (65,534 usable) and watches the unused addresses
// and the routing table add up. The model is in models/net-address.ts.
const TITLE = "Give each organisation a class";
const PURPOSE = "Five organisations need 30 to 5,000 computers. Give each one a class C or class B block and watch the unused addresses and the routes add up.";
const LIMITS =
  "The five organisations are made up. Usable is the block size minus two, and real allocations were never this tidy. Class A is left out because none of these organisations needs a block that big. The picture counts addresses in a block, not what a registry would have granted.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM2AllocateClassConfig: AllocateConfig = {
  mode: "allocate",
  flavour: "class",
  orgs: [
    { name: "Print shop", need: 30 },
    { name: "Law firm", need: 300 },
    { name: "School", need: 700 },
    { name: "Hospital", need: 2000 },
    { name: "Retailer", need: 5000 },
  ],
  choices: [
    { prefix: 24, label: "Class C" },
    { prefix: 16, label: "Class B" },
  ],
};

function AllocateClassBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "allocate", config: netM2AllocateClassConfig });
}

export const netM2AllocateClass: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: AllocateClassBeat,
};
