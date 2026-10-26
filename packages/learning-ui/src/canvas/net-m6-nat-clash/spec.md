# Canvas spec: net-m6-nat-clash

Course and chapter: networking, 6.2 beat 4. Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas.tsx` in `net-step/`, model `models/net-step.ts`), in place of the planned `[netlab]` home router. Data only.

## Claim

When two devices send from the same source port to the same server, the router keeps the port for the first and gives the second a new port, because the two conversations would otherwise look the same after rewriting. The router uses its table row to send each reply to the right device.

## Touch

**Next** plays the next step; **Start over** goes back to the first. Both devices use port `41000`: the laptop goes first and keeps it; the phone's packet leaves with a new source port. At step 5 the learner first taps how the router knows the reply to the new port belongs to the phone (its table row names the phone); the step plays after the pick and the feedback says why.

## Limits

Linux masquerade as tested in the course lab (the port was kept for one client and rewritten when a second client used the same port while the first was open, dossier 5.6). Other routers may differ, and no measurement of home routers is sourced. The new port is chosen by the router and differs every run, so the picture says "new port" and prints no number. The table is a model view of `conntrack -L`. Made-up devices and addresses; `203.0.113.1` comes from a documentation range.
