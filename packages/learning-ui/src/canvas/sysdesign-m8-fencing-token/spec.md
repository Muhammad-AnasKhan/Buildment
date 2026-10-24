# Canvas spec: sysdesign-m8-fencing-token

- **Course and chapter:** system-design, 8.5 beat 4 ("A number the database checks").
- **Renderer:** `scene` (data only).
- **Claim:** A fencing number stops an old leader from writing after a new one has taken over.
- **Story:** The new leader holds epoch 8 and writes with 8: accepted. The old leader wakes up still believing it is leader, with epoch 7, and writes: refused. Verdict: "Old leader's write is refused".
- **Numbers:** epochs 7 and 8 are illustrative.
- **Sources:** Kleppmann on fencing tokens [S70]; Chubby sequencers [S71].
