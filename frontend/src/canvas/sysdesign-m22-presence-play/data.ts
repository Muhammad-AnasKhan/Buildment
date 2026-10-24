import type { CustomCanvasSpec } from "../registry";
import { PresencePlayCanvas } from "./PresencePlayCanvas";

// 22.4 beat 7: drag the ping gap, watch the cost. Model: models/dardasha-presence.ts.
// Course numbers: models/dardasha-numbers.ts.
export const sysdesignM22PresencePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the ping gap, watch the cost",
  purpose: "Drag the gap between pings and watch pings a second against messages a second on one scale. Then choose where a ping ends: at the presence store, where every ping is a write, or at the gateway, where the store sees only status changes.",
  limits:
    "Dardasha is made up and so are its numbers: 3 million connected phones, 13,889 messages a second at peak, 60 gateways and about 3,125 status changes a second. A phone is shown offline after two missed pings. The picture leaves out pings that carry data, phones that sleep in the background, retries, a lost ping on a bad network and the load of reading presence. In gateway mode the store also takes about 12 lease renewals a second from the 60 gateways, which the picture leaves out of the 3,125. Pings also keep routers from closing a quiet line, so a very long gap is not free.",
  component: PresencePlayCanvas,
};
