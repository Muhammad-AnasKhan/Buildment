# Canvas spec: sysdesign-m13-lww-skew-story

- **Course and chapter:** system-design, 13.5 beat 2 ("The later write got the smaller stamp").
- **Renderer:** `scene` (data only).
- **Claim:** When clocks disagree by more than the gap between two writes, last write wins can drop the write that really came later.
- **Story:** True time 20: tea reaches A, whose clock reads 30. Dina sees it saved. True time 25: rice reaches B, whose clock reads 15. Comparing stamps, 30 beats 15, so tea stays and rice is dropped. Verdict: "Rice came later but was dropped".
- **Numbers:** A is 10 ms fast and B is 10 ms slow; the writes are 5 ms apart; stamps are 30 and 15.
- **Sources:** S52 (clock drift up to 50 ppm; last write wins loses concurrent writes), S76 (a 2013 Cassandra test lost about 28% of acknowledged writes).
