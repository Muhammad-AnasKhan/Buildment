# Canvas spec: sysdesign-m28-redo-the-maths

- **Course and chapter:** system-design, 28.3 beat 1 ("A follow-up retests your numbers").
- **Renderer:** `scene` (data only).
- **Claim:** A "what if" follow-up is answered by scaling the numbers already on the board and dividing each part's load by its plan, not by a feeling.
- **Story:** The interviewer asks "10x traffic?". The candidate multiplies every number (board: 1M opens/s), divides load by plan (board: db 8.8x plan, ringed), then offers a fix (99% hits). The interviewer asks about the cost. Verdict: "Scale it, find the break, fix it".
- **Numbers:** Wasla (chapters 20.2 and 20.4): 100,000 opens and 1,000 creates a second, 90% hit rate, 5 partitions, plan 2,500 operations a second per node. At 10x: 1,000,000 opens and 10,000 creates, misses 100,000, database 110,000 a second, 22,000 on each of 5 partitions, 22,000 / 2,500 = 8.8.
- **Sources:** Course numbers (chapter 20.2 fold); arithmetic checked in `agent-ip/work/system-design/playable-specs/m28.md`.
