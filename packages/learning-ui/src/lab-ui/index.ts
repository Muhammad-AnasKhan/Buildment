// The lab's presentational pieces, shared by the web reader, the desktop reader and
// the component gallery. Typed props, no data fetching, tokens as CSS variables on
// `.lab-board` (see bench.ts) so both themes work on every surface.

export * from "./bench";
export { Glyph } from "./Glyph";
export { ReplicaMatrix } from "./ReplicaMatrix";
export { WireTag, wirePartKind, type WirePart } from "./WireTag";
export { NodeCard, type NodeCardProps, type NodeGhost } from "./NodeCard";
export { Cassette, CassetteReadout, CassetteSection, SegmentedGroup, Stepper, CassetteSwitch, CassetteSlider, CASSETTE_FOCUS, anchorStyle } from "./Cassette";
export { PhaseTimeline, CheckSlot, PHASE_MS, type CheckView, type TimelineStep } from "./ChecksGrid";
