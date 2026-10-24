# Canvas spec: sysdesign-m4-one-big-server

- **Course and chapter:** system-design, 4.1 beat 1 ("One big server, one restart").
- **Renderer:** `scene` (data only).
- **Claim:** With one server, any restart, crash or update takes the whole app down, however big the server is.
- **Story:** Students open notes; the big server queries the database and answers. The server starts a restart for an update. The next request gets an error page and the students' card says all 8,000 are out. Verdict: "One server down, every student out".
- **Numbers:** 8,000 students online; 400 requests a second; server capacity about 800 a second (50% busy). Made-up round numbers continuing Daftar from 1.1 (0.05 requests a second per student, 10 ms per request on a small server).
- **Sources:** Story arithmetic. The single-failure-domain framing follows the dossier's note on vertical scaling (Topic findings, Scaling out). Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
