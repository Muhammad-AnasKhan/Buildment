# Canvas spec: sysdesign-m23-typo-filter

- **Course and chapter:** system-design, 23.4 beat 1 ("A sure no skips every shard").
- **Renderer:** `scene` (data only).
- **Claim:** A Bloom filter of every known word lets the search coordinator answer "no results" for a word that does not exist without asking any shard. A "maybe" runs the normal search.
- **Story:** Query "shoez": the filter says never seen, the phone gets "no" and no shard is called. Query "shoes": the filter says maybe, all eight shards are asked and results return. Verdict: "A sure no skips all 8 shards".
- **Numbers:** 100 million known words x 10 bits = 1 billion bits = 125 MB (course assumption: 100 million distinct words). Eight shards from 23.2 (80 GB index in 10 GB shards).
- **Sources:** Bloom filters: S113. Bloom filters in LSM trees: chapter 7.3 (not repeated).
