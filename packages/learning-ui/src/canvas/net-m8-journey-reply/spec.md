# Canvas spec: net-m8-journey-reply

Course and chapter: networking, 8.1 beat 6 (steps 7 to 9 of the journey). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

The server sees only the router's outside address, 198.51.100.2, and TTL 62 after two routers. The reply returns to the router, and the router's NAT table row sends it home to the device that started the connection.

## Touch

**Next** plays the next step; **Start over** goes back to the first. No pick in this slug. Six steps: the provider router forwards the SYN; the server's view; the SYN-ACK leaves the server; the provider router forwards it; the NAT table row is found; the destination is rewritten back and the reply goes home.

## Limits

Four made-up devices and made-up MACs. The TTL values follow the default TTL of 64 and one less per router (a capture across two routers showed 62), and the reply's values are derived, not captured. The NAT table is a model view of conntrack -L. One packet at a time, no loss.
