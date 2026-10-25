# Canvas spec: sysdesign-m20-read-path

- **Course and chapter:** system-design, 20.4 beat 1 ("A miss takes three trips").
- **Renderer:** `scene` (data only).
- **Claim:** With cache-aside, a hit costs one trip and a miss costs three: look in the cache, read the database, store in the cache.
- **Story:** The phone asks for /aB3x9Kp. The service looks in the cache (miss), reads the database, stores the answer in the cache and redirects. Verdict: "Miss: 3 trips. Next time: 1 trip".
- **Numbers:** Hit 0.55 ms and miss 3.05 ms at the redirect service (course numbers built from S3: 0.05 ms proxy hop, 0.5 ms cache query, and a 2 ms database read assumed for a big table).
- **Sources:** S26 (lazy loading: three trips on a miss); S3 for the 0.5 ms and 0.05 ms.
