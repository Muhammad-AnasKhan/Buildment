# Canvas spec: sysdesign-m23-scan-vs-index

- **Course and chapter:** system-design, 23.2 beat 1 ("Scanning every product takes seconds").
- **Renderer:** `scene` (data only).
- **Claim:** Answering a text query by reading every product is too slow; an index with a list of products per word reads only what the query needs.
- **Story:** The phone sends "red shoes". The catalogue scans 200 GB and the wait ring counts to 10 s. Then the same query goes to the index, which reads two lists and returns product ids 1 and 3. Verdict: "The index skips the scan".
- **Numbers:** 200 million products x 1 KB = 200 GB. Memory sequential read of 1 MB in about 50 microseconds, so 200,000 MB x 50 microseconds = 10 s (napkin-math, S3, with its 2 to 3 times caveat). Course assumptions: 200 million products, 1 KB of text each.
- **Sources:** S3 for the read speed.
