import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "./AddressBitsCanvas";

// 2.2 beat: an IPv4 address is 32 bits, four bytes, written as four numbers
// with dots, and the same bits read as one number. Four rows of eight bit
// cards; flip a bit or type an address and all three views change together.
// The model is in models/net-address.ts.
const TITLE = "An address is 32 bits";
const PURPOSE = "Flip any of the 32 bits, or type an address, and see the dotted form and the single number change together.";
const LIMITS = "IPv4 only. The picture shows how an address is stored, not whether it is private or public: that is 2.4.";

function AddressBitsBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "address" });
}

export const netM2AddressBits: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: AddressBitsBeat,
};
