# Canvas spec: sysdesign-m4-least-busy

- **Course and chapter:** system-design, 4.5 beat 2 ("Least connections asks who is free").
- **Renderer:** `scene` (data only).
- **Claim:** Least connections (least requests) sends work where there is the least work in flight, so it adapts to uneven requests and uneven servers.
- **Story:** Counts are A 3, B 0, C 1: the page goes to B. Then A 3, B 1, C 1: a tie, the first wins, B again. A finishes one (A 2). Counts A 2, B 2, C 1: the next page goes to C. Verdict: "Each request goes to the least busy".
- **Numbers:** Requests in flight: 3, 0 and 1 to start.
- **Sources:** Least request load balancing [S16]; Envoy's least request picks among N random hosts by default (next beat). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
