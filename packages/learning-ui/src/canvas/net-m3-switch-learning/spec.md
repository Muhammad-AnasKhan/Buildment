# Canvas spec: net-m3-switch-learning

Course and chapter: networking, 3.3 beat 4 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A switch learns where a MAC lives from the source MAC of the frames it receives, and writes it beside the arrival port. A frame for a MAC it has not learned goes out every other port. A frame for a learned MAC goes out one port.

## Touch

**Next** plays the next step; **Start over** goes back to the first and the empty table. Two picks. At step 2 the learner picks what the switch writes down from the friend's frame (the friend's MAC on port 2, the laptop's MAC, or nothing until an ARP reply). At step 7 the learner picks where the laptop's frame for the friend leaves (ports 1 and 3, port 2 only, back out port 1). Each step plays after its pick, and the feedback says why.

## Limits

One made-up switch, three hosts and made-up MACs (`02:...`). The table is a model view, not a recording. No ageing, no loops, no broadcast frames and no other switches are drawn. The switch's MAC table is a different table from the laptop's ARP table.
