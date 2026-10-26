import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";

// 2.2 beat: one part of an address is one byte. Eight bit cards worth 128 down
// to 1; tap them to build a number, then press Add 1 at 255 and watch the carry
// run out of room. The model is in models/net-address.ts.
const TITLE = "One byte is eight bits";
const PURPOSE = "Tap the eight bits of one byte to build a number from 0 to 255, then add one to 255 and watch it run out of room.";
const LIMITS =
  "A byte is eight bits, so each part of an IPv4 address is 0 to 255. This picture shows one byte alone; in a whole address, one more than .255 carries into the next part.";

function ByteBitsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "byte" });
}

export const netM2ByteBits: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: ByteBitsBeat,
};
