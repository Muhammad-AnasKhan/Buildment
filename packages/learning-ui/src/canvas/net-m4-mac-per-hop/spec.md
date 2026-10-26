# Canvas spec: net-m4-mac-per-hop

Course and chapter: networking, 4.2 beat 4. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

On every link the frame has a new MAC pair, while the source IP and destination IP stay the same. Each router opens the frame, reads the destination IP, picks the next hop and builds a fresh frame for the next link. On the last link the destination MAC is the server's own. This follows the real challenge 2 capture, where the MACs differ on the two sides of the router and the IP addresses do not.

## Touch

**Next** plays the next step; **Start over** goes back to the first. At step 3 the learner first taps which destination MAC R2 uses on the last link (R2's own, R1's or the server's). The frame shows after the pick, with the reason for the right answer. Changed fields carry the word "changed". No other control.

## Limits

Four made-up devices and made-up MACs (`02:...`) on Ethernet links, IPv4 only, two routers and no NAT. A real home router also rewrites the source IP address; module 6 does that on purpose. Switches between the devices are left out. Wi-Fi frames look different. The documentation ranges stand for public addresses. Nothing here is a recording.
