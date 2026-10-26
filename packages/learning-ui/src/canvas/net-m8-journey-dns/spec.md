# Canvas spec: net-m8-journey-dns

Course and chapter: networking, 8.1 beat 3 (step 3 of the journey). Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`. Spec: `agent-ip/work/networking/canvas-specs/netstep-renderer.md`.

## Claim

Before any connection to a server, the device asks the DNS server named in its lease for the name. In the lab that is the home router, and it answers web.test with 203.0.113.80 from its own list. DNS comes first, then the connection.

## Touch

**Next** plays the next step; **Start over** goes back to the first. No pick in this slug. Five steps: the lease names the DNS server; the question to 192.168.1.1 port 53; the router finds the name in its own list; the answer; home1 saves the address in its answer table.

## Limits

Two devices and one name. The router's list holds web.test and nothing else, so an unknown name is refused, as the lab showed. A real resolver may ask other servers and keep answers for a while; neither is drawn. Port 53 is the one the lab's dig output names. The tables are model views.
