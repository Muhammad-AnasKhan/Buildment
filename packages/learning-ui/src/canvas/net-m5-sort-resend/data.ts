import type { CustomCanvasSpec } from "../registry";
import type { SortBucket, SortCard } from "../models/sorter";
import { makeSorterCanvas } from "../primitives/canvas-factories";

// 5.4 beat 5: each card is one 100-byte segment of a transfer, with the
// receiver's latest acknowledgement. An acknowledgement names the next byte
// the receiver expects. A segment that starts before that number is confirmed;
// a segment that starts at or after it is not confirmed yet. The receiver may
// already hold such a segment (a later one behind a gap), and the sender sends
// a segment again only when it decides it is lost. All numbers are small and illustrative: real sequence numbers do not
// start at 1001. The model is deliberately simple: it does not say when the
// sender gives up waiting.

export const RESEND_BUCKETS: SortBucket[] = [
  { id: "arrived", label: "Confirmed", sub: "the ack is past it" },
  { id: "resend", label: "Not confirmed yet", sub: "the ack is not past it" },
];

export const RESEND_CARDS: SortCard[] = [
  {
    id: "s1001",
    text: "Segment from byte 1001. Latest ack: 1301",
    answer: "arrived",
    why: { resend: "The ack 1301 is past byte 1001. These bytes are confirmed." },
  },
  {
    id: "s1301",
    text: "Segment from byte 1301. Latest ack: 1301",
    answer: "resend",
    why: { arrived: "Ack 1301 means: next I expect byte 1301. Not here yet." },
  },
  {
    id: "s1101",
    text: "Segment from byte 1101. Latest ack: 1101",
    answer: "resend",
    why: { arrived: "Ack 1101 means: next I expect byte 1101. It is missing." },
  },
  {
    id: "s1201",
    text: "Segment from byte 1201. Latest ack: 1501",
    answer: "arrived",
    why: { resend: "The ack 1501 is past byte 1201. These bytes are confirmed." },
  },
  {
    id: "s1401",
    text: "Segment from byte 1401. Latest ack: 1401",
    answer: "resend",
    why: { arrived: "Ack 1401 means: next I expect byte 1401. Not here yet." },
  },
  {
    id: "s1101b",
    text: "Segment from byte 1101. Latest ack: 1301",
    answer: "arrived",
    why: { resend: "Ack 1301 is past byte 1101. The resend got through." },
  },
];

export const netM5SortResend: CustomCanvasSpec = {
  kind: "custom",
  title: "Which segments are confirmed?",
  purpose: "Each card is a segment of 100 bytes with the receiver's latest acknowledgement. Sort it: confirmed, or not confirmed yet.",
  limits:
    "Small illustrative numbers: real sequence numbers do not start at 1001. Each segment holds exactly 100 bytes and the receiver acknowledges the next byte it expects. The exercise does not say when a sender decides a segment is lost and sends it again. A segment that is not confirmed may be lost, or may be waiting in the receiver's buffer behind a gap. It leaves out windows, timers and congestion control.",
  component: makeSorterCanvas({
    buckets: RESEND_BUCKETS,
    cards: RESEND_CARDS,
    deckLabel: "Segment and ack",
    prompt: "Confirmed, or not yet?",
    hint: "Compare the first byte of the segment with the ack. Tap a bucket, or drag the card onto it.",
    endNote: "An ack names the next byte the receiver expects. Segments before it are confirmed. A segment at or past it is not confirmed yet. The sender sends it again only when it decides it was lost.",
  }),
};
