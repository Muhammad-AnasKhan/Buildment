# Canvas spec: sysdesign-m12-slow-or-dead

- **Course and chapter:** system-design, 12.2 beat 1 (Silence says nothing).
- **Renderer:** `scene` (data only).
- **Claim:** From outside, no answer within the timeout means one of two things, and the monitor cannot know which.
- **Story:** Monitor pings B and C; a 200 ms wait ring fills; both stay silent. Then B's late pong arrives while C never answers. Verdict: "Same silence, two different causes".
- **Numbers:** Course numbers only: 200 ms timeout, pong at about 280 ms.
- **Sources:** S67 for the idea that a failure detector cannot be perfect without timing assumptions (FLP, named in the dossier).
