import type { CustomCanvasSpec } from "../registry";
import { ChatFourWaysCanvas } from "./ChatFourWaysCanvas";

// 3.5, beat 5: the same chat delivered four ways. N users each get 2
// messages a minute; long polls are held up to 30 s; one way across the
// network takes 40 ms. Polling every P seconds costs N / P requests a second
// and P / 2 of delay; the other three cost open connections instead.
// Model: models/realtime-cost.ts.
export const sysdesignM3ChatFourWays: CustomCanvasSpec = {
  kind: "custom",
  title: "Same chat, four ways",
  purpose: "Drag the number of users and pick a poll interval to compare polling, long polling, server-sent events and WebSockets by delay, requests a second and open connections.",
  limits:
    "Made-up traffic: every user gets 2 messages a minute and long polls are held for up to 30 seconds. The 40 ms delay is half of an 80 ms round trip and ignores queues, retries and slow phones. SSE and WebSocket requests are shown as almost none: only reconnects remain, and those are not modelled. One dot stands for many requests or messages. The cost colours use made-up limits for one fleet, not a real server's limits.",
  component: ChatFourWaysCanvas,
};
