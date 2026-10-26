# Canvas spec: net-m5-tcp-loss-timeline

Course and chapter: networking, 5.5 beat 2 (playable). Renderer: the shared timeline renderer (`renderers/timeline/TimelinePlayer`), fed by a small per-canvas model in this folder (`lossModel.ts`) and a thin component (`LossTimelineCanvas.tsx`). The model is in milliseconds, so no renderer change is needed. The folder `net-m5-udp-loss-timeline` uses the same model and component.

## Claim

Over TCP, a lost packet costs a resend one round trip later, and because TCP hands data to the app in order, every packet behind the lost one waits. The higher the loss rate, the more packets come late.

## Touch

A **Loss rate** slider (a native range input, 0%, 10%, 20% or 30%, with arrow-key support) changes the run. At 0% ten packets leave 20 ms apart and each arrives 40 ms later. At 10% the model drops packet 4; the packets behind it, 5 to 8, are held back (orange bar) until packet 4 is sent again and arrives. At 20% and 30% it also drops packets 8 and 6. The learner steps through four moves with Next and Back; moving the slider jumps to the last step so the new result shows at once. The last step names how many of the ten packets came late.

## Limits

Model numbers, not measurements: a packet every 20 ms, 40 ms to cross, a round trip of 80 ms, and a resend 90 ms after the first try. The model drops packets 4, 8 and 6, in that order. A real TCP sender decides when to send again by its own rules, and a real link loses packets at random. No real timer or loss rate is claimed.
