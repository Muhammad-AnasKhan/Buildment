# Canvas spec: net-m8-journey-gateway

Course and chapter: networking, 8.1 beat 4 (steps 4 and 5 of the journey). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

A destination outside the device's own subnet goes to the gateway. The packet keeps the server's IP address as destination and carries the router's MAC address, which covers the next hop only. The server's MAC never appears on this link.

## Touch

**Next** plays the next step; **Start over** goes back to the first. No pick in this slug. Five steps: the subnet question; the default row is chosen; the gateway's MAC is already in the ARP table; the SYN with the server's IP and the router's MAC; the server's MAC is two routers away.

## Limits

Four made-up devices and made-up MACs; only the first link is played. The route table and the ARP table are model views of ip route and ip neigh (the lease gives a default route via 192.168.1.1 and a connected route). One packet at a time, plain TCP, no loss.
