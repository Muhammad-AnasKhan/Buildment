# Canvas spec: net-m8-journey-nat-hop

Course and chapter: networking, 8.1 beat 5 (step 6 of the journey, the playable beat). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

At the home router the source IP, the destination MAC and the TTL change: the source becomes the router's outside address 198.51.100.2 (masquerade), the MAC becomes the next hop's, and the TTL goes from 64 to 63. The source port is kept unless two devices would clash, and then it changes.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 3 the learner first taps one of three options for the destination MAC the SYN carries when it leaves hrouter; the step plays after the pick and the feedback says why. The changed fields carry the word "changed" in the packet chips. Four steps in all, the last one a port clash.

## Limits

Linux behaviour: masquerade keeps the source port unless two flows clash. Other routers differ. Three made-up devices and made-up MACs. TTL 64 at the sender and one less per router. The NAT table is a model view of conntrack -L. The port numbers 41000 and 15510 come from a recorded run (a second device using the same source port was given a new one).
