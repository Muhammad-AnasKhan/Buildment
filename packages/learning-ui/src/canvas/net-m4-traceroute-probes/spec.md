# Canvas spec: net-m4-traceroute-probes

Course and chapter: networking, 4.4 beat 3. Renderer: the generic `[netstep]` beat canvas, `NetStepCanvas.tsx` in `net-step/`. Model and schema: `models/net-step.ts`.

## Claim

Traceroute sends probes with TTL 1, 2, 3 and so on, and reads who answers. Probe 1 dies at R1 (reply from `192.168.1.1`), probe 2 dies at R2 (reply from `198.51.100.1`), and probe 3 reaches the server (reply from `203.0.113.80`). Each reply names the device that stopped the probe, so line N of the trace is the device that stopped probe N. Across two routers the lab's `traceroute -n` showed three lines: both routers, then the host.

## Touch

**Next** plays the next step; **Start over** goes back to the first. The learner follows the three probes in turn; the trace table gains one row per answer (each marked "new"). At step 5 the learner first taps where probe 3 ends (the server, R2 or R1). The probe and the last reply show after the pick, with the reason.

## Limits

Four made-up devices on one path of two routers, IPv4 only, no NAT. The table is a model view of the lines `traceroute` prints, with the times left out. Real traceroute sends UDP probes by default [S31]; this picture sends one probe per line and does not show the probe type. No rate limits are drawn. The documentation ranges stand for public addresses.
