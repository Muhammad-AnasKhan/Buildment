# Canvas spec: net-m4-silent-router

Course and chapter: networking, 4.4 beat 5. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

A router that is set to stay silent still forwards packets; it only sends no Time Exceeded reply. In a trace its line shows `* * *`, and the lines after it still answer. Stars mean that no answer came back (the router did not answer, or a filter ate the probe or the reply), not that the path is broken.

## Touch

**Next** plays the next step; **Start over** goes back to the first. The trace table gains a row at each step, and line 2 is filled with `* * *`. At step 4 the learner first taps whether probe 3 got past the silent R2 (no, yes, or only after R2 is switched on). The answer from the server shows after the pick, with the reason. The learner cannot switch R2 on and off: the picture shows the silent case. This pick asks a different question from the chapter's Predict, which asks what line 2 shows.

## Limits

Four made-up devices on one path of two routers, IPv4 only, no NAT. R2 is silent by setting; a filter that eats the probe or the reply gives the same stars and is not drawn. The table is a model view of the lines `traceroute` prints, with the times left out. No rate limits are drawn. The documentation ranges stand for public addresses.
