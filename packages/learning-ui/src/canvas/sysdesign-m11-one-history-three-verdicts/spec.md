# Canvas spec: sysdesign-m11-one-history-three-verdicts

- **Course and chapter:** system-design, 11.4, beat 1 "One history, three verdicts".
- **Renderer:** custom beat canvas on `BeatFrame`, drawn with the shared history picture (`primitives/history-view.tsx`) and `BeatSegmented` tabs. Presets and banner rules: `models/three-verdicts.ts`; checkers: `models/history.ts`.
- **Claim:** The same history can pass one model and fail a stronger one. Each stronger model rejects everything the weaker one rejects, and more.
- **Model:** four presets, start value 0: Fresh read, Stale read, Two readers (4 reads, 3 values each), Reply first (keys q and r, values drawn as none, Q, R). Linearizable keeps real time (a.end < b.start) and the register rule; sequential keeps only each client's own order; causal keeps program order plus "a write before every read that returned its value", closed under chaining, and needs a legal order of all writes plus the client's own reads for every client.
- **Check points (counted by the checkers over every combination, tested):** Fresh 2 combinations (1 yes,yes,yes; 1 no,yes,yes); Stale the same; Two readers 81 (45 no,yes,yes; 2 no,no,yes; 32 no,no,no; 2 yes,yes,yes); Reply first 8 (6 no,yes,yes; 1 no,no,no; 1 yes,yes,yes).
- **Inputs:** tap a preset tab; tap a read bar. Two controls outside the picture: the History tabs and Reset. Hint: "Tap a read to change its value."
- **What moves:** the three chips flip between yes (green) and no (red), each with the word; the read bar's value changes; the smallest set of reads that makes the weakest failing model fail is ringed in red. (Interpretation: the spec says "the strongest model that fails"; the ring explains the weakest model that fails, because that is the violation every stronger model also contains.)
- **Verdicts (banner):** "All three models allow this", "Linearizable fails; the others pass", "Only causal still allows this", "All three models reject this".
- **Accessibility:** each changeable read is a button with its value; the SVG description lists every operation and the three verdicts.
- **Sources:** [S46], [S47], [S48], [S49], [S51]. Counts come from a brute-force run for this course.
