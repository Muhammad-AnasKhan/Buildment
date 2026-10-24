# Canvas spec: sysdesign-m8-read-spread

- **Course and chapter:** system-design, 8.2 beat 3 ("Reads can go to any copy").
- **Renderer:** `scene` (data only).
- **Claim:** Followers add read capacity. They do not add write capacity.
- **Story:** The app sends one write to the leader and two reads to the two followers at the same time, twice. Each node shows how many requests it served. Verdict: "Reads spread; writes use one node".
- **Numbers:** none
- **Sources:** Aurora replicas serve reads, up to 15 [S39]; PostgreSQL hot standby serves read-only queries [S38].
