// The shared simulation core for kit canvases (agent-ip/10-interactive-canvases.md,
// "The shared simulation core and the kit renderers"). Pure TypeScript with no
// DOM code, so models are unit tested and can be reused outside the reader.

export { seededRandom, type Random } from "./random";
export { createSimulation, type Simulation } from "./events";
export {
  compareVectors,
  intervalsOverlap,
  lamportTick,
  readPhysical,
  trueTimeNow,
  type PhysicalClock,
  type TimeInterval,
  type VectorOrder,
} from "./clocks";
export {
  itemsUpTo,
  roundUp,
  type Trace,
  type TraceItem,
  type TraceLane,
  type TraceMessage,
  type TracePoint,
  type TraceSpan,
  type TraceStep,
} from "./trace";
