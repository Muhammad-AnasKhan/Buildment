# Canvas spec: net-m5-tcp-loss-ack

Course and chapter: networking, 5.4 beat 3 (step through). Renderer: the existing `sequence` renderer, data only (`SequenceSpec`, `renderers/sequence/`). No new component.

## Claim

TCP numbers every byte, and the receiver answers with the number of the next byte it expects. When a segment is lost, the receiver keeps asking for the same byte, so its acknowledgement stops growing.

## Touch

The learner steps through six moves with Next and Back (or the arrow keys): segment 1 (bytes 1001 to 1100) and ack 1101; segment 2 (bytes 1101 to 1200) is dropped by the link; segment 3 (bytes 1201 to 1300) arrives; the server answers ack 1101 again. The renderer takes no other input. The chapter's Predict sits just before this beat.

## Limits

Small illustrative numbers: real sequence numbers do not start at 1001, and the capture in chapter 5.6 shows real, much larger ones. One loss, three segments of 100 bytes, no timers, no windows and no congestion control. A real receiver may also tell the sender which later segments it holds; that is not drawn.
