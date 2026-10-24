# Canvas spec: sysdesign-m27-merge-total

- **Course and chapter:** system-design, 27.5 beat 4 ("Merge the shards every few seconds").
- **Renderer:** `scene` (data only).
- **Claim:** A periodic merge folds the shards into one total row, so the page reads one row and the count is at most one merge interval late.
- **Story:** The merger reads shards 412, 398 and 394, adds them to 1,204, writes "+1,204" to the total (1,203,127 + 1,204 = 1,204,331), and the shards show "now 0". Verdict: "Page reads one row, a bit late".
- **Numbers:** 5 second merge interval (course number); shard values are illustrative.
- **Sources:** none beyond the course design. The race (subtract what was read) is the code exercise in chapter 27.6.
