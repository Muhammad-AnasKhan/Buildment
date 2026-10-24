# Canvas spec: sysdesign-m5-herd

- **Course and chapter:** system-design, 5.6 beat 1 ("A hot key expires: everyone misses").
- **Renderer:** `scene` (data only).
- **Claim:** When a hot key expires, every request that arrives before the copy is stored again misses and sends the same query. The number of duplicate queries is the request rate times the time to rebuild the copy (Little's law).
- **Story:** The sale page's copy expires (tag "expiry"). The first request misses and starts a 50 ms query. More requests arrive, miss and send queries 2 and 3; the database ends with "250 x one query" (tag "250 queries by 50 ms"). Verdict: "250 queries for one key".
- **Numbers:** made-up story numbers: 5,000 requests a second, a 50 ms rebuild. 5,000 x 0.05 = 250. The formula L = lambda W is chapter 2.5's Little's law [S5].
- **Sources:** cache stampede definition [S25]; Facebook's thundering herds on hot keys [S24].
