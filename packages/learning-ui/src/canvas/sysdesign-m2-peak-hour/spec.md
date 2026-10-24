# Canvas spec: sysdesign-m2-peak-hour

- **Course and chapter:** system-design, 2.3 beat 2.
- **Renderer:** `scene` (data only).
- **Claim:** Size for the busiest minute, not the daily average.
- **Story:** Requests trickle in, then the evening rush; the API's second line goes from 230 req/s to 700 req/s. Verdict: "Size for 700/s, not 230/s".
- **Numbers:** 20,000,000 requests / 86,400 s = 231 per second; peak factor 3 is an assumption.
- **Sources:** Arithmetic only; the peak factor is labelled as an assumption. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
