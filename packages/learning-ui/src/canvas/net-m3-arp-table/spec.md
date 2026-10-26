# Canvas spec: net-m3-arp-table

Course and chapter: networking, 3.3 beat 3 (playable). Renderer: the generic `[netstep]` beat canvas (`NetStepCanvas`, model `models/net-step.ts`). Spec of the renderer: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A host saves the MAC it learned in its ARP table. The next packet to the same IP address finds the row and goes straight to that MAC, with no new request.

## Touch

**Next** plays the next step; **Start over** goes back to the first and the empty table. At step 4 the learner first picks what the laptop does for a second packet to the same address (ask again with a broadcast, use the saved row, send it to the router). The step plays after the pick and the feedback says why. Six steps: the empty table, the reply, the saved row, the second packet (pick), the frame sent with no request, and the row lost later.

## Limits

Two made-up devices and made-up MACs (`02:...`) on one switch. The table is a simplified model of what `ip neigh` (Linux) or `arp -a` (Windows, macOS) lists, not a recording. A real row is dropped after a while; RFC 826 leaves ageing to the implementer, so no timeout number is given.
