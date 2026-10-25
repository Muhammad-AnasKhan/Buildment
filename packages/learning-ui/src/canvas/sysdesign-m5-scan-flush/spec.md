# Canvas spec: sysdesign-m5-scan-flush

- **Course and chapter:** system-design, 5.4 beat 2 ("One scan can flush LRU").
- **Renderer:** `scene` (data only).
- **Claim:** LRU only knows when a key was last used, not how often. A one-time scan of many keys makes every scanned key look recent and pushes out a key that is read all day. LFU (least frequently used) counts uses and keeps the hot key.
- **Story:** Shoppers read A (hit, "A is hot"). A report job reads rows 1 to 3 once each; the cache fills with rows and A goes to the Evicted card. The next shopper read of A misses. Verdict: "LRU forgot A after one scan".
- **Numbers:** none; three rows stand for a large scan.
- **Sources:** Redis eviction policies, `allkeys-lru` and `allkeys-lfu`, approximated by sampling [S27].
