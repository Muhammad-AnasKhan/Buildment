# Canvas spec: sysdesign-m13-hinted-handoff

- **Course and chapter:** system-design, 13.3 beat 2 ("A stand-in holds the write with a note").
- **Renderer:** `scene` (data only).
- **Claim:** Hinted handoff keeps writes succeeding through a short failure, and heals the missing copy when the failed node returns.
- **Story:** C is down. The client writes to A. A copies to B and to D, the next node on the ring, with a hint for C. The client is told OK. Later C is back, D sends the hint, C saves it, D drops the hint. Verdict: "C caught up through the hint".
- **Numbers:** N = 3, W = 2, one stand-in [S45].
- **Sources:** S45 (Dynamo: sloppy quorum and hinted handoff). Source needed: that hints are kept apart and checked on a timer (Dynamo paper, section 4.6).
