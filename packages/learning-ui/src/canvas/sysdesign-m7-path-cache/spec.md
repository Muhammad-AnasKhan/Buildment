# Canvas spec: sysdesign-m7-path-cache

- **Course and chapter:** system-design, 7.6 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A cache lowers read load on the database by the hit rate: at 90%, the database serves one tenth of the reads.
- **Story:** Ten reads reach the cache. Nine are answered there. One goes on to the database.
- **Numbers:** Hit rate 90% (assumed). 10 reads, 9 hits, 1 miss.
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. Cache patterns and hit rate: module 5. Facebook's leases cut peak database queries from 17K/s to 1.3K/s [S24].
