import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { AddressBitsCanvas } from "../net-m2-address-bits/AddressBitsCanvas";
import type { MaskConfig } from "../models/net-subnet";

// 3.2 beat 4: the broadcast is the network with every host bit set to 1; the hosts lie between the two. Only the host bits of 10.20.143.7/20 can be flipped.
// The model is in models/net-subnet.ts.
const TITLE = "Host bits all 1 give the broadcast";
const PURPOSE = "Flip the host bits of 10.20.143.7/20 and watch the address move between the network address, the hosts and the broadcast.";
const LIMITS =
  "IPv4 only. Hosts are the addresses strictly between the network and the broadcast, so a block has two fewer than its size, up to /30. A /31 has two addresses and no directed broadcast (RFC 3021) and a /32 is one address. This picture uses a /20.";

/** The plain parameters of this slug; the same shape a Markdown `canvas` fence would carry. */
export const netM3BroadcastConfig: MaskConfig = {
  mode: "mask-and",
  view: "broadcast",
  address: "10.20.143.7",
  prefix: 20,
};

function BroadcastBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(AddressBitsCanvas, { ...props, mode: "mask-and", config: netM3BroadcastConfig });
}

export const netM3Broadcast: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: BroadcastBeat,
};
