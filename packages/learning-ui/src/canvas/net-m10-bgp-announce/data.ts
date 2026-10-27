import type { SequenceSpec } from "../renderers/sequence/types";

// 10.3 beat 3: one BGP announcement crosses four made-up networks. AS64498
// owns 203.0.113.0/24 and announces it to AS64497, which passes it to AS64496
// and AS64499. Each network puts its own number at the front of the AS path
// before it passes the route on (RFC 4271, section 5.1.2). AS64496 passes its
// copy to AS64499 too. Then the link between AS64497 and AS64499 goes down, so
// AS64499 loses that way (closing a session withdraws its routes, RFC 4271
// section 3.1). Its only way left is the copy from AS64496, and it passes that
// on. The copy that reaches AS64496 already holds 64496, so AS64496 leaves it
// out (RFC 4271 section 9.1.2). AS numbers are documentation numbers (RFC
// 5398) and the block is a documentation block (RFC 5737). The order of
// arrival is a model, and sending a copy back to the network it came from is
// drawn so that the check can be seen.
export const netM10BgpAnnounce: SequenceSpec = {
  kind: "sequence",
  title: "An announcement crosses four networks",
  purpose: "AS64498 announces its block. Watch the AS path grow at each network, and watch AS64496 refuse a copy that already holds its own number.",
  summary:
    "AS64498 announces 203.0.113.0/24 to AS64497 with the AS path 64498. AS64497 adds its number and passes it to AS64496 and AS64499 with the path 64497 64498. AS64496 adds its number and passes it to AS64499 with the path 64496 64497 64498. The link between AS64497 and AS64499 goes down, so AS64499 has only the copy from AS64496 left. It adds its number and passes it on. The copy that reaches AS64496 has the path 64499 64496 64497 64498. It already holds 64496, so AS64496 leaves it out.",
  actors: [
    { name: "AS64498", sub: "owns /24" },
    { name: "AS64497", sub: "middle" },
    { name: "AS64496", sub: "far side" },
    { name: "AS64499", sub: "far side" },
  ],
  steps: [
    {
      from: 0,
      to: 1,
      label: "203.0.113.0/24",
      title: "AS64498 announces its own block",
      note: "AS64498 owns 203.0.113.0/24. It sends an UPDATE message to its neighbour over their BGP session on TCP port 179. The AS path holds one number: its own.",
      chips: ["UPDATE: announce", "block: 203.0.113.0/24", "AS path: 64498"],
    },
    {
      from: 1,
      to: 2,
      label: "64497 64498",
      title: "AS64497 adds its number and passes it on",
      note: "Before AS64497 passes the route on, it puts its own number at the front. AS64496 now knows a way to 203.0.113.0/24: send it to AS64497.",
      chips: ["AS path: 64497 64498", "64497 added at the front"],
    },
    {
      from: 1,
      to: 3,
      label: "64497 64498",
      title: "AS64499 hears the same route",
      note: "AS64497 also tells its other neighbour, so AS64499 gets the same AS path. Read a path from the right: the last number, 64498, is the network that owns the block.",
      chips: ["AS path: 64497 64498", "origin: 64498, the last number"],
    },
    {
      from: 2,
      to: 3,
      label: "64496 64497 64498",
      title: "AS64496 passes its copy on too",
      note: "AS64496 adds 64496 at the front and tells its other neighbour. AS64499 now knows two ways to the same block. The path through AS64496 is one network longer.",
      chips: ["AS path: 64496 64497 64498", "AS64499 knows two ways"],
    },
    {
      from: 3,
      to: 3,
      label: "link to 64497 down",
      tone: "warn",
      outcome: "one way lost",
      title: "AS64499 loses its link to AS64497",
      note: "The cable between AS64497 and AS64499 breaks. When a BGP session closes, the routes it brought are withdrawn. AS64499 has one way left: the copy from AS64496.",
      chips: ["session to 64497: closed", "way left: via 64496"],
    },
    {
      from: 3,
      to: 2,
      label: "path has 64496",
      tone: "bad",
      outcome: "left out",
      title: "AS64496 refuses its own number",
      note: "AS64499 adds its number and passes its only way on, and one copy reaches AS64496. Its path already holds 64496. A route with your own number in it would send traffic round in a circle, so AS64496 leaves it out.",
      chips: ["AS path: 64499 64496 64497 64498", "64496 is already in it", "route left out"],
    },
  ],
  tryThis: [
    "Before you press Next at step 4, say what the AS path will be when AS64496 passes the route on.",
    "At the last step, find the number that makes AS64496 refuse the copy. Where is it in the path?",
  ],
  limits:
    "Four made-up networks with documentation AS numbers and a documentation block. The order in which the copies arrive is a model, and the copy back to AS64496 is drawn so that the check can be seen. Each network keeps one router here; a real network has many, and real routers choose among the ways they know with their own rules, which chapter 10.4 explains. Timers and the other messages of a session are not drawn.",
};
