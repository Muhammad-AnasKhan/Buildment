import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { V6Config } from "../models/net-ipv6";

// 9.2 beat 6: unassisted practice. Five seeded questions per set: the short form (twice), the full form (once) and whether a form is standard, non-standard or invalid (twice).
// The model is in models/net-ipv6.ts.
const TITLE = "Shorten five addresses by hand";
const PURPOSE = "Five quick questions per set: the short form of a full address, the full form of a short one, and whether a written form is standard, valid but not standard, or invalid.";
const LIMITS =
  "Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. The addresses are made up; many sit in the documentation range 2001:db8::/32.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM9V6DrillConfig: V6Config = {
  mode: "v6",
  view: "drill",
};

function V6DrillBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "v6", config: netM9V6DrillConfig });
}

export const netM9V6Drill: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: V6DrillBeat,
};
