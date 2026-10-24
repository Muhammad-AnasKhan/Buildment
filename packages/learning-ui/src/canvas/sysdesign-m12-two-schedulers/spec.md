# Canvas spec: sysdesign-m12-two-schedulers

- **Course and chapter:** system-design, 12.1 beat 1 (Two schedulers, one bill).
- **Renderer:** `scene` (data only).
- **Claim:** A standby that takes over because it heard nothing, and a main that wakes up and does not know it was replaced, are both in charge at once. Silence is not proof of death.
- **Story:** A beats to B, then freezes for 12 s. B hears nothing for 5 s and takes over; it charges Dana. A wakes, still believes it is the main, and charges Dana again. Verdict: "Dana was billed twice".
- **Numbers:** Course numbers: freeze 12 s, standby waits 5 s. The structure matches the GitHub 2018 failover incident in the dossier (a 43 second partition, 24 h 11 min of degradation) [S134].
- **Sources:** S134 (GitHub post-incident analysis, for the real-world cousin). The billing story is a course example.
