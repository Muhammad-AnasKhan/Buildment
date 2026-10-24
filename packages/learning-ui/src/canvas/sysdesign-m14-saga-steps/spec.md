# Canvas spec: sysdesign-m14-saga-steps

- **Course and chapter:** system-design, 14.3 beat 1 (Small commits in a row).
- **Renderer:** `scene` (data only).
- **Claim:** A saga replaces one distributed transaction with a chain of local ones. Each step is final the moment it commits.
- **Story:** Stock reserves one bag and commits. Payments charges 18 and commits. Courier books a van and commits. Verdict: three small commits, no big lock.
- **Numbers:** Course numbers: 1 bag, 18 for the price.
- **Sources:** S78 (Garcia-Molina and Salem) for the idea of a chain of transactions.
