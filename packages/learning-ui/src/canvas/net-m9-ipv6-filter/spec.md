# Canvas spec: net-m9-ipv6-filter

Networking, 9.3, beat 3. Renderer: the generic `[netstep]` beat canvas (`net-step/NetStepCanvas.tsx`, model `models/net-step.ts`). Planned as a network lab view; it uses `netstep` until the lab has a beat mode.

## Claim

Without NAT, a filter in the router keeps strangers out. The phone's own request makes the filter write a note, so the server's reply passes. A new packet that nobody asked for has no note and is dropped. The filter does this job, not NAT.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 6 the learner first taps what the filter does with the unrequested packet (three options, one right); the step plays after the pick, and the feedback says why. A table "The filter's notes" fills as the steps play. Seven steps in all.

## Limits

A model of one simple stateful filter, not a recording: IPv6 forwarding was not tested in the lab. Real home routers differ in what they filter by default. Made-up devices in the documentation prefix `2001:db8::/32`. Ports, timers and the way the router builds its notes are not drawn.
