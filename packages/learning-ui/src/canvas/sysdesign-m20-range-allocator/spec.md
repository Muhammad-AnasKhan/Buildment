# Canvas spec: sysdesign-m20-range-allocator

- **Course and chapter:** system-design, 20.3 beat 4 ("Claim a block, then work alone").
- **Renderer:** `scene` (data only).
- **Claim:** If each app claims a block of numbers from a shared table, the table sees one trip per block and no two apps ever share a number.
- **Story:** App 1 claims 1M numbers (0 to 999,999), App 2 claims the next 1M. Each then uses its block without asking again. Verdict: "No clash, one trip per 1M codes".
- **Numbers:** Block size 1,000,000 is a course number.
- **Sources:** Course reasoning; the code exercise in 20.5 builds this.
