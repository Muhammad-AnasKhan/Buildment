# Canvas spec: sysdesign-m11-reply-waits

- **Course and chapter:** system-design, 11.4 beat 4 ("The reply carries its question").
- **Renderer:** `scene` (data only).
- **Claim:** If a write carries what its writer had seen, a reader can hold the effect back until its cause is visible. That keeps related writes in order.
- **Story:** The reader gets the reply, which says it follows question 1. The reader asks the questions copy for question 1, waits 120 ms until it arrives, and then shows the question and the reply together. Verdict: "Question first, then the reply".
- **Numbers:** 120 ms is a course number.
- **Sources:** Writes-follow-reads from Terry et al. 1994 [S50]; Jepsen: causal consistency implies writes-follow-reads [S46].
