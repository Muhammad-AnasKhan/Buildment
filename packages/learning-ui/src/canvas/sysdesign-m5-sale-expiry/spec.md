# Canvas spec: sysdesign-m5-sale-expiry

- **Course and chapter:** system-design, 5.1 beat 1 ("The copy expires at peak").
- **Renderer:** `scene` (data only).
- **Claim:** A cache that serves almost every read also hides how much load the database would get without it. When a hot copy expires at peak, every request in the next moments misses at once, and the database gets the full traffic.
- **Story:** Matjar (a fictional shop) serves its sale page through the cache: one request, one hit. The copy expires. Three requests (standing for thousands) all miss and all query the database, which turns red at 5,000 queries a second. A request times out and the shoppers refresh. Verdict: "One expiry, and the database falls".
- **Numbers:** made-up story numbers, labelled as such in the chapter: 5,000 page requests a second; a 50 ms page query; a database that can do about 800 of those queries a second. In the 50 ms of one query, 5,000 x 0.05 = 250 more requests arrive and miss (Little's law, from chapter 2.5).
- **Sources:** Facebook's look-aside cache and its thundering herd problem [S24]; cache stampede definition [S25]. See the research dossier.
