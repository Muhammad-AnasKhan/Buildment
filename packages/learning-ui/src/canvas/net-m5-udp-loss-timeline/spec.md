# Canvas spec: net-m5-udp-loss-timeline

Course and chapter: networking, 5.5 beat 3 (playable). Renderer: the shared timeline renderer (`renderers/timeline/TimelinePlayer`), fed by the model and component in `net-m5-tcp-loss-timeline/` (`lossModel.ts`, `LossTimelineCanvas.tsx`), so that the TCP and UDP beats compare like with like. The model is in milliseconds, so no renderer change is needed.

## Claim

Over UDP, a lost packet is simply missing. Nothing is sent again and nothing waits: every packet that arrives reaches the app 40 ms after it left, in order.

## Touch

The same **Loss rate** slider as the TCP beat (0%, 10%, 20% or 30%, native range input, arrow keys). The model drops the same packets, 4, then 8, then 6. The learner steps through three moves with Next and Back; moving the slider jumps to the last step. The last step names how many of the ten packets are missing, and no packet is late.

## Limits

Model numbers, not measurements: a packet every 20 ms and 40 ms to cross. The same dropped packets as in the TCP beat. A real app that uses UDP may add its own checks on top; this picture shows UDP alone. A real link loses packets at random.
