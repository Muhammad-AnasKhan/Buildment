import type { CustomCanvasSpec } from "../registry";
import { makeLossTimelineCanvas } from "./loss-canvas";

// 5.5 beat 2: ten packets over TCP. The learner drags the loss rate from 0% to
// 30%. At 0% every packet reaches the app 40 ms after it left. Each loss
// costs a resend one round trip later, and TCP hands data to the app in order,
// so the packets behind the lost one wait. Model numbers (a packet every
// 20 ms, 40 ms to cross, one round trip to send a lost packet again), not
// measurements. The model is lossModel.ts; the same model feeds
// net-m5-udp-loss-timeline.
export const netM5TcpLossTimeline: CustomCanvasSpec = {
  kind: "custom",
  title: "Over TCP, one loss holds back the packets behind it",
  purpose: "Ten packets cross a link over TCP. Drag the loss rate up and watch a lost packet get sent again while the packets behind it wait.",
  limits:
    "Model numbers, not measurements: a packet every 20 ms, 40 ms to cross, a round trip of 80 ms, and a resend 90 ms after the first try. The model drops packets 4, 8 and 6, in that order, as the loss rate rises by 10% for each packet. A real TCP sender decides when to send again by its own rules, and a real link loses packets at random. No real timer or loss rate is claimed.",
  component: makeLossTimelineCanvas("tcp"),
};
