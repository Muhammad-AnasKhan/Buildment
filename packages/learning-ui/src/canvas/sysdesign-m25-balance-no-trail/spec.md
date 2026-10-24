# Canvas spec: sysdesign-m25-balance-no-trail

- **Course and chapter:** system-design, 25.3 beat 1 ("A balance column has no history").
- **Renderer:** `scene` (data only).
- **Claim:** A single balance number, updated in place, cannot explain itself. When a retry subtracts twice, nothing shows which step did it.
- **Story:** A refund of 30 runs, the balance goes 100 to 70. A retry subtracts 30 again: 40. Support asks why 40 and the database can only answer "just 40". Verdict: "A balance with no history".
- **Numbers:** 100, 30, 70, 40 (course example).
- **Sources:** Course story. Retries of a non-idempotent operation: [S89].
