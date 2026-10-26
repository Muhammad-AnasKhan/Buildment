# Canvas spec: net-m5-tcp-loss-resend

Course and chapter: networking, 5.4 beat 4 (step through). Renderer: the existing `sequence` renderer, data only (`SequenceSpec`, `renderers/sequence/`). No new component.

## Claim

The same acknowledgement twice tells the sender that the bytes from that number did not arrive. The sender sends them again, and the acknowledgement then jumps past the bytes that were waiting.

## Touch

The learner steps through three moves with Next and Back (or the arrow keys): the client sees ack 1101 twice; the client sends the 100 bytes that start at 1101 again; the server answers ack 1301. The renderer takes no other input. It continues the story of `net-m5-tcp-loss-ack`.

## Limits

Small illustrative numbers: real sequence numbers do not start at 1001. The picture does not say what makes a real sender send again (a timer, or several repeated acknowledgements), and it quotes no time and no count. One lost segment, no windows and no congestion control.
