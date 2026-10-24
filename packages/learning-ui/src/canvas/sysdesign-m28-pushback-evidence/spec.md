# Canvas spec: sysdesign-m28-pushback-evidence

- **Course and chapter:** system-design, 28.3 beat 3 ("When the interviewer disagrees, bring a number").
- **Renderer:** `scene` (data only).
- **Claim:** When an interviewer prefers another design, the strongest reply is a number that separates the two, and a willingness to agree where the numbers say so.
- **Story:** The interviewer asks "why not one db?". The candidate says "do the sum", sends 101,000 ops/s and "one node: 2,500", and says "40x its plan". The interviewer says "fair, go on". Verdict: "Answer a view with a number".
- **Numbers:** 100,000 opens + 1,000 creates = 101,000 database operations a second with no cache; one node planned for 2,500 (chapter 20.2); 101,000 / 2,500 = 40.4.
- **Sources:** Chapter 20.2 (course numbers) and chapter 2.5 for planning a node at about half busy.
