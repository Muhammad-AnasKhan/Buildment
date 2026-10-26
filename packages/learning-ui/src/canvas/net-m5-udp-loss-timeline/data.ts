import type { CustomCanvasSpec } from "../registry";
import { makeLossTimelineCanvas } from "../net-m5-tcp-loss-timeline/loss-canvas";

// 5.5 beat 3: the same ten packets over UDP. The learner drags the loss rate
// from 0% to 30%. A lost packet is simply missing; the others reach the app
// 40 ms after they left, and nothing waits and nothing is sent again. Model
// numbers, not measurements. The model is net-m5-tcp-loss-timeline/lossModel.ts,
// shared with net-m5-tcp-loss-timeline so that the two beats compare like with
// like.
export const netM5UdpLossTimeline: CustomCanvasSpec = {
  kind: "custom",
  title: "Over UDP, a lost packet is just missing",
  purpose: "The same ten packets cross the same link over UDP. Drag the loss rate up: lost packets are missing, and nothing waits.",
  limits:
    "Model numbers, not measurements: a packet every 20 ms and 40 ms to cross. The model drops packets 4, 8 and 6, in that order, as the loss rate rises by 10% for each packet, the same as in the TCP beat. A real app that uses UDP may add its own checks on top; this picture shows UDP alone. A real link loses packets at random.",
  component: makeLossTimelineCanvas("udp"),
};
