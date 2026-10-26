# Canvas spec: net-m4-mac-remote

Course and chapter: networking, 4.2 beat 2. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

When the destination is on another network, the frame carries the destination's IP address but the MAC of the next device on the link, the default gateway. The laptop at `192.168.1.23` sends to the server at `203.0.113.80`: the mask says "not on my network", the default route names R1 at `192.168.1.1`, ARP can only ask this link, so the destination MAC is R1's.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 4 the learner first taps which MAC goes in the destination field (R1's, the server's or R2's). The frame shows after the pick, with the reason for the right answer. No other control.

## Limits

Four made-up devices and made-up MACs (`02:...`) on Ethernet links, IPv4 only, two routers, no NAT. The documentation ranges stand for public addresses. Only the first link is drawn in detail; the next beat (`net-m4-mac-per-hop`) follows the packet to the server. The ARP table is a model view of what `ip neigh` shows. Wi-Fi frames look different. Nothing here is a recording.
