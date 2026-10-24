# Canvas spec: sysdesign-m19-global-commit

- **Course and chapter:** system-design, 19.6 beat 2 ("A global write waits for the nearest other region").
- **Renderer:** `scene` (data only).
- **Claim:** A database with copies in three regions and a majority rule makes every write wait for the nearest other region. A leader in EU West pays the 80 ms round trip to North America East.
- **Story:** A customer in EU West saves an order. The leader sends the write to NA East and NA West. NA East answers first; with the leader that is 2 of 3, so the leader says ok. A wait ring counts to 80 ms. Verdict: "OK after the nearest copy answers".
- **Numbers:** EU West to North America East round trip 80 ms [S3]. Majority of 3 is 2 (module 12).
- **Sources:** [S3] latency table; 8.3 for the cost of waiting for a copy; 12.3 for quorums.
