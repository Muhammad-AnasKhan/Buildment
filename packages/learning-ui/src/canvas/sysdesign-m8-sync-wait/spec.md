# Canvas spec: sysdesign-m8-sync-wait

- **Course and chapter:** system-design, 8.3 beat 2 ("Synchronous: wait for the copy").
- **Renderer:** `scene` (data only).
- **Claim:** A synchronous follower adds its round trip to every write, and no acknowledged write is lost to one crash.
- **Story:** The client posts. The leader saves and sends the copy to a follower in another region. The client waits while the copy travels and the confirmation returns, about 60 ms. Then it hears OK. Verdict: "Slower write, nothing lost".
- **Numbers:** 60 ms North America East to West round trip [S3]; 0.25 ms within a region [S3].
- **Sources:** napkin-math latency table [S3]; PostgreSQL: the minimum wait is the primary to standby round trip [S38].
