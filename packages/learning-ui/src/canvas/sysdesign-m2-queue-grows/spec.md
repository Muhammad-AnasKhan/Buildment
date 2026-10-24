# Canvas spec: sysdesign-m2-queue-grows

- **Course and chapter:** system-design, 2.5 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** When arrivals outpace service, the queue grows without end.
- **Story:** Clients send 2 requests a second into a queue; the server takes 1 a second; the queue's second line climbs to 4 waiting. Verdict: "Arrivals beat service: queue grows".
- **Numbers:** Arrival 2 per second, service 1 per second.
- **Sources:** Story arithmetic; queueing background [S6]. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
