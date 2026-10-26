import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { DrillConfig } from "../models/net-address";

// 2.3 practice: five fresh questions per set on /n blocks: how many addresses,
// and which mask. The two wrong options are the prefixes one step either side.
// Sets are numbered and seeded from the number, like the 2.2 drill.
// The model is in models/net-address.ts.
const TITLE = "Size and mask drill";
const PURPOSE = "Five quick questions per set: how many addresses are in a /n block, and which mask goes with it. The wrong options are the prefixes next door.";
const LIMITS =
  "Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. Prefixes run from /9 to /30, so every wrong option is a real prefix one step away.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM2CidrDrillConfig: DrillConfig = { mode: "drill", questions: "cidr" };

function CidrDrillBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "drill", config: netM2CidrDrillConfig });
}

export const netM2CidrDrill: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: CidrDrillBeat,
};
