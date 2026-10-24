# Canvas spec: sysdesign-m13-crdt-limit

- **Course and chapter:** system-design, 13.7 beat 7 ("What a CRDT cannot promise").
- **Renderer:** `scene` (data only).
- **Claim:** A CRDT converges, but it cannot enforce a rule that needs a global view, such as a balance that must stay above zero.
- **Story:** Both replicas show 100. Each approves an 80 withdrawal and shows 20. They merge: 100 - 80 - 80 = -60. Verdict: "Both withdrawals OK; balance is -60".
- **Numbers:** 100 - 80 - 80 = -60.
- **Sources:** S74 and S75 (CRDTs give convergence, not invariants); the example is course arithmetic.
