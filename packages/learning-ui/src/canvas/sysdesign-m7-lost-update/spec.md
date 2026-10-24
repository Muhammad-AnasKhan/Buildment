# Canvas spec: sysdesign-m7-lost-update

- **Course and chapter:** system-design, 7.4 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A lost update happens when two transactions read the same value, then each writes a number computed from what it read. The later write silently replaces the earlier one.
- **Story:** Both read 100. Amna writes 150. Bilal writes 130. The final balance is 130, but 180 was owed.
- **Numbers:** 100 + 50 + 30 = 180 expected. 130 stored.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Lost update as the problem snapshot isolation's first-committer-wins prevents (Jepsen, snapshot isolation, read 2026-10-24) [S46].
