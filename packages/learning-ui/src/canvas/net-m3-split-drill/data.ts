import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { SplitConfig } from "../models/net-subnet";

// 3.5 beat 5: unassisted practice. Five seeded questions per set: smallest prefix for a host count (twice), a valid start (twice) and where the next block goes.
// The model is in models/net-subnet.ts.
const TITLE = "Cut a block by hand";
const PURPOSE = "Five quick questions per set on sizes and starts inside 192.168.10.0/24: the smallest prefix for a host count, where a block may start, and where the next block goes.";
const LIMITS =
  "Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. Questions use prefixes from /25 to /29 inside a /24 and place the biggest block first.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3SplitDrillConfig: SplitConfig = {
  mode: "split",
  view: "drill",
  block: "192.168.10.0/24",
  needs: [{ name: "Staff", hosts: 100 }, { name: "Lab", hosts: 50 }, { name: "Printers", hosts: 20 }],
};

function SplitDrillBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "split", config: netM3SplitDrillConfig });
}

export const netM3SplitDrill: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: SplitDrillBeat,
};
