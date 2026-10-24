# Canvas spec: sysdesign-m5-lru-evict

- **Course and chapter:** system-design, 5.4 beat 1 ("A full cache must drop something").
- **Renderer:** `scene` (data only).
- **Claim:** When a cache is full, a new item pushes an old one out. LRU (least recently used) drops the item whose last use is oldest.
- **Story:** The cache holds A, B, C, written from oldest use to newest ("old: A B C"). A read of A moves A to the new end ("old: B C A"). Setting D needs a slot, so B goes to the Evicted card. Verdict: "B was used longest ago, so B goes".
- **Numbers:** a three-item cache, chosen to fit the picture.
- **Sources:** Redis eviction policies, and that Redis approximates LRU and LFU by sampling [S27].
