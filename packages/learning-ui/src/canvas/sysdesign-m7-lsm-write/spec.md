# Canvas spec: sysdesign-m7-lsm-write

- **Course and chapter:** system-design, 7.3 beat 4.
- **Renderer:** `scene` (data only).
- **Claim:** An LSM tree turns random writes into sequential ones: append to a log, update memory, and flush a sorted file.
- **Story:** Two writes go to the log and the memory table. At 4 of 4 keys the memory table is flushed to a sorted file, and a new empty one starts.
- **Numbers:** Memory table size 4 keys (toy).
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** RocksDB overview: memtable, write-ahead log, flush to sorted files, compaction [S37].
