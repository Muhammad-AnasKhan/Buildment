import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";

// 2.2 practice: five fresh questions per set, by hand and with instant
// feedback: byte to bits, bits to byte, and real or not. Sets are numbered and
// seeded from the number, so a mentor can open the same set again. The model
// is in models/net-address.ts.
const TITLE = "Byte and address drill";
const PURPOSE = "Five quick questions per set: turn a number into bits, read bits as a number, and spot an address that cannot exist.";
const LIMITS =
  "Practice only: nothing here is saved or graded, and the graded check is the quiz at the end of the chapter. Each set is numbered and always asks the same five questions, so a mentor can open the same set again. New set moves on to the next number.";

function AddressDrillBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "drill" });
}

export const netM2AddressDrill: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: AddressDrillBeat,
};
