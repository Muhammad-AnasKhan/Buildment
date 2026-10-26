# Canvas spec: net-m5-sort-resend

Course and chapter: networking, 5.4 beat 5 (playable). Renderer: the `sorter` primitive (`primitives/sorter.tsx`, model `models/sorter.ts`); the slug's `data.ts` holds only buckets and cards.

## Claim

An acknowledgement names the next byte the receiver expects. A 100-byte segment that starts before that number is confirmed. A segment that starts at that number or after it is not confirmed yet. The receiver may hold it behind a gap, and the sender sends it again only when it decides it is lost.

## Touch

One card at a time: a segment (its first byte) and the receiver's latest ack. The learner taps "Confirmed" or "Not confirmed yet", or drags the card onto a bucket. A wrong try shakes the card and gives a one-line reason that names the ack. Six cards, using both buckets. When all are sorted, a short lesson shows.

## Limits

Small illustrative numbers: real sequence numbers do not start at 1001. Every segment holds exactly 100 bytes, and the receiver acknowledges the next byte it expects. The exercise does not say how long a sender waits before it sends again, and it leaves out windows, timers and congestion control.
