# Canvas spec: net-m4-mac-local

Course and chapter: networking, 4.2 beat 1. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

When the destination is on the sender's own network, the frame carries the destination's own MAC. The laptop at `192.168.1.23` sends to a neighbour at `192.168.1.40`: the mask says "same network", ARP gives the neighbour's MAC, and that MAC goes in the destination field. The router is not involved.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 3 the learner first taps which MAC goes in the destination field (the router's, the neighbour's or `ff:ff:ff:ff:ff:ff`). The frame shows after the pick, with the reason for the right answer. No other control.

## Limits

Four made-up devices and made-up MACs (`02:...`) on one Ethernet link, IPv4 only, no NAT. The ARP table is a model view of what `ip neigh` shows; the ARP exchange is not drawn (3.3 shows it). Wi-Fi frames look different. Nothing here is a recording.
