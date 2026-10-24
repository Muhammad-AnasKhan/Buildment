# Canvas spec: sysdesign-m2-shared-power

- **Course and chapter:** system-design, 2.6 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** Copies that share a cause of failure fail together, so the parallel formula no longer applies.
- **Story:** App A and App B run on one host; the host loses power and both go down; the load balancer has no copy left. Verdict: "One host fails: both copies down".
- **Numbers:** No numbers: the point is that independence is an assumption.
- **Sources:** Course composite. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
