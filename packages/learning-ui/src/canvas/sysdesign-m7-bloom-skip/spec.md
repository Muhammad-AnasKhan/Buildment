# Canvas spec: sysdesign-m7-bloom-skip

- **Course and chapter:** system-design, 7.3 beat 6.
- **Renderer:** `scene` (data only).
- **Claim:** A Bloom filter cuts the files a point read must open, at the cost of a little memory per key.
- **Story:** A read for ticket 9 asks the filters of three files. The first two say no and are skipped. The third says maybe and is read, and the ticket is found.
- **Numbers:** 3 files, 1 read. About 1% false positives at 10 bits per key.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Bloom filters: false positives, no false negatives [S113]; RocksDB Bloom filter page: about 10 bits per key gives about a 1% false positive rate, and whole-key filters help point lookups only (read 2026-10-24).
