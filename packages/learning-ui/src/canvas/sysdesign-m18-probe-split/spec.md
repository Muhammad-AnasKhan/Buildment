# Canvas spec: sysdesign-m18-probe-split

- **Course and chapter:** system-design, 18.4 beat 4 (Not ready is not the same as stuck).
- **Renderer:** `scene` (data only).
- **Claim:** Readiness decides whether to send traffic now. Liveness decides whether to restart. They answer different questions.
- **Story:** The kubelet asks Pod B /ready and gets 503. The Service sends only to Pod A. Later the kubelet asks /health, gets nothing three times, and restarts Pod B. Pod B becomes ready and gets traffic again.
- **Numbers:** Defaults: probe every 10 s, timeout 1 s, 3 failures in a row. In the challenge run a stuck pod was restarted 17 to 19 s after /health began failing.
- **Limits shown under the picture:** The kubelet is the agent on each machine that runs the probes. Probe timing is set per pod: in the challenge the readiness probe runs every 2 seconds and the liveness probe every 5 seconds with 3 failures allowed. The picture compresses the time.
- **Sources:** Kubernetes probes documentation [S20] and course challenge 17 part 3 measurement, 2026-10-24.
