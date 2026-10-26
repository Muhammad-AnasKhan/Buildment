import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { MaskConfig } from "../models/net-subnet";

// 3.2 beat 7: unassisted practice. Five seeded questions per set (network twice, broadcast twice, same network once); one question per set uses a /20 or a /23.
// The model is in models/net-subnet.ts.
const TITLE = "Network and broadcast by hand";
const PURPOSE = "Five quick questions per set: the network address, the broadcast address and whether another address is on the same network. The wrong options are the slips people really make.";
const LIMITS =
  "Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. Prefixes run from /17 to /30 and skip the multiples of 8, where the first-three-numbers shortcut fails; /31 and /32 are not asked.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3MaskDrillConfig: MaskConfig = {
  mode: "mask-and",
  view: "drill",
};

function MaskDrillBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "mask-and", config: netM3MaskDrillConfig });
}

export const netM3MaskDrill: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: MaskDrillBeat,
};
