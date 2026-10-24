import type { CustomCanvasSpec } from "../registry";
import { LossToggleCanvas } from "./LossToggleCanvas";

// 3.4, beat 5: three files, one packet each, an 80 ms round trip. Drop one
// packet and its resend arrives one round trip later. HTTP/1.1 delays that
// file and every file queued behind it, HTTP/2 delays all three (TCP hands
// bytes over in order), HTTP/3 delays only the file that lost the packet.
// Model: models/loss-compare.ts.
export const sysdesignM3LossToggle: CustomCanvasSpec = {
  kind: "custom",
  title: "Drop a packet, compare the versions",
  purpose: "Pick an HTTP version, tap a packet to drop it, and see which of the three files have to wait for the resend.",
  limits:
    "Three files with one packet each, and an 80 ms round trip from napkin math. The resend is drawn arriving exactly one round trip after the loss; real loss detection can take longer, and real files need many packets. HTTP/1.1 is drawn as one connection, but browsers usually open several. Only one packet is dropped at a time.",
  component: LossToggleCanvas,
};
