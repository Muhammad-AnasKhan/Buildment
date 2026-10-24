# Canvas spec: sysdesign-m17-blind-outage

- **Course and chapter:** system-design, 17.1 beat 1 (Slow, and nobody can say where).
- **Renderer:** `scene` (data only).
- **Claim:** A team with one CPU graph and a pile of log files can see that users are unhappy and still cannot say which part of the system is slow.
- **Story:** Customers message support; support passes it to the on-call team; the team checks the dashboard (CPU 35%, fine) and the log files (9,400 lines, three servers) and finds nothing. Verdict: "Slow, and nobody can say where".
- **Numbers:** Course numbers only (112 messages, 35% CPU, 9,400 lines). Souq Express is a made-up delivery app.
- **Sources:** none needed; a course composite.
