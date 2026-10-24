# Canvas spec: sysdesign-m1-quality-reqs

- **Course and chapter:** system-design, 1.2 beat 2 ("Non-functional: how well it works").
- **Renderer:** `scene` (data only).
- **Claim:** Two systems can meet the same functional requirement and still differ on a non-functional one. Non-functional requirements say how well, and they need a number to be testable.
- **Story:** The student sends the same search to version A and version B. Wait rings count up: B is done at 0.3 s ("under 1 s"), A takes 4 s ("too slow", red ring). Verdict: "Same feature, different quality".
- **Numbers:** 4 s and 0.3 s are illustrative; the 1 second target is the fictional team's choice.
- **Sources:** percentiles and SLOs, Google SRE book, "Service Level Objectives" [S95] (used in the chapter's fold, not in the picture).
