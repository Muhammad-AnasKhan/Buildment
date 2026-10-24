# Canvas spec: sysdesign-m21-one-query-feed

- **Course and chapter:** system-design, 21.2 beat 4 (Why not build the feed in one query?).
- **Renderer:** `scene` (data only).
- **Claim:** Building a feed from scratch on every open costs one lookup per followed account, so the database load is feed opens a second times follows.
- **Story:** A phone opens the feed. The feed service asks the database for the latest posts of each of 150 accounts. The database drowns at peak. Verdict: "150 lookups for one feed open".
- **Numbers:** 17,361 feed opens a second at peak (50M daily users x 10 opens x 3 / 86,400) x 150 follows = 2.6 million lookups a second.
- **Sources:** Arithmetic on the chapter 21.1 assumptions; method from chapter 2.3.
